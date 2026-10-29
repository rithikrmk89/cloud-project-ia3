
ALTER TABLE public.service_categories ADD COLUMN IF NOT EXISTS base_price numeric NOT NULL DEFAULT 0;

-- Detach providers and bookings from soon-to-be-deleted categories
UPDATE public.providers SET service_category_id = NULL;
DELETE FROM public.bookings WHERE service_category_id IS NOT NULL;
DELETE FROM public.service_categories;

INSERT INTO public.service_categories (name, slug, icon, color, display_order, base_price, description) VALUES
('Gardening','gardening','Trees','from-green-400 to-emerald-500',1,300,'Lawn care, planting & maintenance'),
('Babysitting','babysitting','Baby','from-pink-400 to-rose-500',2,400,'Trusted child minding'),
('Pet Care','pet-care','PawPrint','from-amber-400 to-orange-500',3,350,'Feeding, grooming & company'),
('Pest Control','pest-control','Bug','from-red-400 to-rose-600',4,800,'Cockroach, termite & rodent'),
('Car Washing','car-washing','Car','from-sky-400 to-blue-500',5,300,'Exterior & interior cleaning'),
('Movers & Packers','movers-packers','Truck','from-violet-400 to-purple-500',6,1500,'Home & office relocation'),
('House Cleaning','house-cleaning','Sparkles','from-yellow-300 to-amber-400',7,500,'Standard home cleaning'),
('Cook Service','cook-service','ChefHat','from-orange-400 to-red-500',8,400,'Daily meals at home'),
('Elder Care','elder-care','HeartHandshake','from-teal-400 to-cyan-500',9,600,'Senior companionship & help'),
('Driver Service','driver-service','CarTaxiFront','from-slate-400 to-zinc-500',10,500,'Hourly or daily driver'),
('Laundry Service','laundry-service','Shirt','from-indigo-400 to-blue-500',11,250,'Wash, dry & fold'),
('Grocery Assistant','grocery-assistant','ShoppingCart','from-lime-400 to-green-500',12,200,'Shopping & delivery help'),
('Personal Trainer','personal-trainer','Dumbbell','from-red-500 to-orange-500',13,700,'Home fitness sessions'),
('Yoga Instructor','yoga-instructor','Activity','from-purple-400 to-pink-500',14,600,'Personal yoga at home'),
('Home Tutor','home-tutor','BookOpen','from-blue-400 to-indigo-500',15,500,'Academic tutoring'),
('Beautician','beautician','Scissors','from-pink-400 to-fuchsia-500',16,500,'Beauty services at home'),
('Salon at Home','salon-at-home','Brush','from-fuchsia-400 to-pink-500',17,600,'Hair, nails & makeup'),
('Event Helper','event-helper','PartyPopper','from-yellow-400 to-orange-500',18,800,'On-site event support'),
('Catering Assistant','catering-assistant','UtensilsCrossed','from-orange-300 to-red-400',19,900,'Party food prep & serve'),
('Housekeeper','housekeeper','Home','from-emerald-400 to-teal-500',20,500,'Daily housekeeping'),
('Patient Care Assistant','patient-care','Stethoscope','from-cyan-400 to-sky-500',21,700,'In-home patient support'),
('Dog Walking','dog-walking','Dog','from-amber-300 to-orange-400',22,250,'Daily dog walks'),
('Birthday Party Helper','birthday-helper','Cake','from-pink-300 to-rose-400',23,800,'Kids party assistance'),
('Photographer','photographer','Camera','from-zinc-400 to-slate-500',24,2000,'Events & portraits'),
('Videographer','videographer','Video','from-slate-500 to-gray-600',25,2500,'Event videography'),
('Tailoring','tailoring','Scissors','from-rose-400 to-pink-500',26,300,'Stitching & alterations'),
('Shopping Assistant','shopping-assistant','ShoppingBag','from-violet-400 to-fuchsia-500',27,300,'Personal shopper'),
('Water Tank Cleaning','water-tank-cleaning','Droplets','from-blue-400 to-cyan-500',28,1200,'Overhead & sump tank cleaning'),
('Window Cleaning','window-cleaning','Square','from-sky-300 to-blue-400',29,400,'Streak-free window cleaning'),
('Home Care Assistant','home-care','HeartHandshake','from-teal-300 to-emerald-400',30,650,'All-round home support');
