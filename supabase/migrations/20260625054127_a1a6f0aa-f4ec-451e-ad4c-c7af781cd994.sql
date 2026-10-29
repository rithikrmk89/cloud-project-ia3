CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

GRANT USAGE ON SCHEMA private TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

DROP POLICY IF EXISTS "Admins view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins view all roles" ON public.user_roles
FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage services" ON public.service_categories;
CREATE POLICY "Admins manage services" ON public.service_categories
FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'))
WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Approved providers public read" ON public.providers;
DROP POLICY IF EXISTS "Admins update providers" ON public.providers;
CREATE POLICY "Approved providers public read" ON public.providers
FOR SELECT TO anon, authenticated
USING (status = 'approved' OR auth.uid() = id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update providers" ON public.providers
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users update own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR auth.uid() = provider_id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own bookings" ON public.bookings
FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR auth.uid() = provider_id OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Invoices visible to booking parties" ON public.invoices;
CREATE POLICY "Invoices visible to booking parties" ON public.invoices
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = invoices.booking_id
      AND (b.user_id = auth.uid() OR b.provider_id = auth.uid())
  )
  OR private.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Users view own complaints" ON public.complaints;
DROP POLICY IF EXISTS "Admins update complaints" ON public.complaints;
CREATE POLICY "Users view own complaints" ON public.complaints
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update complaints" ON public.complaints
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));