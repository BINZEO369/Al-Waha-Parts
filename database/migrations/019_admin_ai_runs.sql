-- AI actions are auditable and do not receive public write access.
CREATE TABLE IF NOT EXISTS public.admin_ai_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.admins(id) ON DELETE RESTRICT,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'preview' CHECK (status IN ('preview', 'approved', 'rejected', 'failed')),
  input_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_ai_runs_admin_created_idx
  ON public.admin_ai_runs (admin_id, created_at DESC);

ALTER TABLE public.admin_ai_runs ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON TABLE public.admin_ai_runs TO service_role;
