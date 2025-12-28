-- Create updated_at function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create shopping_products table for Online Shopping feature
CREATE TABLE public.shopping_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_my TEXT NOT NULL,
  description_en TEXT,
  description_my TEXT,
  price_thb NUMERIC NOT NULL,
  price_mmk NUMERIC,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shopping_products ENABLE ROW LEVEL SECURITY;

-- Create policies for shopping_products
CREATE POLICY "Anyone can view active shopping products"
ON public.shopping_products
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage shopping products"
ON public.shopping_products
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_shopping_products_updated_at
BEFORE UPDATE ON public.shopping_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Deactivate Gift Cards category
UPDATE public.categories SET is_active = false WHERE type = 'gift_card';