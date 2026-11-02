-- Saudi Riyal is the single main currency. No exchange-rate conversion is applied.
ALTER TABLE public.parts ALTER COLUMN currency SET DEFAULT 'SAR';
ALTER TABLE public.bookings ALTER COLUMN currency SET DEFAULT 'SAR';
UPDATE public.parts SET currency = 'SAR' WHERE currency IS NULL OR currency = 'AED';
UPDATE public.bookings SET currency = 'SAR' WHERE currency IS NULL OR currency = 'AED';
