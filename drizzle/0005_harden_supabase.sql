ALTER EXTENSION vector SET SCHEMA extensions;--> statement-breakpoint
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
