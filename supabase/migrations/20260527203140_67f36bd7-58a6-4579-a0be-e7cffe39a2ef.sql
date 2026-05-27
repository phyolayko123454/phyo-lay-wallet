
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-qr', 'payment-qr', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Anyone can view payment QR"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-qr');

CREATE POLICY "Auth users can upload payment QR"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-qr');

CREATE POLICY "Auth users can update payment QR"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-qr');

CREATE POLICY "Auth users can delete payment QR"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment-qr');
