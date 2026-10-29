
DO $$
DECLARE
  uid uuid := gen_random_uuid();
  pid uuid := gen_random_uuid();
  cat uuid;
BEGIN
  SELECT id INTO cat FROM public.service_categories ORDER BY display_order LIMIT 1;

  -- DEMO USER
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email='user@demo.in') THEN
    INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated','user@demo.in',crypt('123456',gen_salt('bf')),now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo User","phone":"9000000001","area":"Demo Area","address":"123 Demo St","role":"user"}'::jsonb,
      now(),now(),'','','','');
    INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
    VALUES (gen_random_uuid(),uid,jsonb_build_object('sub',uid::text,'email','user@demo.in'),'email',uid::text,now(),now(),now());
    INSERT INTO public.profiles (id,full_name,email,phone,area,address) VALUES (uid,'Demo User','user@demo.in','9000000001','Demo Area','123 Demo St') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id,role) VALUES (uid,'user'::app_role) ON CONFLICT DO NOTHING;
  END IF;

  -- DEMO PROVIDER (pre-approved)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email='provider@demo.in') THEN
    INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,email_change,email_change_token_new,recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000',pid,'authenticated','authenticated','provider@demo.in',crypt('123456',gen_salt('bf')),now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Provider","phone":"9000000002","area":"Demo Area","address":"456 Service Rd","role":"provider"}'::jsonb,
      now(),now(),'','','','');
    INSERT INTO auth.identities (id,user_id,identity_data,provider,provider_id,last_sign_in_at,created_at,updated_at)
    VALUES (gen_random_uuid(),pid,jsonb_build_object('sub',pid::text,'email','provider@demo.in'),'email',pid::text,now(),now(),now());
    INSERT INTO public.profiles (id,full_name,email,phone,area,address) VALUES (pid,'Demo Provider','provider@demo.in','9000000002','Demo Area','456 Service Rd') ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id,role) VALUES (pid,'provider'::app_role) ON CONFLICT DO NOTHING;
    INSERT INTO public.providers (id,age,service_category_id,experience_years,status,bio)
      VALUES (pid,30,cat,5,'approved','Experienced demo provider — ready to accept jobs!')
      ON CONFLICT (id) DO UPDATE SET status='approved';
  END IF;
END $$;
