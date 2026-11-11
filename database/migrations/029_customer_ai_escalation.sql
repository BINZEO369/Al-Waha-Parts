-- Autonomous customer assistant messages and explicit human-escalation flags.
BEGIN;
ALTER TABLE public.customer_messages
  DROP CONSTRAINT IF EXISTS customer_messages_sender_type_check;
ALTER TABLE public.customer_messages
  ADD CONSTRAINT customer_messages_sender_type_check
  CHECK (sender_type IN ('customer', 'admin', 'assistant'));
ALTER TABLE public.customer_messages
  ADD COLUMN IF NOT EXISTS handled_by_ai boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS needs_admin boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS escalation_reason text;
CREATE INDEX IF NOT EXISTS customer_messages_needs_admin_idx
  ON public.customer_messages (needs_admin, status, created_at DESC)
  WHERE needs_admin = true;
COMMENT ON COLUMN public.customer_messages.needs_admin IS 'True when automation could not safely complete the request and staff attention is required.';
COMMIT;
