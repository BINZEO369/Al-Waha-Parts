-- Customer message threads expire three days after the first message.
-- Replies inherit the original thread expiry; activity never extends retention.

BEGIN;

ALTER TABLE public.customer_messages
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

UPDATE public.customer_messages
SET expires_at = created_at + interval '3 days'
WHERE expires_at IS NULL;

ALTER TABLE public.customer_messages
  ALTER COLUMN expires_at SET DEFAULT (now() + interval '3 days'),
  ALTER COLUMN expires_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS customer_messages_expires_at_idx
  ON public.customer_messages (expires_at);

CREATE OR REPLACE FUNCTION public.delete_expired_customer_messages()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.customer_messages WHERE expires_at <= now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_expired_customer_messages() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_expired_customer_messages() TO service_role;

COMMIT;

-- Supabase provides pg_cron as an available extension. Run the cleanup every 15 minutes.
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'alwaha-delete-expired-customer-messages',
  '*/15 * * * *',
  $$SELECT public.delete_expired_customer_messages();$$
)
WHERE NOT EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'alwaha-delete-expired-customer-messages'
);
