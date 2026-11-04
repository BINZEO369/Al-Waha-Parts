import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
type ApiHealth = {
  status: 'ok';
  service: 'al-waha-parts-api';
  environment: string;
  timestamp: string;
};
import { getConfig } from './env.js';
import { getSupabaseAdmin } from './supabase.js';

const config = getConfig();
export const app = Fastify({ logger: true, trustProxy: true });
await app.register(cors, { origin: config.corsOrigins });

type RateBucket = { count: number; resetAt: number };
const publicBuckets = new Map<string, RateBucket>();
const bookingBuckets = new Map<string, RateBucket>();
const trackingBuckets = new Map<string, RateBucket>();
const checkRate = (
  buckets: Map<string, RateBucket>,
  key: string,
  max: number,
  windowMs: number,
) => {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  if (current.count >= max) return Math.ceil((current.resetAt - now) / 1000);
  current.count += 1;
  return null;
};
app.addHook('onRequest', async (request, reply) => {
  if (!request.url.startsWith('/api/v1')) return;
  const isBooking = request.method === 'POST' && request.url.split('?')[0] === '/api/v1/bookings';
  const isTracking =
    request.method === 'GET' && request.url.split('?')[0] === '/api/v1/bookings/track';
  const retryAfter = isBooking
    ? checkRate(bookingBuckets, request.ip, 5, 10 * 60 * 1000)
    : isTracking
      ? checkRate(trackingBuckets, request.ip, 20, 10 * 60 * 1000)
      : checkRate(publicBuckets, request.ip, 120, 60 * 1000);
  if (retryAfter !== null) {
    reply.header('Retry-After', String(retryAfter));
    return reply
      .code(429)
      .send({ error: { message: `Too many requests. Try again in ${retryAfter} seconds.` } });
  }
});

const limit = (value: unknown, fallback = 50) =>
  Math.min(Math.max(Number(value) || fallback, 1), 200);
const jsonError = (reply: FastifyReply, statusCode: number, message: string) =>
  reply.code(statusCode).send({ error: { message } });

const publicImageUrl = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const image = value.trim();
  if (/^(https?:|data:|blob:|\/\/)/i.test(image)) return image;
  if (image.startsWith('/')) return image;
  if (image.startsWith('public/')) return `/${image.slice('public/'.length)}`;
  if (/^(car-brands|vehicle|hero|categories)\//i.test(image)) return `/${image}`;
  if (image.startsWith('storage/v1/object/public/'))
    return `${config.supabaseUrl.replace(/\/$/, '')}/${image}`;
  return `${config.supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${image}`;
};

type CarBrandRecord = Record<string, unknown>;

const firstValue = (row: CarBrandRecord, keys: string[]) =>
  keys
    .map((key) => row[key])
    .find((value) => value !== undefined && value !== null && value !== '');

const normalizeCarBrand = (row: CarBrandRecord, index: number) => ({
  id: String(firstValue(row, ['id', 'brand_id', 'car_brand_id']) ?? `car-brand-${index}`),
  car_brand_id: String(firstValue(row, ['id', 'brand_id', 'car_brand_id']) ?? `car-brand-${index}`),
  slug: firstValue(row, ['slug', 'brand_slug']) ?? null,
  manufacturer_name: String(
    firstValue(row, ['manufacturer_name', 'brand_name', 'car_brand', 'brand', 'make', 'name']) ??
      'Unknown brand',
  ),
  manufacturer_logo: publicImageUrl(
    firstValue(row, ['manufacturer_logo', 'brand_logo', 'logo_url', 'logo']),
  ),
  model_name: String(firstValue(row, ['model_name', 'model', 'car_model']) ?? 'All models'),
  generation: firstValue(row, ['generation', 'variant', 'trim']) ?? null,
  chassis_code: firstValue(row, ['chassis_code', 'chassis']) ?? null,
  year_start: firstValue(row, ['year_start', 'from_year', 'start_year']) ?? null,
  year_end: firstValue(row, ['year_end', 'to_year', 'end_year']) ?? null,
  vehicle_type: firstValue(row, ['vehicle_type', 'type', 'body_type']) ?? 'Vehicle',
  cover_image_url: publicImageUrl(firstValue(row, ['cover_image_url', 'image_url', 'cover_image'])),
  status:
    firstValue(row, ['is_active']) === false
      ? 'inactive'
      : String(firstValue(row, ['status']) ?? 'active'),
});

async function readCarBrands() {
  const supabase = getSupabaseAdmin();
  let lastError: string | null = null;
  for (const table of ['Car brand', 'car_brand', 'car_brands']) {
    const { data, error } = await supabase.from(table).select('*').limit(1000);
    if (!error)
      return (data ?? []).map((row, index) => normalizeCarBrand(row as CarBrandRecord, index));
    lastError = error.message;
  }
  throw new Error(lastError ?? 'Car brand table was not found.');
}

const normalizeModel = (row: CarBrandRecord, brand: CarBrandRecord, index: number) => ({
  id: String(firstValue(row, ['id', 'model_id', 'vehicle_id']) ?? `model-${index}`),
  slug: firstValue(row, ['slug', 'model_slug', 'vehicle_slug']) ?? null,
  manufacturer_name: String(
    firstValue(row, ['manufacturer_name', 'brand_name', 'car_brand', 'make']) ??
      brand.manufacturer_name,
  ),
  model_name: String(firstValue(row, ['model_name', 'model', 'car_model', 'name']) ?? ''),
  generation: firstValue(row, ['generation', 'variant', 'trim']) ?? null,
  chassis_code: firstValue(row, ['chassis_code', 'chassis']) ?? null,
  year_start: firstValue(row, ['year_start', 'from_year', 'start_year']) ?? null,
  year_end: firstValue(row, ['year_end', 'to_year', 'end_year']) ?? null,
  vehicle_type: firstValue(row, ['vehicle_type', 'type', 'body_type']) ?? null,
  cover_image_url: publicImageUrl(firstValue(row, ['cover_image_url', 'image_url', 'cover_image'])),
  vehicle_images: Array.isArray(row.vehicle_images)
    ? row.vehicle_images.map((image: unknown) => publicImageUrl(image)).filter(Boolean)
    : null,
  car_brand_id: String(firstValue(row, ['car_brand_id', 'brand_id']) ?? brand.id),
  status: String(firstValue(row, ['status']) ?? 'active'),
});

