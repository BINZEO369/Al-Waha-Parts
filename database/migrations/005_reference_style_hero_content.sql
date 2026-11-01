UPDATE public.hero_banners SET
  eyebrow = 'World Best Quality',
  title = 'New Car Parts',
  description = 'Verified automotive parts for every drive. Match the right fit and book with confidence.',
  cta_label = 'Shopping Now',
  cta_href = '/catalog',
  image_url = 'https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/wuTfX6XaptYuNd75uGVpAB.jpg',
  badge_text = 'BEST QUALITY',
  updated_at = now()
WHERE slug = 'fitment-first';

UPDATE public.hero_banners SET
  eyebrow = 'Tested parts / UAE',
  title = 'Drive with confidence.',
  description = 'Reliable parts for workshops, fleets and everyday drivers.',
  cta_label = 'View Categories',
  cta_href = '/catalog',
  image_url = 'https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/cpqc7BWHb8zAXAWDDKYrtf.jpg',
  badge_text = 'TESTED STOCK',
  updated_at = now()
WHERE slug = 'fleet-ready';

UPDATE public.hero_banners SET
  eyebrow = 'Parts desk / Dubai',
  title = 'Your car. Our parts.',
  description = 'Send your vehicle details and our team will confirm the right part.',
  cta_label = 'Shop Now',
  cta_href = '/catalog',
  image_url = 'https://files.manuscdn.com/search-media/310519663944260083/UbMvgpUBeEdUZmW9afB3AQ/C8eLMFJi2YW8oWyWSzihEi.jpg',
  badge_text = 'FITMENT FIRST',
  updated_at = now()
WHERE slug = 'book-with-confidence';
