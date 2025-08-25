-- Fix security issues by setting search_path for functions

-- Update handle_savings_expense function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_savings_expense()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- If category contains "tabungan" (case insensitive), create savings entry
  IF LOWER(NEW.category) LIKE '%tabungan%' THEN
    INSERT INTO public.savings (expense_id, amount)
    VALUES (NEW.id, NEW.amount);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;