async function readBrandModels(brand: CarBrandRecord) {
  const sources = [
    'Car brand models',
    'car_brand_models',
    'car_models',
    'vehicle_models',
    'models',
    'cars',
  ];
  for (const table of sources) {
    const { data, error } = await getSupabaseAdmin().from(table).select('*').limit(1000);
    if (error) continue;
    const models = (data ?? [])
      .map((row, index) => normalizeModel(row as CarBrandRecord, brand, index))
      .filter((model) => {
        const row = data?.find(
          (candidate) => String((candidate as CarBrandRecord).id ?? '') === model.id,
        ) as CarBrandRecord | undefined;
        const sourceBrandId = firstValue(row ?? {}, ['car_brand_id', 'brand_id']);
        const sourceBrandName = firstValue(row ?? {}, [
          'manufacturer_name',
          'brand_name',
          'car_brand',
          'make',
        ]);
        return (
          model.model_name &&
          model.model_name !== 'All models' &&
          (String(sourceBrandId ?? '') === String(brand.id) ||
            String(sourceBrandName ?? '').toLowerCase() ===
              String(brand.manufacturer_name).toLowerCase())
        );
      })
      .filter((model) => model.status === 'active');
    if (models.length) return models;
  }
  return [];
}

async function readModelBySlug(slug: string) {
  const sources = [
    'Car brand models',
    'car_brand_models',
    'car_models',
    'vehicle_models',
    'models',
    'cars',
  ];
  for (const table of sources) {
    const { data, error } = await getSupabaseAdmin().from(table).select('*').limit(1000);
    if (error) continue;
    const model = (data ?? [])
      .map((row, index) => {
        const record = row as CarBrandRecord;
        const brandName = String(
          firstValue(record, ['manufacturer_name', 'brand_name', 'car_brand', 'make']) ?? '',
        );
        const brandId = String(firstValue(record, ['car_brand_id', 'brand_id']) ?? '');
        return normalizeModel(record, { id: brandId, manufacturer_name: brandName }, index);
      })
      .find((item) => item.slug === slug && item.model_name && item.model_name !== 'All models');
    if (model) return model;
  }
  return null;
}

async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return jsonError(reply, 401, 'Bearer token required');
  const supabase = getSupabaseAdmin();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) return jsonError(reply, 401, 'Invalid access token');
  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('id,role,status')
    .eq('auth_user_id', userData.user.id)
    .eq('status', 'active')
    .maybeSingle();
  if (adminError || !admin) return jsonError(reply, 403, 'Active admin access required');
  (request as FastifyRequest & { admin?: typeof admin }).admin = admin;
}

app.get('/', async () => ({
  name: 'Al Waha Parts API',
  version: 'v1',
  status: 'ready',
  health: '/health',
  documentation: '/api/v1',
}));

app.get('/health', async (): Promise<ApiHealth> => ({
  status: 'ok',
  service: 'al-waha-parts-api',
  environment: config.nodeEnv,
  timestamp: new Date().toISOString(),
}));
app.get('/api/v1', async () => ({ name: 'Al Waha Parts API', version: 'v1', status: 'ready' }));

app.get('/api/v1/categories', async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('parts_categories')
    .select('id,category_name,slug,description,status,image_url,icon_name,is_featured,sort_order')
    .eq('status', 'active')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('category_name', { ascending: true })
    .limit(200);
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});

app.get('/api/v1/car-brands', async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('car_brands')
    .select('id,manufacturer_name,slug,logo_url,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('manufacturer_name', { ascending: true })
    .limit(10);
  if (error) return jsonError(reply, 500, error.message);
  return {
    data: (data ?? []).map((brand) => ({ ...brand, logo_url: publicImageUrl(brand.logo_url) })),
  };
});

