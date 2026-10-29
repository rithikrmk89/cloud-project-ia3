
-- Roles enum
CREATE TYPE public.app_role AS ENUM ('user', 'provider', 'admin');
CREATE TYPE public.provider_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.booking_status AS ENUM ('pending', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.invoice_status AS ENUM ('draft', 'sent', 'paid');
CREATE TYPE public.complaint_status AS ENUM ('open', 'in_review', 'resolved', 'closed');

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

-- =================== PROFILES ===================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  area TEXT,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =================== USER ROLES ===================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =================== SIGNUP TRIGGER ===================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, area, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'area',
    NEW.raw_user_meta_data->>'address'
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'user'));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================== SERVICE CATEGORIES ===================
CREATE TABLE public.service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  color TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_categories TO anon, authenticated;
GRANT ALL ON public.service_categories TO service_role;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services public read" ON public.service_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage services" ON public.service_categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed services
INSERT INTO public.service_categories (name, slug, icon, description, color, display_order) VALUES
('Electrician','electrician','Zap','Wiring, repair, fittings','#FFC107',1),
('Plumber','plumber','Droplet','Pipes, leaks, taps','#3B82F6',2),
('Carpenter','carpenter','Hammer','Furniture, woodwork','#92400E',3),
('Painter','painter','Paintbrush','Interior, exterior painting','#EC4899',4),
('AC Repair','ac-repair','Snowflake','Servicing, gas refill','#06B6D4',5),
('Washing Machine','washing-machine','WashingMachine','Repair & service','#8B5CF6',6),
('Refrigerator','refrigerator','Refrigerator','Cooling, gas, repair','#0EA5E9',7),
('TV Repair','tv-repair','Tv','LED, LCD, Smart TV','#10B981',8),
('Water Purifier','water-purifier','GlassWater','Service & filters','#14B8A6',9),
('Home Cleaning','home-cleaning','Sparkles','Full home cleaning','#FFC107',10),
('Deep Cleaning','deep-cleaning','SprayCan','Thorough deep clean','#F59E0B',11),
('Bathroom Cleaning','bathroom-cleaning','ShowerHead','Stain & germ removal','#22D3EE',12),
('Kitchen Cleaning','kitchen-cleaning','Utensils','Chimney, grease','#F97316',13),
('Sofa Cleaning','sofa-cleaning','Sofa','Fabric & leather','#A855F7',14),
('Gardening','gardening','Trees','Landscape & care','#22C55E',15),
('Pest Control','pest-control','Bug','Cockroach, termite','#DC2626',16),
('CCTV Install','cctv','Camera','Cameras & DVR','#475569',17),
('Furniture Assembly','furniture-assembly','Wrench','Assembly & fix','#7C3AED',18),
('Bike Mechanic','bike-mechanic','Bike','Repair & service','#EAB308',19),
('Computer Repair','computer-repair','Laptop','Hardware & software','#0EA5E9',20);

-- =================== PROVIDERS ===================
CREATE TABLE public.providers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age INT,
  service_category_id UUID REFERENCES public.service_categories(id),
  experience_years INT,
  id_proof_url TEXT,
  bio TEXT,
  status public.provider_status NOT NULL DEFAULT 'pending',
  available BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  total_jobs INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.providers TO authenticated;
GRANT SELECT ON public.providers TO anon;
GRANT ALL ON public.providers TO service_role;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved providers public read" ON public.providers FOR SELECT TO anon, authenticated USING (status = 'approved' OR auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Provider insert own" ON public.providers FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Provider update own" ON public.providers FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins update providers" ON public.providers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER providers_updated_at BEFORE UPDATE ON public.providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =================== BOOKINGS ===================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id),
  service_category_id UUID REFERENCES public.service_categories(id),
  area TEXT,
  address TEXT NOT NULL,
  notes TEXT,
  status public.booking_status NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = provider_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id OR auth.uid() = provider_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =================== INVOICES ===================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
  material_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) GENERATED ALWAYS AS (service_charge + material_cost) STORED,
  notes TEXT,
  status public.invoice_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Invoices visible to booking parties" ON public.invoices FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND (b.user_id = auth.uid() OR b.provider_id = auth.uid()))
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Providers create invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_id AND b.provider_id = auth.uid())
);

-- =================== REVIEWS ===================
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users create own reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- =================== COMPLAINTS ===================
CREATE TABLE public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status public.complaint_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own complaints" ON public.complaints FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users create complaints" ON public.complaints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update complaints" ON public.complaints FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER complaints_updated_at BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =================== PROVIDER GALLERY ===================
CREATE TABLE public.provider_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.provider_gallery TO authenticated;
GRANT SELECT ON public.provider_gallery TO anon;
GRANT ALL ON public.provider_gallery TO service_role;
ALTER TABLE public.provider_gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery public read" ON public.provider_gallery FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Provider manage own gallery" ON public.provider_gallery FOR ALL TO authenticated USING (auth.uid() = provider_id) WITH CHECK (auth.uid() = provider_id);

-- =================== STORAGE POLICIES ===================
CREATE POLICY "Avatar public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatar user upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatar user update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "ID proof owner read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'id-proofs' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "ID proof upload own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'id-proofs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Gallery public read" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Gallery owner upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Gallery owner delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'gallery' AND (storage.foldername(name))[1] = auth.uid()::text);
