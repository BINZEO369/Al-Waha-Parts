-- Customer-to-admin threaded messaging.
-- Customer access is token-based; only a SHA-256 token hash is stored.

BEGIN;

CREATE TABLE IF NOT EXISTS public.customer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  access_token_hash text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'admin')),
  admin_id uuid REFERENCES public.admins(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text,
  customer_phone text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  reply_to_id uuid REFERENCES public.customer_messages(id) ON DELETE SET NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS customer_messages_thread_created_idx
  ON public.customer_messages (thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS customer_messages_status_created_idx
  ON public.customer_messages (status, created_at DESC);
CREATE INDEX IF NOT EXISTS customer_messages_access_token_idx
  ON public.customer_messages (access_token_hash);

ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_messages FORCE ROW LEVEL SECURITY;
REVOKE ALL PRIVILEGES ON TABLE public.customer_messages FROM anon, authenticated;
GRANT ALL PRIVILEGES ON TABLE public.customer_messages TO service_role;

COMMENT ON TABLE public.customer_messages IS 'Threaded customer/admin messages. Public access is mediated by API token verification; raw access tokens are never stored.';

COMMIT;