app.get(
  '/api/v1/car-brands/slug/:slug',
  async (request: FastifyRequest<{ Params: { slug: string } }>, reply) => {
    const supabase = getSupabaseAdmin();
    const { data: brand, error: brandError } = await supabase
      .from('car_brands')
      .select('id,manufacturer_name,slug,logo_url,sort_order')
      .eq('slug', request.params.slug)
      .eq('is_active', true)
      .maybeSingle();
    if (brandError) return jsonError(reply, 500, brandError.message);
    if (!brand) return jsonError(reply, 404, 'Car brand not found');
    let { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select(
        'id,slug,manufacturer_name,model_name,generation,chassis_code,year_start,year_end,vehicle_type,cover_image_url,vehicle_images,car_brand_id',
      )
      .eq('car_brand_id', brand.id)
      .eq('status', 'active')
      .order('model_name')
      .order('year_start');
    // Some production rows were created before car_brand_id was backfilled.
    // Keep every brand page working by matching its canonical manufacturer name
    // when the relation is missing or currently returns no models.
    if (vehiclesError?.message.includes('car_brand_id') || !vehicles?.length) {
      const fallback = await supabase
        .from('vehicles')
        .select(
          'id,slug,manufacturer_name,model_name,generation,chassis_code,year_start,year_end,vehicle_type,cover_image_url,vehicle_images',
        )
        .ilike('manufacturer_name', brand.manufacturer_name)
        .eq('status', 'active')
        .order('model_name')
        .order('year_start');
      vehicles = fallback.data as typeof vehicles;
      vehiclesError = fallback.error;
    }
    if (vehiclesError || !vehicles?.length) {
      const modelRows = await readBrandModels(brand as CarBrandRecord);
      if (modelRows.length) {
        vehicles = modelRows as typeof vehicles;
        vehiclesError = null;
      } else if (vehiclesError?.message.includes("could not find the table 'public.vehicles'")) {
        vehicles = [];
        vehiclesError = null;
      }
    }
    if (vehiclesError) return jsonError(reply, 500, vehiclesError.message);
    return {
      data: {
        brand: { ...brand, logo_url: publicImageUrl(brand.logo_url) },
        vehicles: (vehicles ?? []).map((vehicle) => ({
          ...vehicle,
          cover_image_url: publicImageUrl(vehicle.cover_image_url),
          vehicle_images: Array.isArray(vehicle.vehicle_images)
            ? vehicle.vehicle_images.map((image: unknown) => publicImageUrl(image)).filter(Boolean)
            : vehicle.vehicle_images,
        })),
      },
    };
  },
);

app.get(
  '/api/v1/categories/slug/:slug',
  async (request: FastifyRequest<{ Params: { slug: string } }>, reply) => {
    const supabase = getSupabaseAdmin();
    const { data: category, error: categoryError } = await supabase
      .from('parts_categories')
      .select('id,category_name,slug,description,status,image_url,icon_name,is_featured,sort_order')
      .eq('slug', request.params.slug)
      .eq('status', 'active')
      .maybeSingle();
    if (categoryError) return jsonError(reply, 500, categoryError.message);
    if (!category) return jsonError(reply, 404, 'Category not found');

    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select(
        '*,parts_categories(id,category_name,slug),car_brands(id,manufacturer_name,slug,logo_url),part_vehicles(vehicle_id,vehicles(id,manufacturer_name,model_name,year_start,year_end,generation,chassis_code))',
      )
      .eq('category_id', category.id)
      .eq('status', 'active')
      .order('position')
      .order('part_name')
      .limit(200);
    if (partsError) return jsonError(reply, 500, partsError.message);
    return { data: { category, parts: parts ?? [] } };
  },
);

function brandSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

app.get(
  '/api/v1/brands',
  async (request: FastifyRequest<{ Querystring: { limit?: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('parts')
      .select('brand_name')
      .eq('status', 'active')
      .not('brand_name', 'is', null)
      .order('brand_name')
      .limit(200);
    if (error) return jsonError(reply, 500, error.message);
    const brands = new Map<string, { name: string; slug: string; product_count: number }>();
    for (const row of data ?? []) {
      const name = row.brand_name?.trim();
      if (!name) continue;
      const slug = brandSlug(name);
      const existing = brands.get(slug);
      brands.set(slug, { name, slug, product_count: (existing?.product_count ?? 0) + 1 });
    }
    return { data: [...brands.values()].slice(0, limit(request.query.limit) || 12) };
  },
);

app.get(
  '/api/v1/brands/:slug',
  async (request: FastifyRequest<{ Params: { slug: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('parts')
      .select(
        '*,parts_categories(id,category_name,slug),car_brands(id,manufacturer_name,slug,logo_url),part_vehicles(vehicle_id,vehicles(id,manufacturer_name,model_name,year_start,year_end,generation,chassis_code))',
      )
      .eq('status', 'active')
      .not('brand_name', 'is', null)
      .limit(200);
    if (error) return jsonError(reply, 500, error.message);
    const parts = (data ?? []).filter(
      (part) => part.brand_name && brandSlug(part.brand_name) === request.params.slug,
    );
    if (!parts.length) return jsonError(reply, 404, 'Brand not found');
    return {
      data: {
        brand: {
          name: parts[0]?.brand_name,
          slug: request.params.slug,
          product_count: parts.length,
        },
        parts,
      },
    };
  },
);

app.get('/api/v1/popular-categories', async (_request, reply) => {
  const importantCategorySlugs = [
    'engine-engine-parts',
    'transmission-drivetrain',
    'suspension-steering',
    'braking-system',
    'electrical-electronics',
    'cooling-system',
    'fuel-system',
    'air-intake-exhaust',
    'battery-charging',
    'filters-maintenance',
  ];
  const { data, error } = await getSupabaseAdmin()
    .from('parts_categories')
    .select('id,category_name,slug,description,image_url,status,sort_order')
    .eq('status', 'active')
    .in('slug', importantCategorySlugs)
    .limit(10);
  if (error) return jsonError(reply, 500, error.message);
  const order = new Map(importantCategorySlugs.map((slug, index) => [slug, index]));
  return {
    data: (data ?? []).sort(
      (left, right) => (order.get(left.slug) ?? 99) - (order.get(right.slug) ?? 99),
    ),
  };
});

app.get('/api/v1/banners', async (_request, reply) => {
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from('hero_banners')
    .select(
      'id,eyebrow,title,description,cta_label,cta_href,image_url,mobile_image_url,badge_text,sort_order',
    )
    .eq('status', 'active')
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('sort_order')
    .order('created_at');
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});

app.get(
  '/api/v1/vehicles',
  async (
    request: FastifyRequest<{
      Querystring: { search?: string; status?: string; limit?: string; offset?: string };
    }>,
    reply,
  ) => {
    const q = request.query;
    try {
      let data = await readCarBrands();
      if (q.status) data = data.filter((item) => item.status === q.status);
      if (q.search) {
        const search = q.search.toLowerCase();
        data = data.filter((item) =>
          [item.manufacturer_name, item.model_name, item.chassis_code]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search)),
        );
      }
      data.sort((a, b) =>
        `${a.manufacturer_name} ${a.model_name}`.localeCompare(
          `${b.manufacturer_name} ${b.model_name}`,
        ),
      );
      const start = Number(q.offset) || 0;
      return { data: data.slice(start, start + limit(q.limit)) };
    } catch (error) {
      return jsonError(
        reply,
        500,
        error instanceof Error ? error.message : 'Unable to load Car brand data.',
      );
    }
  },
);

app.get(
  '/api/v1/vehicles/slug/:slug',
  async (request: FastifyRequest<{ Params: { slug: string } }>, reply) => {
    const supabase = getSupabaseAdmin();
    let { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('slug', request.params.slug)
      .eq('status', 'active')
      .maybeSingle();
    if (vehicleError?.message.includes("could not find the table 'public.vehicles'")) {
      const alternateModel = await readModelBySlug(request.params.slug);
      vehicle = alternateModel as typeof vehicle;
      vehicleError = null;
    }
    if (vehicleError) return jsonError(reply, 500, vehicleError.message);
    if (!vehicle) return jsonError(reply, 404, 'Vehicle not found');

    let { data: parts, error: partsError } = await supabase
      .from('parts')
      .select(
        '*,parts_categories(id,category_name,slug),car_brands(id,manufacturer_name,slug,logo_url),part_vehicle_fitments!inner(vehicle_id)',
      )
      .eq('part_vehicle_fitments.vehicle_id', vehicle.id)
      .eq('status', 'active')
      .order('position')
      .order('part_name')
      .limit(200);
    if (partsError?.message.includes('part_vehicle_fitments')) {
      const legacy = await supabase
        .from('parts')
        .select(
          '*,parts_categories(id,category_name,slug),car_brands(id,manufacturer_name,slug,logo_url),part_vehicles!inner(vehicle_id)',
        )
        .eq('part_vehicles.vehicle_id', vehicle.id)
        .eq('status', 'active')
        .order('position')
        .order('part_name')
        .limit(200);
      parts = legacy.data;
      partsError = legacy.error;
    }
    if (
      partsError &&
      (partsError.message.includes("could not find the table 'public.part_vehicle_fitments'") ||
        partsError.message.includes("could not find the table 'public.part_vehicles'"))
    ) {
      parts = [];
      partsError = null;
    }
    if (partsError) return jsonError(reply, 500, partsError.message);
    return {
      data: {
        vehicle: {
          ...vehicle,
          cover_image_url: publicImageUrl(vehicle.cover_image_url),
          vehicle_images: Array.isArray(vehicle.vehicle_images)
            ? vehicle.vehicle_images.map((image: unknown) => publicImageUrl(image)).filter(Boolean)
            : vehicle.vehicle_images,
        },
        parts: parts ?? [],
      },
    };
  },
);

app.get('/api/v1/homepage-selected-vehicles', async (_request, reply) => {
  try {
    const data = await readCarBrands();
    return { data: data.filter((item) => item.status === 'active').slice(0, 200) };
  } catch (error) {
    return jsonError(
      reply,
      500,
      error instanceof Error ? error.message : 'Unable to load Car brand data.',
    );
  }
});

app.get(
  '/api/v1/parts',
  async (
    request: FastifyRequest<{
      Querystring: {
        search?: string;
        category_id?: string;
        vehicle_id?: string;
        car_brand_id?: string;
        status?: string;
        featured_only?: string;
        limit?: string;
        offset?: string;
      };
    }>,
    reply,
  ) => {
    const q = request.query;
    const start = Number(q.offset) || 0;
    let vehicleIds: string[] | null = null;
    if (q.car_brand_id) {
      const { data: brandVehicles, error: brandVehiclesError } = await getSupabaseAdmin()
        .from('vehicles')
        .select('id')
        .eq('car_brand_id', q.car_brand_id)
        .eq('status', 'active')
        .limit(1000);
      if (brandVehiclesError) return jsonError(reply, 500, brandVehiclesError.message);
      vehicleIds = (brandVehicles ?? []).map((vehicle) => vehicle.id);
    }
    const hasFitmentFilter = Boolean(q.vehicle_id || q.car_brand_id);
    let query = getSupabaseAdmin()
      .from('parts')
      .select(
        '*,parts_categories(id,category_name,slug),car_brands(id,manufacturer_name,slug,logo_url),part_vehicles!inner(vehicle_id)',
      )
      .order('position')
      .order('part_name')
      .range(start, start + limit(q.limit) - 1);
    if (!hasFitmentFilter)
      query = getSupabaseAdmin()
        .from('parts')
        .select('*,parts_categories(id,category_name,slug)')
        .order('position')
        .order('part_name')
        .range(start, start + limit(q.limit) - 1);
    if (q.search)
      query = query.or(
        `part_name.ilike.%${q.search}%,brand_name.ilike.%${q.search}%,sku.ilike.%${q.search}%,oem_number.ilike.%${q.search}%,part_number.ilike.%${q.search}%`,
      );
    if (q.category_id) query = query.eq('category_id', q.category_id);
    if (q.vehicle_id) query = query.eq('part_vehicles.vehicle_id', q.vehicle_id);
    if (vehicleIds) query = query.in('part_vehicles.vehicle_id', vehicleIds);
    if (q.featured_only === 'true') query = query.eq('is_featured', true);
    query = query.eq('status', q.status ?? 'active');
    const { data, error } = await query;
    if (error) return jsonError(reply, 500, error.message);
    return { data: data ?? [] };
  },
);

app.get(
  '/api/v1/parts/slug/:slug',
  async (request: FastifyRequest<{ Params: { slug: string } }>, reply) => {
    let { data, error } = await getSupabaseAdmin()
      .from('parts')
      .select(
        '*,parts_categories(id,category_name,slug,image_url),car_brands(id,manufacturer_name,slug,logo_url),part_vehicle_fitments(vehicle_id,compatible_years,vehicles(id,manufacturer_name,model_name,generation,chassis_code))',
      )
      .eq('slug', request.params.slug)
      .eq('status', 'active')
      .maybeSingle();
    if (error?.message.includes('part_vehicle_fitments')) {
      const legacy = await getSupabaseAdmin()
        .from('parts')
        .select(
          '*,parts_categories(id,category_name,slug,image_url),car_brands(id,manufacturer_name,slug,logo_url),part_vehicles(vehicle_id,vehicles(id,manufacturer_name,model_name,year_start,year_end,generation,chassis_code))',
        )
        .eq('slug', request.params.slug)
        .eq('status', 'active')
        .maybeSingle();
      if (legacy.data) {
        const legacyFitment = legacy.data.part_vehicles?.[0];
        const legacyVehicle = legacyFitment?.vehicles;
        const compatibleYears =
          legacyVehicle?.year_start && legacyVehicle?.year_end
            ? Array.from(
                { length: Math.max(0, legacyVehicle.year_end - legacyVehicle.year_start + 1) },
                (_, index) => legacyVehicle.year_start + index,
              )
            : legacyVehicle?.year_start
              ? [legacyVehicle.year_start]
              : [];
        data = {
          ...legacy.data,
          part_vehicle_fitments: legacyFitment
            ? [
                {
                  vehicle_id: legacyFitment.vehicle_id,
                  compatible_years: compatibleYears,
                  vehicles: legacyVehicle
                    ? {
                        id: legacyVehicle.id,
                        manufacturer_name: legacyVehicle.manufacturer_name,
                        model_name: legacyVehicle.model_name,
                        generation: legacyVehicle.generation,
                        chassis_code: legacyVehicle.chassis_code,
                      }
                    : null,
                },
              ]
            : [],
        };
        error = legacy.error;
      }
    }
    if (error) return jsonError(reply, 500, error.message);
    if (!data) return jsonError(reply, 404, 'Part not found');
    return { data };
  },
);

app.post(
  '/api/v1/bookings',
  async (
    request: FastifyRequest<{
      Body: {
        customer_name: string;
        customer_phone: string;
        customer_email?: string;
        customer_note?: string;
        part_number?: string;
        items?: Array<{
          part_id: string;
          vehicle_id?: string;
          quantity: number;
        }>;
        delivery_method?: 'pickup' | 'delivery';
        shipping_address?: string;
        customer_city?: string;
        payment_method?: 'cash_on_delivery';
      };
    }>,
    reply,
  ) => {
    const body = request.body;
    const customerName = body?.customer_name?.trim();
    const customerPhone = body?.customer_phone?.trim();
    const customerEmail = body?.customer_email?.trim() || null;
    const deliveryMethod = body?.delivery_method ?? 'pickup';
    const paymentMethod = body?.payment_method ?? 'cash_on_delivery';
    if (
      !customerName ||
      !customerPhone ||
      (!body.part_number && (!Array.isArray(body.items) || body.items.length === 0))
    ) {
      return jsonError(
        reply,
        400,
        'customer_name, customer_phone and a part number or item are required',
      );
    }
    if (customerName.length > 160 || customerPhone.length > 40) {
      return jsonError(reply, 400, 'Name or phone number is too long');
    }
    if (customerEmail && (customerEmail.length > 254 || !/^\S+@\S+\.\S+$/.test(customerEmail))) {
      return jsonError(reply, 400, 'Please provide a valid email address');
    }
    if (deliveryMethod !== 'pickup' && deliveryMethod !== 'delivery') {
      return jsonError(reply, 400, 'Please choose a valid delivery method');
    }
    if (paymentMethod !== 'cash_on_delivery') {
      return jsonError(reply, 400, 'Please choose a valid payment method');
    }
    const supabase = getSupabaseAdmin();
    if (deliveryMethod === 'delivery' && !body.shipping_address?.trim()) {
      return jsonError(reply, 400, 'A delivery address is required for delivery requests');
    }

    const requestedItems = new Map<
      string,
      { part_id: string; vehicle_id?: string; quantity: number }
    >();
    for (const item of body.items ?? []) {
      if (
        !item?.part_id ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 99
      ) {
        return jsonError(reply, 400, 'Each cart item must have a valid quantity between 1 and 99');
      }
      const previous = requestedItems.get(item.part_id);
      const quantity = (previous?.quantity ?? 0) + item.quantity;
      if (quantity > 99)
        return jsonError(reply, 400, 'The quantity for one product cannot exceed 99');
      requestedItems.set(item.part_id, {
        part_id: item.part_id,
        vehicle_id: item.vehicle_id,
        quantity,
      });
    }

    if (body.part_number?.trim() && requestedItems.size === 0) {
      const partNumber = body.part_number.trim();
      if (partNumber.length > 120) return jsonError(reply, 400, 'Part number is too long');
      let matchedPart = null as { id: string } | null;
      for (const column of ['sku', 'oem_number', 'part_number'] as const) {
        const { data } = await supabase
          .from('parts')
          .select('id')
          .eq('status', 'active')
          .eq(column, partNumber)
          .limit(1)
          .maybeSingle();
        if (data) {
          matchedPart = data;
          break;
        }
      }
      if (matchedPart) requestedItems.set(matchedPart.id, { part_id: matchedPart.id, quantity: 1 });
      else
        return jsonError(
          reply,
          400,
          'We could not find that part number. Check the SKU, OEM or part number and try again.',
        );
    }

    const partIds = [...requestedItems.keys()];
    const { data: parts, error: partsError } = partIds.length
      ? await supabase
          .from('parts')
          .select('id,part_name,sku,price,sale_price,stock_quantity')
          .in('id', partIds)
          .eq('status', 'active')
      : { data: [], error: null };
    if (partsError) return jsonError(reply, 500, 'Unable to verify cart items');
    if (parts.length !== partIds.length)
      return jsonError(reply, 400, 'One or more products are no longer available');

    const partById = new Map(parts.map((part) => [part.id, part]));
    const vehicleIds = [
      ...new Set([...requestedItems.values()].map((item) => item.vehicle_id).filter(Boolean)),
    ] as string[];
    const { data: vehicles, error: vehiclesError } = vehicleIds.length
      ? await supabase
          .from('vehicles')
          .select('id,manufacturer_name,model_name,generation')
          .in('id', vehicleIds)
          .eq('status', 'active')
      : { data: [], error: null };
    if (vehiclesError) return jsonError(reply, 500, 'Unable to verify vehicle fitment');
    if (vehicles.length !== vehicleIds.length)
      return jsonError(reply, 400, 'The selected vehicle is no longer available');
    const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

    if (vehicleIds.length) {
      const { data: fitments, error: fitmentError } = await supabase
        .from('part_vehicles')
        .select('part_id,vehicle_id')
        .in('part_id', partIds)
        .in('vehicle_id', vehicleIds);
      if (fitmentError) return jsonError(reply, 500, 'Unable to verify part fitment');
      const fitmentKeys = new Set(
        (fitments ?? []).map((fitment) => `${fitment.part_id}:${fitment.vehicle_id}`),
      );
      for (const item of requestedItems.values()) {
        if (item.vehicle_id && !fitmentKeys.has(`${item.part_id}:${item.vehicle_id}`)) {
          const part = partById.get(item.part_id);
          return jsonError(
            reply,
            400,
            `${part?.part_name ?? 'This part'} is not listed for the selected vehicle`,
          );
        }
      }
    }

    const items: Array<{
      part_id: string;
      vehicle_id: string | null;
      quantity: number;
      unit_price: number;
      part_name_snapshot: string;
      sku_snapshot: string;
      vehicle_name_snapshot: string | null;
      line_total: number;
    }> = [];
    for (const item of requestedItems.values()) {
      const part = partById.get(item.part_id);
      if (!part) return jsonError(reply, 400, 'Product validation failed');
      const stock = part.stock_quantity == null ? null : Number(part.stock_quantity);
      if (stock !== null && (stock <= 0 || item.quantity > stock)) {
        return jsonError(reply, 409, `${part.part_name} has only ${Math.max(stock, 0)} available`);
      }
      const unitPrice = Number(part.sale_price ?? part.price ?? 0);
      const vehicle = item.vehicle_id ? vehicleById.get(item.vehicle_id) : undefined;
      items.push({
        part_id: part.id,
        vehicle_id: item.vehicle_id ?? null,
        quantity: item.quantity,
        unit_price: unitPrice,
        part_name_snapshot: part.part_name,
        sku_snapshot: part.sku,
        vehicle_name_snapshot: vehicle
          ? `${vehicle.manufacturer_name} ${vehicle.model_name}${vehicle.generation ? ` · ${vehicle.generation}` : ''}`
          : null,
        line_total: unitPrice * item.quantity,
      });
    }
    const totalAmount = items.reduce((total, item) => total + item.line_total, 0);
    const bookingNumber = `AWP-${Date.now()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const bookingNote = body.part_number
      ? `${body.customer_note ?? ''}\nRequested part: ${body.part_number}`.trim()
      : (body.customer_note ?? null);
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        customer_note: bookingNote,
        total_amount: totalAmount,
        currency: 'SAR',
        shipping_address: body.shipping_address?.trim() ?? null,
        customer_city: body.customer_city?.trim() ?? null,
        delivery_method: deliveryMethod,
        payment_method: paymentMethod,
        source: 'website_cart',
      })
      .select()
      .single();
    if (bookingError || !booking)
      return jsonError(reply, 400, bookingError?.message ?? 'Unable to create booking');
    const { error: itemsError } = items.length
      ? await supabase.from('booking_items').insert(
          items.map((item) => ({
            booking_id: booking.id,
            part_id: item.part_id,
            vehicle_id: item.vehicle_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            part_name_snapshot: item.part_name_snapshot,
            sku_snapshot: item.sku_snapshot,
            vehicle_name_snapshot: item.vehicle_name_snapshot,
            line_total: item.line_total,
          })),
        )
      : { error: null };
    if (itemsError) {
      await supabase.from('bookings').delete().eq('id', booking.id);
      return jsonError(reply, 400, itemsError.message);
    }
    return reply.code(201).send({ data: { ...booking, items } });
  },
);

app.get(
  '/api/v1/bookings/track',
  async (
    request: FastifyRequest<{ Querystring: { booking_id?: string; phone?: string } }>,
    reply,
  ) => {
    const bookingId = request.query.booking_id?.trim();
    const phone = request.query.phone?.trim();
    if (!bookingId || !phone)
      return jsonError(reply, 400, 'Booking ID and phone number are required.');
    if (bookingId.length > 80 || phone.length > 40)
      return jsonError(reply, 400, 'Please check the booking ID and phone number.');
    const supabase = getSupabaseAdmin();
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        'id,booking_number,booking_status,created_at,total_amount,currency,delivery_method,customer_city',
      )
      .eq('booking_number', bookingId)
      .eq('customer_phone', phone)
      .maybeSingle();
    if (bookingError || !booking)
      return jsonError(reply, 404, 'No booking matched that ID and phone number.');
    const { data: items, error: itemsError } = await supabase
      .from('booking_items')
      .select('part_name_snapshot,sku_snapshot,vehicle_name_snapshot,quantity,line_total')
      .eq('booking_id', booking.id)
      .limit(50);
    if (itemsError) return jsonError(reply, 500, 'Booking items could not be loaded.');
    const { id: _bookingId, ...safeBooking } = booking;
    return { data: { ...safeBooking, items: items ?? [] } };
  },
);

app.get('/api/v1/admin/dashboard', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const supabase = getSupabaseAdmin();
  const [parts, vehicles, bookings, admins] = await Promise.all([
    supabase.from('parts').select('id', { count: 'exact', head: true }),
    supabase.from('vehicles').select('id', { count: 'exact', head: true }),
    supabase.from('bookings').select('id', { count: 'exact', head: true }),
    supabase.from('admins').select('id', { count: 'exact', head: true }).eq('status', 'active'),
  ]);
  return reply.send({
    data: {
      parts: parts.count ?? 0,
      vehicles: vehicles.count ?? 0,
      bookings: bookings.count ?? 0,
      active_admins: admins.count ?? 0,
    },
  });
});

const editableBannerFields = [
  'slug',
  'eyebrow',
  'title',
  'description',
  'cta_label',
  'cta_href',
  'image_url',
  'mobile_image_url',
  'badge_text',
  'status',
  'sort_order',
  'starts_at',
  'ends_at',
] as const;

app.get('/api/v1/admin/banners', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('hero_banners')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false });
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});

app.post('/api/v1/admin/banners', { preHandler: requireAdmin as any }, async (request, reply) => {
  const body = pickFields((request.body ?? {}) as Record<string, unknown>, editableBannerFields);
  if (
    typeof body.slug !== 'string' ||
    !body.slug.trim() ||
    typeof body.title !== 'string' ||
    !body.title.trim() ||
    typeof body.image_url !== 'string' ||
    !body.image_url.trim()
  )
    return jsonError(reply, 400, 'slug, title and image_url are required');
  const { data, error } = await getSupabaseAdmin()
    .from('hero_banners')
    .insert(body)
    .select()
    .single();
  if (error) return jsonError(reply, 400, error.message);
  return reply.code(201).send({ data });
});

app.patch(
  '/api/v1/admin/banners/:id',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>,
    reply,
  ) => {
    const body = pickFields(request.body ?? {}, editableBannerFields);
    if (!Object.keys(body).length)
      return jsonError(reply, 400, 'No editable banner fields provided');
    const { data, error } = await getSupabaseAdmin()
      .from('hero_banners')
      .update(body)
      .eq('id', request.params.id)
      .select()
      .single();
    if (error) return jsonError(reply, 400, error.message);
    return { data };
  },
);

app.delete(
  '/api/v1/admin/banners/:id',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('hero_banners')
      .delete()
      .eq('id', request.params.id)
      .select('id')
      .single();
    if (error) return jsonError(reply, 404, 'Hero banner could not be deleted.');
    return { data };
  },
);

app.get(
  '/api/v1/admin/bookings',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{ Querystring: { status?: string; limit?: string; offset?: string } }>,
    reply,
  ) => {
    const q = request.query;
    const start = Number(q.offset) || 0;
    let query = getSupabaseAdmin()
      .from('bookings')
      .select('*,booking_items(*,parts(part_name,sku),vehicles(manufacturer_name,model_name))')
      .order('created_at', { ascending: false })
      .range(start, start + limit(q.limit) - 1);
    if (q.status) query = query.eq('booking_status', q.status);
    const { data, error } = await query;
    if (error) return jsonError(reply, 500, error.message);
    return { data: data ?? [] };
  },
);

app.patch(
  '/api/v1/admin/bookings/:id',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { booking_status?: string; admin_note?: string };
    }>,
    reply,
  ) => {
    const { data, error } = await getSupabaseAdmin()
      .from('bookings')
      .update(request.body)
      .eq('id', request.params.id)
      .select()
      .single();
    if (error) return jsonError(reply, 400, error.message);
    return { data };
  },
);

app.get('/api/v1/admin/parts', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('parts')
    .select(
      '*,parts_categories(id,category_name,slug),part_vehicle_fitments(vehicle_id,compatible_years,vehicles(id,manufacturer_name,model_name,generation,chassis_code))',
    )
    .order('created_at', { ascending: false });
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});

const editablePartFields = [
  'part_name',
  'category_id',
  'brand_name',
  'sku',
  'oem_number',
  'part_number',
  'description',
  'condition',
  'tested_status',
  'price',
  'sale_price',
  'stock_quantity',
  'position',
  'status',
  'slug',
  'primary_image_url',
  'image_urls',
  'tags',
  'is_featured',
  'sort_order',
  'warranty_months',
  'min_order_quantity',
  'reorder_level',
  'storage_location',
  'currency',
  'seo_title',
  'seo_description',
] as const;
function pickFields(body: Record<string, unknown>, fields: readonly string[]) {
  return Object.fromEntries(Object.entries(body).filter(([key]) => fields.includes(key)));
}

app.post('/api/v1/admin/parts', { preHandler: requireAdmin as any }, async (request, reply) => {
  const body = pickFields((request.body ?? {}) as Record<string, unknown>, editablePartFields);
  if (!body.part_name || !body.sku || body.price === undefined)
    return jsonError(reply, 400, 'part_name, sku and price are required');
  const { data, error } = await getSupabaseAdmin()
    .from('parts')
    .insert(body)
    .select(
      '*,parts_categories(id,category_name,slug),part_vehicle_fitments(vehicle_id,compatible_years,vehicles(id,manufacturer_name,model_name,generation,chassis_code))',
    )
    .single();
  if (error) return jsonError(reply, 400, error.message);
  return reply.code(201).send({ data });
});

app.patch(
  '/api/v1/admin/parts/:id',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>,
    reply,
  ) => {
    const body = pickFields(request.body ?? {}, editablePartFields);
    const { data, error } = await getSupabaseAdmin()
      .from('parts')
      .update(body)
      .eq('id', request.params.id)
      .select(
        '*,parts_categories(id,category_name,slug),part_vehicle_fitments(vehicle_id,compatible_years,vehicles(id,manufacturer_name,model_name,generation,chassis_code))',
      )
      .single();
    if (error) return jsonError(reply, 400, error.message);
    return { data };
  },
);
app.delete(
  '/api/v1/admin/parts/:id',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('parts')
      .update({ status: 'inactive' })
      .eq('id', request.params.id)
      .select('id,status')
      .single();
    if (error) return jsonError(reply, 404, 'Part could not be deleted.');
    return { data };
  },
);

app.get(
  '/api/v1/admin/parts/:id/fitment',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('part_vehicle_fitments')
      .select(
        'id,part_id,vehicle_id,compatible_years,vehicles(id,manufacturer_name,model_name,generation,chassis_code)',
      )
      .eq('part_id', request.params.id)
      .maybeSingle();
    if (error) return jsonError(reply, 500, error.message);
    return { data: data ?? null };
  },
);

app.put(
  '/api/v1/admin/parts/:id/fitment',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { vehicle_id?: string; compatible_years?: unknown };
    }>,
    reply,
  ) => {
    const body = request.body ?? {};
    const years = Array.isArray(body.compatible_years)
      ? [
          ...new Set(
            body.compatible_years
              .map(Number)
              .filter((year) => Number.isInteger(year) && year >= 1900 && year <= 2200),
          ),
        ].sort((a, b) => a - b)
      : [];
    if (!body.vehicle_id) return jsonError(reply, 400, 'Choose one vehicle model for this part.');
    const { data, error } = await getSupabaseAdmin()
      .from('part_vehicle_fitments')
      .upsert(
        {
          part_id: request.params.id,
          vehicle_id: body.vehicle_id,
          compatible_years: years,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'part_id' },
      )
      .select(
        'id,part_id,vehicle_id,compatible_years,vehicles(id,manufacturer_name,model_name,generation,chassis_code)',
      )
      .single();
    if (error) return jsonError(reply, 400, error.message);
    return { data };
  },
);

app.delete(
  '/api/v1/admin/parts/:id/fitment',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { error } = await getSupabaseAdmin()
      .from('part_vehicle_fitments')
      .delete()
      .eq('part_id', request.params.id);
    if (error) return jsonError(reply, 400, error.message);
    return { data: null };
  },
);

const editableVehicleFields = [
  'manufacturer_name',
  'car_brand_id',
  'vehicle_images',
  'model_name',
  'generation',
  'chassis_code',
  'engine_code',
  'engine_capacity',
  'fuel_type',
  'transmission',
  'vehicle_type',
  'status',
  'slug',
  'cover_image_url',
  'gallery_images',
  'is_featured',
  'sort_order',
  'seo_title',
  'seo_description',
] as const;
app.get('/api/v1/admin/vehicles', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('vehicles')
    .select('*')
    .order('sort_order')
    .order('manufacturer_name')
    .order('model_name')
    .limit(500);
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});
app.post('/api/v1/admin/vehicles', { preHandler: requireAdmin as any }, async (request, reply) => {
  const body = pickFields((request.body ?? {}) as Record<string, unknown>, editableVehicleFields);
  if (!body.manufacturer_name || !body.model_name)
    return jsonError(reply, 400, 'manufacturer_name and model_name are required');
  const { data, error } = await getSupabaseAdmin().from('vehicles').insert(body).select().single();
  if (error) return jsonError(reply, 400, error.message);
  return reply.code(201).send({ data });
});
app.patch(
  '/api/v1/admin/vehicles/:id',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>,
    reply,
  ) => {
    const { data, error } = await getSupabaseAdmin()
      .from('vehicles')
      .update(pickFields(request.body ?? {}, editableVehicleFields))
      .eq('id', request.params.id)
      .select()
      .single();
    if (error) return jsonError(reply, 400, error.message);
    return { data };
  },
);
app.delete(
  '/api/v1/admin/vehicles/:id',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('vehicles')
      .update({ status: 'inactive' })
      .eq('id', request.params.id)
      .select('id,status')
      .single();
    if (error) return jsonError(reply, 404, 'Vehicle could not be deleted.');
    return { data };
  },
);

const editableCategoryFields = [
  'category_name',
  'slug',
  'description',
  'status',
  'image_url',
  'icon_name',
  'is_featured',
  'sort_order',
  'seo_title',
  'seo_description',
] as const;
app.get(
  '/api/v1/admin/categories',
  { preHandler: requireAdmin as any },
  async (_request, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('parts_categories')
      .select('*')
      .order('sort_order')
      .order('category_name')
      .limit(500);
    if (error) return jsonError(reply, 500, error.message);
    return { data: data ?? [] };
  },
);
app.post(
  '/api/v1/admin/categories',
  { preHandler: requireAdmin as any },
  async (request, reply) => {
    const body = pickFields(
      (request.body ?? {}) as Record<string, unknown>,
      editableCategoryFields,
    );
    if (!body.category_name || !body.slug)
      return jsonError(reply, 400, 'category_name and slug are required');
    const { data, error } = await getSupabaseAdmin()
      .from('parts_categories')
      .insert(body)
      .select()
      .single();
    if (error) return jsonError(reply, 400, error.message);
    return reply.code(201).send({ data });
  },
);
app.patch(
  '/api/v1/admin/categories/:id',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>,
    reply,
  ) => {
    const { data, error } = await getSupabaseAdmin()
      .from('parts_categories')
      .update(pickFields(request.body ?? {}, editableCategoryFields))
      .eq('id', request.params.id)
      .select()
      .single();
    if (error) return jsonError(reply, 400, error.message);
    return { data };
  },
);
app.delete(
  '/api/v1/admin/categories/:id',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('parts_categories')
      .update({ status: 'inactive' })
      .eq('id', request.params.id)
      .select('id,status')
      .single();
    if (error) return jsonError(reply, 404, 'Category could not be deleted.');
    return { data };
  },
);

app.get('/api/v1/admin/admins', { preHandler: requireAdmin as any }, async (request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('admins')
    .select(
      'id,name,email,role,status,phone,avatar_url,permissions,last_login_at,last_seen_at,created_at,updated_at',
    )
    .order('created_at');
  if (error) return jsonError(reply, 500, error.message);
  const caller = (request as FastifyRequest & { admin?: { id: string; role: string } }).admin;
  const canManageAccess = caller?.role === 'super_admin' || caller?.role === 'admin';
  return {
    data: (data ?? []).map((admin) => ({
      ...admin,
      can_manage_access: canManageAccess && admin.id !== caller?.id,
    })),
  };
});

app.patch(
  '/api/v1/admin/admins/:id',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string }; Body: { status?: string } }>, reply) => {
    const caller = (request as FastifyRequest & { admin?: { id: string; role: string } }).admin;
    if (!caller || !['super_admin', 'admin'].includes(caller.role))
      return jsonError(reply, 403, 'Only an admin can change access status.');
    const status = request.body?.status;
    if (status !== 'active' && status !== 'inactive')
      return jsonError(reply, 400, 'status must be active or inactive');
    if (request.params.id === caller.id && status === 'inactive')
      return jsonError(reply, 400, 'You cannot deactivate your own admin access.');

    const supabase = getSupabaseAdmin();
    const { data: target, error: targetError } = await supabase
      .from('admins')
      .select('id,role,status')
      .eq('id', request.params.id)
      .maybeSingle();
    if (targetError) return jsonError(reply, 500, 'Admin record could not be loaded.');
    if (!target) return jsonError(reply, 404, 'Admin record not found.');

    if (target.role === 'super_admin' && target.status === 'active' && status === 'inactive') {
      const { count, error: countError } = await supabase
        .from('admins')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'super_admin')
        .eq('status', 'active');
      if (countError) return jsonError(reply, 500, 'Admin access could not be verified.');
      if ((count ?? 0) <= 1)
        return jsonError(reply, 400, 'The last active super admin cannot be deactivated.');
    }

    const { data, error } = await supabase
      .from('admins')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', request.params.id)
      .select('id,status')
      .single();
    if (error) return jsonError(reply, 400, 'Admin access status could not be updated.');
    return { data };
  },
);

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  return jsonError(reply, 500, 'Internal server error');
});
