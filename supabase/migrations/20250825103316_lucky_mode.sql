/*
  # Create user profiles table for username-based authentication

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for authenticated users to manage their own profiles

  3. Functions
    - Function to handle user profile creation on signup
    - Function to authenticate with username/password
    - Function to change password
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to authenticate with username
CREATE OR REPLACE FUNCTION public.authenticate_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE(user_id UUID, email TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by username
  SELECT au.id, au.email, au.encrypted_password
  INTO user_record
  FROM auth.users au
  JOIN public.user_profiles up ON au.id = up.id
  WHERE up.username = p_username
  AND au.deleted_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid username or password';
  END IF;

  -- Verify password using crypt function
  IF NOT (user_record.encrypted_password = crypt(p_password, user_record.encrypted_password)) THEN
    RAISE EXCEPTION 'Invalid username or password';
  END IF;

  -- Return user info
  RETURN QUERY SELECT user_record.id, user_record.email;
END;
$$;

-- Function to change password
CREATE OR REPLACE FUNCTION public.change_user_password(
  p_current_password TEXT,
  p_new_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_record RECORD;
  new_encrypted_password TEXT;
BEGIN
  -- Get current user
  SELECT au.id, au.encrypted_password
  INTO user_record
  FROM auth.users au
  WHERE au.id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Verify current password
  IF NOT (user_record.encrypted_password = crypt(p_current_password, user_record.encrypted_password)) THEN
    RAISE EXCEPTION 'Current password is incorrect';
  END IF;

  -- Generate new encrypted password
  new_encrypted_password := crypt(p_new_password, gen_salt('bf'));

  -- Update password
  UPDATE auth.users
  SET encrypted_password = new_encrypted_password,
      updated_at = now()
  WHERE id = auth.uid();

  RETURN TRUE;
END;
$$;

-- Function to get username by user id
CREATE OR REPLACE FUNCTION public.get_username_by_id(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  username_result TEXT;
BEGIN
  SELECT username INTO username_result
  FROM public.user_profiles
  WHERE id = user_id;
  
  RETURN username_result;
END;
$$;

-- Update timestamp trigger
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();