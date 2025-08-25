-- Create salaries table
CREATE TABLE public.salaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  salary_id UUID REFERENCES public.salaries(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create savings table (auto-populated from expenses with "tabungan" category)
CREATE TABLE public.savings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for salaries
CREATE POLICY "Users can view their own salaries" 
ON public.salaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own salaries" 
ON public.salaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own salaries" 
ON public.salaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own salaries" 
ON public.salaries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for savings
CREATE POLICY "Users can view their own savings" 
ON public.savings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.expenses 
  WHERE expenses.id = savings.expense_id 
  AND expenses.user_id = auth.uid()
));

CREATE POLICY "Users can create savings entries" 
ON public.savings 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.expenses 
  WHERE expenses.id = savings.expense_id 
  AND expenses.user_id = auth.uid()
));

-- Create function to automatically create savings entry when expense contains "tabungan"
CREATE OR REPLACE FUNCTION public.handle_savings_expense()
RETURNS TRIGGER AS $$
BEGIN
  -- If category contains "tabungan" (case insensitive), create savings entry
  IF LOWER(NEW.category) LIKE '%tabungan%' THEN
    INSERT INTO public.savings (expense_id, amount)
    VALUES (NEW.id, NEW.amount);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic savings creation
CREATE TRIGGER create_savings_on_expense
  AFTER INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_savings_expense();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_salaries_updated_at
  BEFORE UPDATE ON public.salaries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();