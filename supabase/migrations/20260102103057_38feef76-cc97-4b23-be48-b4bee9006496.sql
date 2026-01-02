-- Add email column to profiles for username login lookup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Create function to get user email by username
CREATE OR REPLACE FUNCTION public.get_user_email_by_username(p_username text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE username = p_username LIMIT 1;
$$;

-- Update existing profiles with email from auth.users
UPDATE public.profiles p
SET email = (
  SELECT email FROM auth.users u WHERE u.id = p.id
)
WHERE p.email IS NULL;

-- Update handle_new_user trigger to also store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile with email
  INSERT INTO public.profiles (id, username, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', NEW.email),
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  
  -- Create wallet
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;