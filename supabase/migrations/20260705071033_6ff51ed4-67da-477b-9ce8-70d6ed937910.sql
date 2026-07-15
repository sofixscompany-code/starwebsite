
-- Banners table for hero slider
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  subtitle TEXT,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active banners" ON public.banners
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert banners" ON public.banners
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update banners" ON public.banners
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete banners" ON public.banners
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER banners_updated_at BEFORE UPDATE ON public.banners
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for banners bucket: admins can manage, anyone authenticated read (via signed urls we don't need read policy for anon)
CREATE POLICY "Admins can upload banner files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update banner files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete banner files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read banner files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

-- Grant admin role to info.starcoaching@gmail.com if the user exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'info.starcoaching@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Auto-grant admin role when this specific email signs up in the future
CREATE OR REPLACE FUNCTION public.grant_admin_for_owner_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'info.starcoaching@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_grant_owner_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_for_owner_email();
