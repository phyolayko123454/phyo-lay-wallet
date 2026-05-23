
-- Game packages table
CREATE TABLE public.game_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_key TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_my TEXT NOT NULL,
  in_game_amount INTEGER NOT NULL,
  bonus_amount INTEGER DEFAULT 0,
  price_mmk NUMERIC NOT NULL,
  price_thb NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_game_packages_game_key ON public.game_packages(game_key);

ALTER TABLE public.game_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active packages"
  ON public.game_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins manage packages"
  ON public.game_packages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_game_packages_updated_at
  BEFORE UPDATE ON public.game_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Extend orders
ALTER TABLE public.orders
  ADD COLUMN package_id UUID,
  ADD COLUMN game_key TEXT,
  ADD COLUMN server_id TEXT,
  ADD COLUMN in_game_amount INTEGER;

-- Approve order: deduct wallet + mark approved (atomic)
CREATE OR REPLACE FUNCTION public.approve_order(p_order_id UUID, p_note TEXT DEFAULT NULL)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
  v_balance NUMERIC;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'order not found'; END IF;
  IF v_order.status <> 'pending' THEN RAISE EXCEPTION 'order not pending'; END IF;

  IF v_order.currency = 'MMK' THEN
    SELECT balance_mmk INTO v_balance FROM public.wallets WHERE user_id = v_order.user_id FOR UPDATE;
    IF COALESCE(v_balance, 0) < v_order.amount THEN
      RAISE EXCEPTION 'insufficient balance';
    END IF;
    UPDATE public.wallets SET balance_mmk = balance_mmk - v_order.amount, updated_at = now()
      WHERE user_id = v_order.user_id;
  ELSE
    SELECT balance_thb INTO v_balance FROM public.wallets WHERE user_id = v_order.user_id FOR UPDATE;
    IF COALESCE(v_balance, 0) < v_order.amount THEN
      RAISE EXCEPTION 'insufficient balance';
    END IF;
    UPDATE public.wallets SET balance_thb = balance_thb - v_order.amount, updated_at = now()
      WHERE user_id = v_order.user_id;
  END IF;

  UPDATE public.orders
    SET status = 'approved', processed_by = auth.uid(), processed_at = now(), admin_note = COALESCE(p_note, admin_note)
    WHERE id = p_order_id
    RETURNING * INTO v_order;

  INSERT INTO public.notifications(user_id, title, message, type)
  VALUES (v_order.user_id, 'Order Approved',
    'Your top-up order has been approved.', 'success');

  RETURN v_order;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_order(p_order_id UUID, p_note TEXT DEFAULT NULL)
RETURNS public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  UPDATE public.orders
    SET status = 'rejected', processed_by = auth.uid(), processed_at = now(),
        admin_note = COALESCE(p_note, admin_note)
    WHERE id = p_order_id AND status = 'pending'
    RETURNING * INTO v_order;

  IF NOT FOUND THEN RAISE EXCEPTION 'order not found or not pending'; END IF;

  INSERT INTO public.notifications(user_id, title, message, type)
  VALUES (v_order.user_id, 'Order Rejected',
    COALESCE(p_note, 'Your top-up order was rejected.'), 'error');

  RETURN v_order;
END;
$$;

-- Seed PUBG UC packages (MMK pricing typical Myanmar reseller range)
INSERT INTO public.game_packages (game_key, name_en, name_my, in_game_amount, bonus_amount, price_mmk, price_thb, sort_order) VALUES
('pubg', '60 UC', '60 UC', 60, 0, 3500, 35, 1),
('pubg', '325 UC', '325 UC', 325, 0, 17500, 175, 2),
('pubg', '660 UC', '660 UC', 660, 60, 35000, 350, 3),
('pubg', '1800 UC', '1800 UC', 1800, 300, 87500, 875, 4),
('pubg', '3850 UC', '3850 UC', 3850, 850, 175000, 1750, 5),
('pubg', '8100 UC', '8100 UC', 8100, 2100, 350000, 3500, 6),
('pubg', '16200 UC', '16200 UC', 16200, 4200, 700000, 7000, 7),
('pubg', '24300 UC', '24300 UC', 24300, 6300, 1050000, 10500, 8);

-- Seed Mobile Legends Diamond packages
INSERT INTO public.game_packages (game_key, name_en, name_my, in_game_amount, bonus_amount, price_mmk, price_thb, sort_order) VALUES
('mlbb', '11 Diamonds', '11 ဒိုင်းမွန်း', 11, 0, 950, 9, 1),
('mlbb', '22 Diamonds', '22 ဒိုင်းမွန်း', 22, 0, 1850, 18, 2),
('mlbb', '56 Diamonds', '56 ဒိုင်းမွန်း', 56, 0, 4400, 44, 3),
('mlbb', '112 Diamonds', '112 ဒိုင်းမွန်း', 112, 0, 8500, 85, 4),
('mlbb', '223 Diamonds', '223 ဒိုင်းမွန်း', 223, 0, 16500, 165, 5),
('mlbb', '336 Diamonds', '336 ဒိုင်းမွန်း', 336, 0, 24500, 245, 6),
('mlbb', '570 Diamonds', '570 ဒိုင်းမွန်း', 570, 0, 40000, 400, 7),
('mlbb', '1163 Diamonds', '1163 ဒိုင်းမွန်း', 1163, 0, 80000, 800, 8),
('mlbb', '2398 Diamonds', '2398 ဒိုင်းမွန်း', 2398, 0, 160000, 1600, 9),
('mlbb', '6042 Diamonds', '6042 ဒိုင်းမွန်း', 6042, 0, 400000, 4000, 10);
