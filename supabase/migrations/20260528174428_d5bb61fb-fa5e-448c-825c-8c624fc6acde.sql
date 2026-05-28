ALTER TABLE public.payment_methods
DROP CONSTRAINT IF EXISTS payment_methods_type_check;

ALTER TABLE public.payment_methods
ADD CONSTRAINT payment_methods_type_check
CHECK (
  type IN (
    'qr_code',
    'bank_transfer',
    'mobile_wallet',
    'kbz_bank',
    'aya_bank',
    'cb_bank',
    'uab_bank',
    'yoma_bank',
    'kbz_pay',
    'wave_pay',
    'aya_pay',
    'bank_mm',
    'scb',
    'kbank',
    'bbl',
    'ktb',
    'bay',
    'tmb',
    'gsb',
    'promptpay',
    'truemoney',
    'bank_th'
  )
);