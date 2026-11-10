import Fastify, { type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import { createHash, createHmac, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
type ApiHealth = {
  status: 'ok';
  service: 'al-waha-parts-api';
  environment: string;
  timestamp: string;
};
import { getConfig } from './env.js';
import { getSupabaseAdmin } from './supabase.js';
import {
  analyzeAnalyticsSnapshot,
  sanitizeProductAiInput,
  suggestProductMetadata,
  type AnalyticsAiSnapshot,
  type ProductAiInput,
} from './ai.js';

const config = getConfig();
export const app = Fastify({ logger: true, trustProxy: true });
await app.register(cors, { origin: config.corsOrigins });

type RateBucket = { count: number; resetAt: number };
const publicBuckets = new Map<string, RateBucket>();
const bookingBuckets = new Map<string, RateBucket>();
const trackingBuckets = new Map<string, RateBucket>();
const aiBuckets = new Map<string, RateBucket>();
const messageBuckets = new Map<string, RateBucket>();
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
  const path = request.url.split('?')[0] ?? request.url;
  const isBooking = request.method === 'POST' && path === '/api/v1/bookings';
  const isTracking = request.method === 'GET' && path === '/api/v1/bookings/track';
  const isAnalytics = request.method === 'POST' && path === '/api/v1/analytics/events';
  const isCustomerMessage = path.startsWith('/api/v1/messages');
  const retryAfter = isBooking
    ? checkRate(bookingBuckets, request.ip, 5, 10 * 60 * 1000)
    : isTracking
      ? checkRate(trackingBuckets, request.ip, 20, 10 * 60 * 1000)
      : isAnalytics
        ? checkRate(trackingBuckets, request.ip, 120, 10 * 60 * 1000)
        : isCustomerMessage
          ? checkRate(messageBuckets, request.ip, 30, 10 * 60 * 1000)
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

const normalizeManufacturer = (row: CarBrandRecord, index: number) => ({
  id: String(firstValue(row, ['id', 'manufacturer_id']) ?? `manufacturer-${index}`),
  car_brand_id: String(firstValue(row, ['id', 'manufacturer_id']) ?? `manufacturer-${index}`),
  manufacturer_id: String(firstValue(row, ['id', 'manufacturer_id']) ?? `manufacturer-${index}`),
  slug: firstValue(row, ['slug', 'brand_slug']) ?? null,
  manufacturer_name: String(firstValue(row, ['manufacturer_name', 'brand_name', 'name']) ?? 'Unknown brand'),
  logo_url: publicImageUrl(firstValue(row, ['logo_url', 'manufacturer_logo', 'brand_logo'])),
  manufacturer_logo: publicImageUrl(firstValue(row, ['logo_url', 'manufacturer_logo', 'brand_logo'])),
  status: String(firstValue(row, ['status']) ?? 'active'),
});

async function readManufacturers() {
  const { data, error } = await getSupabaseAdmin()
    .from('manufacturers')
    .select('*')
    .eq('status', 'active')
    .eq('is_active', true)
    .order('sort_order')
    .order('manufacturer_name')
    .limit(500);
  if (error) throw error;
  return (data ?? []).map((row, index) => normalizeManufacturer(row as CarBrandRecord, index));
}

const normalizeModel = (row: CarBrandRecord, manufacturer: CarBrandRecord, index: number) => ({
  id: String(firstValue(row, ['id', 'model_id', 'model_id']) ?? `model-${index}`),
  slug: firstValue(row, ['slug', 'model_slug', 'vehicle_slug']) ?? null,
  manufacturer_name: String(
    firstValue(row, ['manufacturer_name']) ?? manufacturer.manufacturer_name ?? '',
  ),
  model_name: String(firstValue(row, ['model_name', 'model', 'car_model', 'name']) ?? ''),
  generation: firstValue(row, ['generation', 'variant', 'trim']) ?? null,
  chassis_code: firstValue(row, ['chassis_code', 'chassis']) ?? null,
  year_start: firstValue(row, ['year_start', 'from_year', 'start_year']) ?? null,
  year_end: firstValue(row, ['year_end', 'to_year', 'end_year']) ?? null,
  engine_code: firstValue(row, ['engine_code']) ?? null,
  engine_capacity: firstValue(row, ['engine_capacity']) ?? null,
  fuel_type: firstValue(row, ['fuel_type']) ?? null,
  transmission: firstValue(row, ['transmission']) ?? null,
  vehicle_type: firstValue(row, ['vehicle_type', 'type', 'body_type']) ?? null,
  cover_image_url: publicImageUrl(firstValue(row, ['cover_image_url', 'image_url', 'cover_image'])),
  vehicle_images: Array.isArray(row.vehicle_images)
    ? row.vehicle_images.map((image: unknown) => publicImageUrl(image)).filter(Boolean)
    : null,
  manufacturer_id: String(firstValue(row, ['manufacturer_id']) ?? manufacturer.id),
  car_brand_id: String(firstValue(row, ['manufacturer_id']) ?? manufacturer.id),
  status: String(firstValue(row, ['status']) ?? 'active'),
});

async function readManufacturerModels(manufacturer: CarBrandRecord) {
  const { data, error } = await getSupabaseAdmin()
    .from('car_models')
    .select('*,manufacturers(id,manufacturer_name,slug,logo_url)')
    .eq('manufacturer_id', manufacturer.id)
    .eq('status', 'active')
    .order('sort_order')
    .order('model_name')
    .limit(1000);
  if (error) throw error;
  return (data ?? [])
    .map((row, index) => normalizeModel(row as CarBrandRecord, manufacturer, index))
    .filter((model) => model.model_name);
}

async function readModelBySlug(slug: string) {
  const { data, error } = await getSupabaseAdmin()
    .from('car_models')
    .select('*,manufacturers(id,manufacturer_name,slug,logo_url)')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const manufacturer = (data as CarBrandRecord).manufacturers as CarBrandRecord | undefined;
  return normalizeModel(data as CarBrandRecord, manufacturer ?? { id: data.manufacturer_id, manufacturer_name: '' }, 0);
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

app.post(
  '/api/v1/admin/ai/suggest-product',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Body: ProductAiInput }>, reply) => {
    const admin = (request as FastifyRequest & { admin?: { id: string } }).admin;
    if (!admin) return jsonError(reply, 403, 'Active admin access required');
    const retryAfter = checkRate(aiBuckets, admin.id, 20, 60 * 60 * 1000);
    if (retryAfter !== null) {
      reply.header('Retry-After', String(retryAfter));
      return reply.code(429).send({
        error: { message: `AI limit reached. Try again in ${retryAfter} seconds.` },
      });
    }
    const input = sanitizeProductAiInput(request.body ?? ({} as ProductAiInput));
    if (!input.part_name && !input.image_url) return jsonError(reply, 400, 'Add a product name or upload an image first.');
    const supabase = getSupabaseAdmin();
    try {
      const [categories, manufacturers] = await Promise.all([
        supabase.from('parts_categories').select('category_name').eq('status', 'active').order('category_name').limit(200),
        supabase.from('manufacturers').select('manufacturer_name').order('manufacturer_name').limit(500),
      ]);
      if (categories.error || manufacturers.error)
        throw new Error('Live category and manufacturer options could not be loaded.');
      const suggestion = await suggestProductMetadata(config.geminiApiKey, config.geminiModel, input, {
        categories: (categories.data ?? []).map((row) => row.category_name),
        manufacturers: (manufacturers.data ?? []).map((row) => row.manufacturer_name),
      });
      const { data: run, error: auditError } = await supabase
        .from('admin_ai_runs')
        .insert({
          admin_id: admin.id,
          action: 'suggest_product_metadata',
          status: 'preview',
          input_data: input,
          output_data: suggestion,
        })
        .select('id,action,status,created_at')
        .single();
      if (auditError) request.log.warn({ err: auditError }, 'Could not write AI audit log');
      return { data: { run_id: run?.id ?? null, suggestion, requires_approval: true } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI request failed';
      await supabase.from('admin_ai_runs').insert({
        admin_id: admin.id,
        action: 'suggest_product_metadata',
        status: 'failed',
        input_data: input,
        error_message: message,
      });
      return jsonError(reply, message.startsWith('AI is not configured') ? 503 : 502, message);
    }
  },
);

app.get('/api/v1/admin/ai/runs', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('admin_ai_runs')
    .select('id,admin_id,action,status,input_data,output_data,error_message,created_at,updated_at')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});

app.get('/api/v1/admin/imagekit/auth', { preHandler: requireAdmin as any }, async (_request, reply) => {
  if (!config.imageKitPrivateKey || !config.imageKitPublicKey) {
    return jsonError(reply, 503, 'ImageKit is not configured. Add IMAGEKIT_PRIVATE_KEY and IMAGEKIT_PUBLIC_KEY to the API environment.');
  }
  const expire = Math.floor(Date.now() / 1000) + 10 * 60;
  const token = randomUUID();
  const signature = createHmac('sha1', config.imageKitPrivateKey)
    .update(`${token}${expire}`)
    .digest('hex');
  return { data: { token, expire, signature, publicKey: config.imageKitPublicKey } };
});

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
  try {
    const data = await readManufacturers();
    return { data };
  } catch (error) {
    return jsonError(reply, 500, error instanceof Error ? error.message : 'Unable to load manufacturers');
  }
});

app.get(
  '/api/v1/car-brands/slug/:slug',
  async (request: FastifyRequest<{ Params: { slug: string } }>, reply) => {
    reply.header('Cache-Control', 'no-store, max-age=0');
    const supabase = getSupabaseAdmin();
    const { data: brand, error: brandError } = await supabase
      .from('manufacturers')
      .select('*')
      .eq('slug', request.params.slug)
      .eq('is_active', true)
      .eq('status', 'active')
      .maybeSingle();
    if (brandError) return jsonError(reply, 500, brandError.message);
    if (!brand) return jsonError(reply, 404, 'Car brand not found');
    const vehicles = await readManufacturerModels(brand as CarBrandRecord);
    return { data: { brand: normalizeManufacturer(brand as CarBrandRecord, 0), vehicles } };
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
        '*,parts_categories(id,category_name,slug),manufacturers(id,manufacturer_name,slug,logo_url),part_model_fitments(model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,year_start,year_end,generation,chassis_code,slug))',
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
        '*,parts_categories(id,category_name,slug),manufacturers(id,manufacturer_name,slug,logo_url),part_model_fitments(model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,year_start,year_end,generation,chassis_code,slug))',
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
    request: FastifyRequest<{ Querystring: { search?: string; status?: string; limit?: string; offset?: string } }>,
    reply,
  ) => {
    reply.header('Cache-Control', 'no-store, max-age=0');
    const q = request.query;
    const { data, error } = await getSupabaseAdmin()
      .from('car_models')
      .select('*,manufacturers(id,manufacturer_name,slug,logo_url)')
      .eq('status', q.status ?? 'active')
      .order('sort_order')
      .order('model_name')
      .limit(1000);
    if (error) return jsonError(reply, 500, error.message);
    const search = q.search?.toLowerCase();
    let rows = (data ?? []).map((row, index) => {
      const record = row as CarBrandRecord;
      const manufacturer = (record.manufacturers as CarBrandRecord | undefined) ?? { id: record.manufacturer_id, manufacturer_name: '' };
      return normalizeModel(record, manufacturer, index);
    });
    if (search) rows = rows.filter((item) => [item.manufacturer_name, item.model_name, item.chassis_code].filter(Boolean).some((value) => String(value).toLowerCase().includes(search)));
    rows.sort((left, right) => `${left.manufacturer_name} ${left.model_name}`.localeCompare(`${right.manufacturer_name} ${right.model_name}`));
    const start = Number(q.offset) || 0;
    return { data: rows.slice(start, start + limit(q.limit)) };
  },
);

app.get(
  '/api/v1/vehicles/slug/:slug',
  async (request: FastifyRequest<{ Params: { slug: string } }>, reply) => {
    reply.header('Cache-Control', 'no-store, max-age=0');
    const supabase = getSupabaseAdmin();
    const { data: vehicle, error: vehicleError } = await supabase
      .from('car_models')
      .select('*,manufacturers(id,manufacturer_name,slug,logo_url)')
      .eq('slug', request.params.slug)
      .eq('status', 'active')
      .maybeSingle();
    if (vehicleError) return jsonError(reply, 500, vehicleError.message);
    if (!vehicle) return jsonError(reply, 404, 'Vehicle not found');
    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('*,parts_categories(id,category_name,slug),manufacturers(id,manufacturer_name,slug,logo_url),part_model_fitments!inner(model_id)')
      .eq('part_model_fitments.model_id', vehicle.id)
      .eq('status', 'active')
      .order('position')
      .order('part_name')
      .limit(200);
    if (partsError) return jsonError(reply, 500, partsError.message);
    const manufacturer = (vehicle as CarBrandRecord).manufacturers as CarBrandRecord | undefined;
    const normalizedVehicle = normalizeModel(vehicle as CarBrandRecord, manufacturer ?? { id: vehicle.manufacturer_id, manufacturer_name: '' }, 0);
    return { data: { vehicle: normalizedVehicle, parts: parts ?? [] } };
  },
);

app.get('/api/v1/homepage-selected-vehicles', async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('car_models')
    .select('*,manufacturers(id,manufacturer_name,slug,logo_url)')
    .eq('status', 'active')
    .order('sort_order')
    .order('model_name')
    .limit(200);
  if (error) return jsonError(reply, 500, error.message);
  return { data: (data ?? []).map((row, index) => { const record = row as CarBrandRecord; const manufacturer = (record.manufacturers as CarBrandRecord | undefined) ?? { id: record.manufacturer_id, manufacturer_name: '' }; return normalizeModel(record, manufacturer, index); }) };
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
        .from('car_models')
        .select('id')
                .eq('manufacturer_id', q.car_brand_id)
        .eq('status', 'active')
        .limit(1000);
      if (brandVehiclesError) return jsonError(reply, 500, brandVehiclesError.message);
      vehicleIds = (brandVehicles ?? []).map((vehicle) => vehicle.id);
    }
    const hasFitmentFilter = Boolean(q.vehicle_id || q.car_brand_id);
    let query = getSupabaseAdmin()
      .from('parts')
      .select(
        '*,parts_categories(id,category_name,slug),manufacturers(id,manufacturer_name,slug,logo_url),part_model_fitments!inner(model_id,compatible_years)',
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
    if (q.vehicle_id) query = query.eq('part_model_fitments.model_id', q.vehicle_id);
    if (vehicleIds) query = query.in('part_model_fitments.model_id', vehicleIds);
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
        '*,parts_categories(id,category_name,slug,image_url),manufacturers(id,manufacturer_name,slug,logo_url),part_model_fitments(model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,manufacturer_id,model_name,generation,chassis_code,slug,year_start,year_end,manufacturers(id,manufacturer_name,slug,logo_url)))',
      )
      .eq('slug', request.params.slug)
      .eq('status', 'active')
      .maybeSingle();
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
          .from('car_models')
          .select('id,model_name,generation,manufacturer_id,manufacturers(manufacturer_name)')
          .in('id', vehicleIds)
          .eq('status', 'active')
      : { data: [], error: null };
    if (vehiclesError) return jsonError(reply, 500, 'Unable to verify vehicle fitment');
    if (vehicles.length !== vehicleIds.length)
      return jsonError(reply, 400, 'The selected vehicle is no longer available');
    const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

    if (vehicleIds.length) {
      const { data: fitments, error: fitmentError } = await supabase
        .from('part_model_fitments')
        .select('part_id,model_id')
        .in('part_id', partIds)
        .in('model_id', vehicleIds);
      if (fitmentError) return jsonError(reply, 500, 'Unable to verify part fitment');
      const fitmentKeys = new Set(
        (fitments ?? []).map((fitment) => `${fitment.part_id}:${fitment.model_id}`),
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
          ? `${Array.isArray(vehicle.manufacturers) ? vehicle.manufacturers[0]?.manufacturer_name ?? '' : ''} ${vehicle.model_name}${vehicle.generation ? ` · ${vehicle.generation}` : ''}`.trim()
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

const messageText = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength) : '';
const messageTokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
const messageEmail = (value: unknown) => {
  const email = messageText(value, 254).toLowerCase();
  return email && /^\S+@\S+\.\S+$/.test(email) ? email : '';
};
const publicMessage = (row: Record<string, unknown>) => ({
  id: row.id,
  thread_id: row.thread_id,
  sender_type: row.sender_type,
  customer_name: row.customer_name,
  subject: row.subject,
  message: row.message,
  status: row.status,
  created_at: row.created_at,
});

app.post(
  '/api/v1/messages',
  async (
    request: FastifyRequest<{ Body: { customer_name?: string; customer_email?: string; customer_phone?: string; subject?: string; message?: string } }>,
    reply,
  ) => {
    const body = request.body ?? {};
    const customerName = messageText(body.customer_name, 160);
    const customerEmail = messageEmail(body.customer_email);
    const customerPhone = messageText(body.customer_phone, 40);
    const subject = messageText(body.subject, 160) || 'Customer message';
    const message = messageText(body.message, 4000);
    if (customerName.length < 2 || message.length < 1) return jsonError(reply, 400, 'Your name and message are required.');
    if (body.customer_email && !customerEmail) return jsonError(reply, 400, 'Please enter a valid email address.');
    const accessToken = randomUUID();
    const threadId = randomUUID();
    const { data, error } = await getSupabaseAdmin().from('customer_messages').insert({
      thread_id: threadId,
      access_token_hash: messageTokenHash(accessToken),
      sender_type: 'customer',
      customer_name: customerName,
      customer_email: customerEmail || null,
      customer_phone: customerPhone || null,
      subject,
      message,
      status: 'new',
    }).select('id,thread_id,sender_type,customer_name,subject,message,status,created_at').single();
    if (error || !data) return jsonError(reply, 400, 'Your message could not be sent. Please try again.');
    return reply.code(201).send({ data: { thread_id: threadId, access_token: accessToken, message: publicMessage(data as Record<string, unknown>) } });
  },
);

app.get(
  '/api/v1/messages/thread',
  async (request: FastifyRequest<{ Querystring: { thread_id?: string; access_token?: string } }>, reply) => {
    const threadId = messageText(request.query.thread_id, 80);
    const accessToken = messageText(request.query.access_token, 80);
    if (!/^[0-9a-f-]{36}$/i.test(threadId) || !accessToken) return jsonError(reply, 400, 'A valid message thread is required.');
    const { data, error } = await getSupabaseAdmin().from('customer_messages').select('id,thread_id,sender_type,customer_name,subject,message,status,created_at').eq('thread_id', threadId).eq('access_token_hash', messageTokenHash(accessToken)).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: true }).limit(100);
    if (error || !data?.length) return jsonError(reply, 404, 'Message thread not found.');
    await getSupabaseAdmin().from('customer_messages').update({ status: 'read', read_at: new Date().toISOString() }).eq('thread_id', threadId).eq('sender_type', 'admin').eq('status', 'replied');
    return { data: data.map((row) => publicMessage(row as Record<string, unknown>)) };
  },
);

app.post(
  '/api/v1/messages/thread/reply',
  async (request: FastifyRequest<{ Body: { thread_id?: string; access_token?: string; message?: string } }>, reply) => {
    const body = request.body ?? {};
    const threadId = messageText(body.thread_id, 80);
    const accessToken = messageText(body.access_token, 80);
    const message = messageText(body.message, 4000);
    if (!/^[0-9a-f-]{36}$/i.test(threadId) || !accessToken || !message) return jsonError(reply, 400, 'Your message is required.');
    const supabase = getSupabaseAdmin();
    const { data: thread, error: threadError } = await supabase.from('customer_messages').select('id,customer_name,customer_email,customer_phone,subject,expires_at').eq('thread_id', threadId).eq('access_token_hash', messageTokenHash(accessToken)).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (threadError || !thread) return jsonError(reply, 404, 'Message thread not found.');
    const { data, error } = await supabase.from('customer_messages').insert({ thread_id: threadId, access_token_hash: messageTokenHash(accessToken), sender_type: 'customer', customer_name: thread.customer_name, customer_email: thread.customer_email, customer_phone: thread.customer_phone, subject: thread.subject, message, status: 'new', reply_to_id: thread.id, expires_at: thread.expires_at }).select('id,thread_id,sender_type,customer_name,subject,message,status,created_at').single();
    if (error || !data) return jsonError(reply, 400, 'Your reply could not be sent.');
    return reply.code(201).send({ data: publicMessage(data as Record<string, unknown>) });
  },
);

app.get('/api/v1/admin/messages', { preHandler: requireAdmin as any }, async (request: FastifyRequest<{ Querystring: { status?: string } }>, reply) => {
  const allowedStatuses = ['new', 'read', 'replied', 'closed'];
  const status = allowedStatuses.includes(request.query.status ?? '') ? request.query.status : null;
  let query = getSupabaseAdmin().from('customer_messages').select('id,thread_id,sender_type,admin_id,customer_name,customer_email,customer_phone,subject,message,status,reply_to_id,read_at,created_at').gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(500);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return jsonError(reply, 500, 'Customer messages could not be loaded.');
  return { data: data ?? [] };
});

app.post('/api/v1/admin/messages/:threadId/reply', { preHandler: requireAdmin as any }, async (request: FastifyRequest<{ Params: { threadId: string }; Body: { message?: string } }>, reply) => {
  const message = messageText(request.body?.message, 4000);
  if (!/^[0-9a-f-]{36}$/i.test(request.params.threadId) || !message) return jsonError(reply, 400, 'A reply message is required.');
  const supabase = getSupabaseAdmin();
  const { data: thread, error: threadError } = await supabase.from('customer_messages').select('id,access_token_hash,customer_name,customer_email,customer_phone,subject,expires_at').eq('thread_id', request.params.threadId).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (threadError || !thread) return jsonError(reply, 404, 'Customer message thread not found.');
  const admin = (request as FastifyRequest & { admin?: { id: string } }).admin;
  const { data, error } = await supabase.from('customer_messages').insert({ thread_id: request.params.threadId, access_token_hash: thread.access_token_hash, sender_type: 'admin', admin_id: admin?.id ?? null, customer_name: thread.customer_name, customer_email: thread.customer_email, customer_phone: thread.customer_phone, subject: thread.subject, message, status: 'replied', reply_to_id: thread.id, expires_at: thread.expires_at }).select('id,thread_id,sender_type,customer_name,subject,message,status,created_at').single();
  if (error || !data) return jsonError(reply, 400, 'Admin reply could not be sent.');
  await supabase.from('customer_messages').update({ status: 'replied' }).eq('thread_id', request.params.threadId).eq('sender_type', 'customer').neq('status', 'closed');
  return reply.code(201).send({ data });
});

app.patch('/api/v1/admin/messages/:threadId/status', { preHandler: requireAdmin as any }, async (request: FastifyRequest<{ Params: { threadId: string }; Body: { status?: string } }>, reply) => {
  const status = request.body?.status;
  if (!['new', 'read', 'replied', 'closed'].includes(status ?? '')) return jsonError(reply, 400, 'Invalid message status.');
  const { error } = await getSupabaseAdmin().from('customer_messages').update({ status, read_at: status === 'read' ? new Date().toISOString() : null }).eq('thread_id', request.params.threadId).gt('expires_at', new Date().toISOString());
  if (error) return jsonError(reply, 400, 'Message status could not be updated.');
  return { data: { thread_id: request.params.threadId, status } };
});

app.get('/api/v1/admin/dashboard', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const supabase = getSupabaseAdmin();
  const [parts, vehicles, bookings, admins] = await Promise.all([
    supabase.from('parts').select('id', { count: 'exact', head: true }),
    supabase.from('car_models').select('id', { count: 'exact', head: true }).eq('status', 'active'),
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

type AnalyticsAttribution = {
  source: string;
  medium: string;
  campaign: string | null;
  referrer_host: string | null;
};

type AnalyticsClientData = {
  language: string | null;
  timezone: string | null;
  screen_width: number | null;
  screen_height: number | null;
  viewport_width: number | null;
  viewport_height: number | null;
};

const cleanAnalyticsText = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength);
  return cleaned || null;
};

const cleanAnalyticsPath = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const path = value.trim();
  if (!path.startsWith('/') || path.startsWith('//') || /[?#\\\u0000-\u001f\u007f]/.test(path))
    return null;
  return path.slice(0, 300);
};

const cleanAnalyticsReferrer = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.length > 2000) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return `${url.origin}${url.pathname}`.slice(0, 400);
  } catch {
    return null;
  }
};

const safeDimension = (value: unknown): number | null =>
  Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 10000 ? Number(value) : null;

const parseAnalyticsAttribution = (value: unknown): AnalyticsAttribution => {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const source = cleanAnalyticsText(input.source, 40) ?? 'Direct';
  const medium = cleanAnalyticsText(input.medium, 40) ?? 'direct';
  return {
    source,
    medium,
    campaign: cleanAnalyticsText(input.campaign, 120),
    referrer_host: cleanAnalyticsText(input.referrer_host, 160),
  };
};

const parseAnalyticsClientData = (value: unknown): AnalyticsClientData => {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    language: cleanAnalyticsText(input.language, 32),
    timezone: cleanAnalyticsText(input.timezone, 64),
    screen_width: safeDimension(input.screen_width),
    screen_height: safeDimension(input.screen_height),
    viewport_width: safeDimension(input.viewport_width),
    viewport_height: safeDimension(input.viewport_height),
  };
};

const analyticsUserAgentProfile = (userAgentValue: unknown) => {
  const userAgent = typeof userAgentValue === 'string' ? userAgentValue.slice(0, 1000) : '';
  const deviceType = /ipad|tablet/i.test(userAgent)
    ? 'tablet'
    : /mobile|iphone|ipod|android/i.test(userAgent)
      ? 'mobile'
      : 'desktop';
  const browser = /edg\//i.test(userAgent)
    ? 'Edge'
    : /opr\//i.test(userAgent)
      ? 'Opera'
      : /samsungbrowser/i.test(userAgent)
        ? 'Samsung Internet'
        : /firefox\//i.test(userAgent)
          ? 'Firefox'
          : /chrome\//i.test(userAgent)
            ? 'Chrome'
            : /safari\//i.test(userAgent)
              ? 'Safari'
              : 'Other';
  const operatingSystem = /android/i.test(userAgent)
    ? 'Android'
    : /iphone|ipad|ipod/i.test(userAgent)
      ? 'iOS'
      : /windows/i.test(userAgent)
        ? 'Windows'
        : /mac os|macintosh/i.test(userAgent)
          ? 'macOS'
          : /cros/i.test(userAgent)
            ? 'ChromeOS'
            : /linux/i.test(userAgent)
              ? 'Linux'
              : 'Other';
  const iosDevice = /ipad/i.test(userAgent) ? 'iPad' : /ipod/i.test(userAgent) ? 'iPod' : /iphone/i.test(userAgent) ? 'iPhone' : null;
  const androidModel = userAgent.match(/Android[^;)]*;\s*([^;)]+)/i)?.[1]
    ?.replace(/\s+Build\/.*$/i, '')
    .trim();
  const deviceModel = iosDevice ?? (androidModel && !/^k$/i.test(androidModel)
    ? cleanAnalyticsText(androidModel, 64)
    : null);
  return { deviceType, browser, operatingSystem, deviceModel };
};

const proxyLocationValue = (value: unknown, maxLength = 80): string | null => {
  if (typeof value !== 'string') return null;
  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep the original proxy value if it is not percent-encoded.
  }
  return cleanAnalyticsText(decoded, maxLength);
};

app.post(
  '/api/v1/analytics/events',
  async (request: FastifyRequest<{ Body: Record<string, unknown> }>, reply) => {
    const body = request.body ?? {};
    if (body.consent_granted !== true || body.consent_version !== 2)
      return jsonError(reply, 400, 'Explicit analytics consent is required.');
    const sessionId = typeof body.session_id === 'string' ? body.session_id : '';
    const visitorId = typeof body.visitor_id === 'string' ? body.visitor_id : '';
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId))
      return jsonError(reply, 400, 'A valid analytics session identifier is required.');
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId))
      return jsonError(reply, 400, 'A valid analytics visitor identifier is required.');
    if (body.event_name !== 'page_view' && body.event_name !== 'page_exit')
      return jsonError(reply, 400, 'Unsupported analytics event.');
    const pagePath = cleanAnalyticsPath(body.page_path);
    if (!pagePath) return jsonError(reply, 400, 'A sanitized page path is required.');

    const clientData = parseAnalyticsClientData(body.client_data);
    const attribution = parseAnalyticsAttribution(body.attribution);
    const pageTitle = cleanAnalyticsText(body.page_title, 180);
    const referrer = cleanAnalyticsReferrer(body.referrer);
    const duration = body.duration_ms;
    const durationMs =
      body.event_name === 'page_exit' && Number.isInteger(duration)
        ? Math.min(Math.max(Number(duration), 0), 24 * 60 * 60 * 1000)
        : null;
    const profile = analyticsUserAgentProfile(request.headers['user-agent']);
    const ipAddress = isIP(request.ip) ? request.ip : null;
    const hasVercelProxy = typeof request.headers['x-vercel-id'] === 'string';
    const countryHeader = hasVercelProxy ? request.headers['x-vercel-ip-country'] : null;
    const country = typeof countryHeader === 'string' && /^[A-Z]{2}$/i.test(countryHeader)
      ? countryHeader.toUpperCase()
      : null;
    const region = hasVercelProxy
      ? proxyLocationValue(request.headers['x-vercel-ip-country-region'])
      : null;
    const city = hasVercelProxy ? proxyLocationValue(request.headers['x-vercel-ip-city']) : null;
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    const sessionHash = createHash('sha256').update(sessionId).digest('hex');
    const visitorHash = createHmac('sha256', config.serviceRoleKey).update(visitorId).digest('hex');
    const { data: existingSession, error: existingSessionError } = await supabase
      .from('analytics_sessions')
      .select('id,visit_number')
      .eq('id', sessionId)
      .maybeSingle();
    if (existingSessionError) return jsonError(reply, 500, 'Analytics session could not be checked.');
    const { data: existingVisitor, error: existingVisitorError } = await supabase
      .from('analytics_visitors')
      .select('visit_count,total_page_views,first_landing_path,first_referrer,first_acquisition_source,first_acquisition_medium,first_acquisition_campaign')
      .eq('visitor_hash', visitorHash)
      .maybeSingle();
    if (existingVisitorError) return jsonError(reply, 500, 'Analytics visitor could not be checked.');
    const isPageView = body.event_name === 'page_view';
    const isNewVisit = isPageView && !existingSession;
    const visitorVisitNumber = Math.max(1, (existingVisitor?.visit_count ?? 0) + (isNewVisit ? 1 : 0));
    const { error: visitorError } = await supabase.from('analytics_visitors').upsert({
      visitor_hash: visitorHash,
      first_seen_at: existingVisitor ? undefined : now,
      last_seen_at: now,
      visit_count: visitorVisitNumber,
      total_page_views: (existingVisitor?.total_page_views ?? 0) + (isPageView ? 1 : 0),
      last_session_id: existingSession ? sessionId : null,
      first_landing_path: existingVisitor?.first_landing_path ?? pagePath,
      last_path: pagePath,
      first_referrer: existingVisitor?.first_referrer ?? referrer,
      first_acquisition_source: existingVisitor?.first_acquisition_source ?? attribution.source,
      first_acquisition_medium: existingVisitor?.first_acquisition_medium ?? attribution.medium,
      first_acquisition_campaign: existingVisitor?.first_acquisition_campaign ?? attribution.campaign,
      country_code: country,
      region,
      city,
      device_type: profile.deviceType,
      device_model: profile.deviceModel,
      browser: profile.browser,
      operating_system: profile.operatingSystem,
      language: clientData.language,
      timezone: clientData.timezone,
      consent_version: 2,
      updated_at: now,
    }, { onConflict: 'visitor_hash' });
    if (visitorError) return jsonError(reply, 500, 'Analytics visitor could not be saved.');

    const { error: createSessionError } = await supabase.from('analytics_sessions').upsert(
      {
        id: sessionId,
        visitor_hash: sessionHash,
        visitor_id_hash: visitorHash,
        visit_number: Number(visitorVisitNumber ?? 1),
        started_at: now,
        last_seen_at: now,
        landing_path: pagePath,
        current_path: pagePath,
        exit_path: body.event_name === 'page_exit' ? pagePath : null,
        referrer,
        ip_address: ipAddress,
        country_code: country,
        region,
        city,
        device_type: profile.deviceType,
        device_model: profile.deviceModel,
        browser: profile.browser,
        operating_system: profile.operatingSystem,
        language: clientData.language,
        timezone: clientData.timezone,
        screen_width: clientData.screen_width,
        screen_height: clientData.screen_height,
        viewport_width: clientData.viewport_width,
        viewport_height: clientData.viewport_height,
        consent_version: 2,
        consent_granted_at: now,
        acquisition_source: attribution.source,
        acquisition_medium: attribution.medium,
        acquisition_campaign: attribution.campaign,
        landing_referrer_host: attribution.referrer_host,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    );
    if (createSessionError) return jsonError(reply, 500, 'Analytics session could not be saved.');
    const { error: visitorSessionLinkError } = await supabase
      .from('analytics_visitors')
      .update({ last_session_id: sessionId, updated_at: now })
      .eq('visitor_hash', visitorHash);
    if (visitorSessionLinkError) return jsonError(reply, 500, 'Analytics visitor session link could not be saved.');

    const { error: updateSessionError } = await supabase
      .from('analytics_sessions')
      .update({
        last_seen_at: now,
        current_path: pagePath,
        exit_path: body.event_name === 'page_exit' ? pagePath : null,
        ip_address: ipAddress,
        country_code: country,
        region,
        city,
        device_type: profile.deviceType,
        device_model: profile.deviceModel,
        browser: profile.browser,
        operating_system: profile.operatingSystem,
        language: clientData.language,
        timezone: clientData.timezone,
        screen_width: clientData.screen_width,
        screen_height: clientData.screen_height,
        viewport_width: clientData.viewport_width,
        viewport_height: clientData.viewport_height,
        acquisition_source: attribution.source,
        acquisition_medium: attribution.medium,
        acquisition_campaign: attribution.campaign,
        landing_referrer_host: attribution.referrer_host,
      })
      .eq('id', sessionId);
    if (updateSessionError) return jsonError(reply, 500, 'Analytics session could not be updated.');

    const { error: eventError } = await supabase.from('analytics_events').insert({
      session_id: sessionId,
      event_name: body.event_name,
      page_path: pagePath,
      page_title: pageTitle,
      referrer,
      duration_ms: durationMs,
      event_data: clientData,
    });
    if (eventError) return jsonError(reply, 500, 'Analytics event could not be saved.');
    return reply.code(202).send({ data: { accepted: true } });
  },
);

app.get(
  '/api/v1/admin/analytics',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{ Querystring: { days?: string } }>,
    reply,
  ) => {
    const requestedDays = Number(request.query.days);
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
    const now = Date.now();
    const windowMs = days * 24 * 60 * 60 * 1000;
    const since = new Date(now - windowMs).toISOString();
    const previousSince = new Date(now - 2 * windowMs).toISOString();
    const activeSince = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const supabase = getSupabaseAdmin();
    const [sessionsCount, pageViewsCount, previousSessionsCount, previousPageViewsCount, activeCount, uniqueVisitorsCount, returningVisitorsCount, sampledSessions, sampledEvents, sampledVisitors, hourlyActivity] =
      await Promise.all([
        supabase.from('analytics_sessions').select('id', { count: 'exact', head: true }).gte('started_at', since),
        supabase
          .from('analytics_events')
          .select('id', { count: 'exact', head: true })
          .eq('event_name', 'page_view')
          .gte('created_at', since),
        supabase.from('analytics_sessions').select('id', { count: 'exact', head: true }).gte('started_at', previousSince).lt('started_at', since),
        supabase
          .from('analytics_events')
          .select('id', { count: 'exact', head: true })
          .eq('event_name', 'page_view')
          .gte('created_at', previousSince)
          .lt('created_at', since),
        supabase
          .from('analytics_sessions')
          .select('id', { count: 'exact', head: true })
          .gte('last_seen_at', activeSince),
        supabase
          .from('analytics_visitors')
          .select('visitor_hash', { count: 'exact', head: true })
          .gte('last_seen_at', since),
        supabase
          .from('analytics_visitors')
          .select('visitor_hash', { count: 'exact', head: true })
          .gte('last_seen_at', since)
          .gt('visit_count', 1),
        supabase
          .from('analytics_sessions')
          .select('id,visitor_id_hash,visit_number,started_at,last_seen_at,landing_path,current_path,exit_path,referrer,acquisition_source,acquisition_medium,acquisition_campaign,landing_referrer_host,ip_address,country_code,region,city,device_type,device_model,browser,operating_system,language,timezone')
          .gte('started_at', since)
          .order('last_seen_at', { ascending: false })
          .limit(1000),
        supabase
          .from('analytics_events')
          .select('id,session_id,event_name,page_path,page_title,referrer,duration_ms,created_at')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(2000),
        supabase
          .from('analytics_visitors')
          .select('visitor_hash,first_seen_at,last_seen_at,visit_count,total_page_views,first_landing_path,last_path,first_referrer,first_acquisition_source,first_acquisition_medium,first_acquisition_campaign,country_code,region,city,device_type,device_model,browser,operating_system,language,timezone,last_session_id')
          .gte('last_seen_at', since)
          .order('last_seen_at', { ascending: false })
          .limit(100),
        supabase.rpc('admin_analytics_hourly', { p_hours: 24 }),
      ]);
    const queryError = sessionsCount.error ?? pageViewsCount.error ?? previousSessionsCount.error ?? previousPageViewsCount.error ?? activeCount.error ?? uniqueVisitorsCount.error ?? returningVisitorsCount.error ?? sampledSessions.error ?? sampledEvents.error ?? sampledVisitors.error ?? hourlyActivity.error;
    if (queryError) return jsonError(reply, 500, 'Analytics could not be loaded.');

    const pageCounts = new Map<string, number>();
    for (const event of sampledEvents.data ?? []) {
      if (event.event_name === 'page_view')
        pageCounts.set(event.page_path, (pageCounts.get(event.page_path) ?? 0) + 1);
    }
    const groupCounts = (values: Array<string | null | undefined>) => {
      const counts = new Map<string, number>();
      for (const value of values) {
        const label = value?.trim() || 'Unknown';
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
      return [...counts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    };
    const sessionRows = sampledSessions.data ?? [];
    const eventRows = sampledEvents.data ?? [];
    const topPages = [...pageCounts.entries()]
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    const countries = groupCounts(sessionRows.map((session) => session.country_code));
    const locations = groupCounts(
      sessionRows.map((session) => [session.city, session.region, session.country_code].filter(Boolean).join(', ')),
    );
    const devices = groupCounts(
      sessionRows.map((session) => [session.device_type, session.operating_system].filter(Boolean).join(' · ')),
    );
    const browsers = groupCounts(sessionRows.map((session) => session.browser));
    const acquisition_sources = groupCounts(sessionRows.map((session) => session.acquisition_source));
    const acquisition_mediums = groupCounts(sessionRows.map((session) => session.acquisition_medium));

    return {
      data: {
        days,
        totals: {
          sessions: sessionsCount.count ?? 0,
          page_views: pageViewsCount.count ?? 0,
          previous_sessions: previousSessionsCount.count ?? 0,
          previous_page_views: previousPageViewsCount.count ?? 0,
          active_last_30m: activeCount.count ?? 0,
          unique_visitors: uniqueVisitorsCount.count ?? 0,
          returning_visitors: returningVisitorsCount.count ?? 0,
        },
        sample_sizes: { sessions: sessionRows.length, events: eventRows.length },
        hourly_activity: (hourlyActivity.data ?? []).map((row: { hour_start: string; page_views: number; page_exits: number; sessions: number }) => ({
          hour_start: row.hour_start,
          page_views: Number(row.page_views) || 0,
          page_exits: Number(row.page_exits) || 0,
          sessions: Number(row.sessions) || 0,
        })),
        top_pages: topPages,
        countries,
        locations,
        devices,
        browsers,
        acquisition_sources,
        acquisition_mediums,
        visitors: (sampledVisitors.data ?? []).map((visitor) => ({
          visitor_ref: `V-${visitor.visitor_hash.slice(0, 10).toUpperCase()}`,
          first_seen_at: visitor.first_seen_at, last_seen_at: visitor.last_seen_at,
          visit_count: visitor.visit_count, total_page_views: visitor.total_page_views,
          first_landing_path: visitor.first_landing_path, last_path: visitor.last_path,
          first_referrer: visitor.first_referrer, first_acquisition_source: visitor.first_acquisition_source, first_acquisition_medium: visitor.first_acquisition_medium, first_acquisition_campaign: visitor.first_acquisition_campaign, country_code: visitor.country_code,
          region: visitor.region, city: visitor.city, device_type: visitor.device_type,
          device_model: visitor.device_model, browser: visitor.browser,
          operating_system: visitor.operating_system, language: visitor.language,
          timezone: visitor.timezone, last_session_ref: visitor.last_session_id ? visitor.last_session_id.slice(0, 8) : null,
        })),
        recent_sessions: sessionRows.slice(0, 50).map((session) => ({
          session_ref: session.id.slice(0, 8),
          visitor_ref: session.visitor_id_hash ? `V-${session.visitor_id_hash.slice(0, 10).toUpperCase()}` : 'Legacy visitor',
          acquisition_source: session.acquisition_source ?? 'Direct',
          acquisition_medium: session.acquisition_medium ?? 'direct',
          acquisition_campaign: session.acquisition_campaign,
          landing_referrer_host: session.landing_referrer_host,
          visit_number: session.visit_number ?? 1,
          started_at: session.started_at,
          last_seen_at: session.last_seen_at,
          duration_ms: Math.max(0, new Date(session.last_seen_at).getTime() - new Date(session.started_at).getTime()),
          landing_path: session.landing_path,
          current_path: session.current_path,
          exit_path: session.exit_path,
          referrer: session.referrer,
          ip_address: session.ip_address,
          country_code: session.country_code,
          region: session.region,
          city: session.city,
          device_type: session.device_type,
          device_model: session.device_model,
          browser: session.browser,
          operating_system: session.operating_system,
          language: session.language,
          timezone: session.timezone,
        })),
        recent_events: eventRows.slice(0, 100).map((event) => ({
          session_ref: event.session_id.slice(0, 8),
          event_name: event.event_name,
          page_path: event.page_path,
          page_title: event.page_title,
          referrer: event.referrer,
          duration_ms: event.duration_ms,
          created_at: event.created_at,
        })),
      },
    };
  },
);

app.post(
  '/api/v1/admin/analytics/insights',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Body: { days?: number } }>, reply) => {
    const admin = (request as FastifyRequest & { admin?: { id: string } }).admin;
    if (!admin) return jsonError(reply, 403, 'Active admin access required');
    const supabase = getSupabaseAdmin();
    const { data: rateData, error: rateError } = await supabase.rpc('consume_admin_ai_rate_limit', {
      p_admin_id: admin.id,
      p_action: 'analytics_insights',
      p_limit: 8,
      p_window_seconds: 3600,
    });
    const rate = Array.isArray(rateData) ? rateData[0] : rateData;
    if (rateError || !rate) {
      request.log.error({ err: rateError }, 'Could not verify analytics AI rate limit');
      return jsonError(reply, 503, 'Analytics AI is temporarily unavailable. Please try again shortly.');
    }
    if (!rate.allowed) {
      const retryAfter = Math.max(1, Number(rate.retry_after_seconds) || 3600);
      reply.header('Retry-After', String(retryAfter));
      return reply.code(429).send({ error: { message: `Analytics AI limit reached. Try again in ${retryAfter} seconds.` } });
    }
    const requestedDays = Number(request.body?.days);
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
    const now = Date.now();
    const windowMs = days * 24 * 60 * 60 * 1000;
    const since = new Date(now - windowMs).toISOString();
    const previousSince = new Date(now - 2 * windowMs).toISOString();
    const activeSince = new Date(now - 30 * 60 * 1000).toISOString();
    const [sessionsCount, pageViewsCount, previousSessionsCount, previousPageViewsCount, activeCount, uniqueVisitorsCount, sampledSessions, sampledEvents, hourlyActivity] = await Promise.all([
      supabase.from('analytics_sessions').select('id', { count: 'exact', head: true }).gte('started_at', since),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_name', 'page_view').gte('created_at', since),
      supabase.from('analytics_sessions').select('id', { count: 'exact', head: true }).gte('started_at', previousSince).lt('started_at', since),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).eq('event_name', 'page_view').gte('created_at', previousSince).lt('created_at', since),
      supabase.from('analytics_sessions').select('id', { count: 'exact', head: true }).gte('last_seen_at', activeSince),
      supabase.from('analytics_visitors').select('visitor_hash', { count: 'exact', head: true }).gte('last_seen_at', since),
      supabase.from('analytics_sessions').select('acquisition_source,device_type,landing_path,exit_path,started_at,last_seen_at').gte('started_at', since).order('started_at', { ascending: false }).limit(5000),
      supabase.from('analytics_events').select('event_name,page_path,duration_ms,created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
      supabase.rpc('admin_analytics_hourly', { p_hours: 24 }),
    ]);
    const queryError = sessionsCount.error ?? pageViewsCount.error ?? previousSessionsCount.error ?? previousPageViewsCount.error ?? activeCount.error ?? uniqueVisitorsCount.error ?? sampledSessions.error ?? sampledEvents.error ?? hourlyActivity.error;
    if (queryError) return jsonError(reply, 500, 'Analytics insight data could not be prepared.');

    const sessions = sampledSessions.data ?? [];
    const events = sampledEvents.data ?? [];
    const group = (values: Array<string | null | undefined>, maximum = 10) => {
      const counts = new Map<string, number>();
      for (const value of values) {
        const label = value?.trim() || 'Unknown';
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
      return [...counts.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, maximum);
    };
    const pageCounts = new Map<string, number>();
    for (const event of events) {
      if (event.event_name === 'page_view') pageCounts.set(event.page_path, (pageCounts.get(event.page_path) ?? 0) + 1);
    }
    const durations = sessions
      .map((session) => Math.max(0, new Date(session.last_seen_at).getTime() - new Date(session.started_at).getTime()) / 1000)
      .filter(Number.isFinite);
    const snapshot: AnalyticsAiSnapshot = {
      period_days: days,
      generated_at: new Date().toISOString(),
      totals: {
        sessions: sessionsCount.count ?? 0,
        page_views: pageViewsCount.count ?? 0,
        active_sessions: activeCount.count ?? 0,
        unique_visitors: uniqueVisitorsCount.count ?? 0,
        previous_sessions: previousSessionsCount.count ?? 0,
        previous_page_views: previousPageViewsCount.count ?? 0,
      },
      sampled_rows: { sessions: sessions.length, events: events.length },
      hourly_activity: (hourlyActivity.data ?? []).map((row: { hour_start: string; sessions: number; page_views: number; page_exits: number }) => ({
        hour: row.hour_start,
        sessions: Number(row.sessions) || 0,
        page_views: Number(row.page_views) || 0,
        page_exits: Number(row.page_exits) || 0,
      })),
      top_pages: [...pageCounts.entries()].map(([path, views]) => ({ path, views })).sort((a, b) => b.views - a.views).slice(0, 10),
      landing_pages: group(sessions.map((session) => session.landing_path), 8).map((row) => ({ path: row.label, count: row.count })),
      exit_pages: group(sessions.map((session) => session.exit_path), 8).filter((row) => row.label !== 'Unknown').map((row) => ({ path: row.label, count: row.count })),
      acquisition_sources: group(sessions.map((session) => session.acquisition_source)),
      devices: group(sessions.map((session) => session.device_type)),
      average_session_seconds: durations.length ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length) : null,
    };
    try {
      const insight = await analyzeAnalyticsSnapshot(config.geminiApiKey, config.geminiModel, snapshot);
      const { error: auditError } = await supabase.from('admin_ai_runs').insert({
        admin_id: admin.id,
        action: 'analytics_insights',
        status: 'preview',
        input_data: snapshot,
        output_data: insight,
      });
      if (auditError) request.log.warn({ err: auditError }, 'Could not write analytics AI audit log');
      return { data: { insight, generated_at: snapshot.generated_at, period_days: days, sampled_rows: snapshot.sampled_rows } };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI analytics request failed';
      await supabase.from('admin_ai_runs').insert({ admin_id: admin.id, action: 'analytics_insights', status: 'failed', input_data: snapshot, error_message: message });
      return jsonError(reply, message.startsWith('AI is not configured') ? 503 : 502, message);
    }
  },
);

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
      .select('*,booking_items(*,parts(part_name,sku,primary_image_url,image_urls),vehicles:car_models!booking_items_vehicle_id_car_models_fkey(model_name,cover_image_url,manufacturers(manufacturer_name)))')
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
      '*,parts_categories(id,category_name,slug),manufacturers(id,manufacturer_name,slug,logo_url),car_models(id,manufacturer_id,model_name,generation,slug),part_model_fitments(model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,generation,chassis_code,slug))',
    )
    .order('created_at', { ascending: false });
  if (error) return jsonError(reply, 500, error.message);
  const rows = (data ?? []) as unknown as Array<{
    model_id?: string | null;
    part_model_fitments?: { model_id: string; compatible_years?: number[] | null }[] | null;
    [key: string]: unknown;
  }>;
  return {
    data: rows.map((part) => {
      const fitments = part.part_model_fitments ?? [];
      const primaryFitment = fitments.find((fitment) => fitment.model_id === part.model_id) ?? fitments[0];
      return { ...part, compatible_years: primaryFitment?.compatible_years ?? [] };
    }),
  };
});

const editablePartFields = [
  'part_name',
  'category_id',
  'brand_name',
  'manufacturer_id',
  'model_id',
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
function validatePartPricing(body: Record<string, unknown>, existingPrice?: unknown) {
  const price = body.price === undefined ? Number(existingPrice) : Number(body.price);
  const salePrice = body.sale_price === undefined || body.sale_price === null || body.sale_price === '' ? null : Number(body.sale_price);
  if (!Number.isFinite(price) || price < 0) return 'Price must be 0 or greater.';
  if (salePrice !== null && (!Number.isFinite(salePrice) || salePrice < 0)) return 'Sale price must be 0 or greater.';
  if (salePrice !== null && salePrice > price) return 'Sale price cannot be higher than the regular price.';
  return null;
}
function normalizeCompatibleYears(value: unknown) {
  const rawYears = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/[ ,\n\t]+/).filter(Boolean)
      : [];
  const years = rawYears.map(Number);
  if (years.some((year) => !Number.isInteger(year) || year < 1900 || year > 2200))
    return { years: [] as number[], error: 'Compatible years must be between 1900 and 2200.' };
  return { years: [...new Set(years)].sort((a, b) => a - b), error: null };
}

app.post('/api/v1/admin/parts', { preHandler: requireAdmin as any }, async (request, reply) => {
  const rawBody = (request.body ?? {}) as Record<string, unknown>;
  const body = pickFields(rawBody, editablePartFields);
  const { years: compatibleYears, error: yearsError } = normalizeCompatibleYears(rawBody.compatible_years);
  if (yearsError) return jsonError(reply, 400, yearsError);
  if (compatibleYears.length && !(typeof body.model_id === 'string' && body.model_id))
    return jsonError(reply, 400, 'Select a vehicle model before entering compatible years.');
  if (!body.part_name || !body.sku || body.price === undefined)
    return jsonError(reply, 400, 'part_name, sku and price are required');
  const pricingError = validatePartPricing(body);
  if (pricingError) return jsonError(reply, 400, pricingError);
  const supabase = getSupabaseAdmin();
  const { data: created, error: createError } = await supabase
    .from('parts')
    .insert(body)
    .select('id')
    .single();
  if (createError) return jsonError(reply, 400, createError.message);
  if (typeof body.model_id === 'string' && body.model_id) {
    const { error: fitmentError } = await supabase.from('part_model_fitments').upsert(
      { part_id: created.id, model_id: body.model_id, compatible_years: compatibleYears },
      { onConflict: 'part_id,model_id' },
    );
    if (fitmentError) {
      await supabase.from('parts').delete().eq('id', created.id);
      return jsonError(reply, 400, fitmentError.message);
    }
  }
  const { data, error } = await supabase
    .from('parts')
    .select(
      '*,parts_categories(id,category_name,slug),manufacturers(id,manufacturer_name,slug,logo_url),car_models(id,manufacturer_id,model_name,generation,slug),part_model_fitments(model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,generation,chassis_code,slug))',
    )
    .eq('id', created.id)
    .single();
  if (error) return jsonError(reply, 500, error.message);
  return reply.code(201).send({ data });
});

app.patch(
  '/api/v1/admin/parts/:id',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>,
    reply,
  ) => {
    const rawBody = request.body ?? {};
    const body = pickFields(rawBody, editablePartFields);
    const hasCompatibleYears = Object.prototype.hasOwnProperty.call(rawBody, 'compatible_years');
    const { years: compatibleYears, error: yearsError } = normalizeCompatibleYears(rawBody.compatible_years);
    if (yearsError) return jsonError(reply, 400, yearsError);
    const supabase = getSupabaseAdmin();
    const current = await supabase.from('parts').select('price,sale_price,model_id').eq('id', request.params.id).maybeSingle();
    if (current.error || !current.data) return jsonError(reply, 404, 'Part could not be found.');
    const effectiveBody = {
      price: body.price === undefined ? current.data.price : body.price,
      sale_price: body.sale_price === undefined ? current.data.sale_price : body.sale_price,
    };
    const pricingError = validatePartPricing(effectiveBody);
    if (pricingError) return jsonError(reply, 400, pricingError);
    const fitmentModelId =
      typeof body.model_id === 'string' && body.model_id
        ? body.model_id
        : (current.data.model_id as string | null);
    if (compatibleYears.length && !fitmentModelId)
      return jsonError(reply, 400, 'Select a vehicle model before entering compatible years.');
    if (fitmentModelId && (body.model_id !== undefined || hasCompatibleYears)) {
      const fitmentInput: { part_id: string; model_id: string; compatible_years?: number[] } = {
        part_id: request.params.id,
        model_id: fitmentModelId,
      };
      if (hasCompatibleYears) fitmentInput.compatible_years = compatibleYears;
      const { error: fitmentError } = await supabase.from('part_model_fitments').upsert(
        fitmentInput,
        { onConflict: 'part_id,model_id' },
      );
      if (fitmentError) return jsonError(reply, 400, fitmentError.message);
    }
    const { data, error } = await getSupabaseAdmin()
      .from('parts')
      .update(body)
      .eq('id', request.params.id)
      .select(
        '*,parts_categories(id,category_name,slug),manufacturers(id,manufacturer_name,slug,logo_url),car_models(id,manufacturer_id,model_name,generation,slug),part_model_fitments(model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,generation,chassis_code,slug))',
      )
      .single();
    if (error) return jsonError(reply, 400, error.message);
    if (
      typeof body.model_id === 'string' &&
      current.data.model_id &&
      current.data.model_id !== body.model_id
    ) {
      const { error: oldFitmentError } = await supabase
        .from('part_model_fitments')
        .delete()
        .eq('part_id', request.params.id)
        .eq('model_id', current.data.model_id);
      if (oldFitmentError) return jsonError(reply, 500, oldFitmentError.message);
    }
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
  '/api/v1/admin/parts/:id/fitments',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('part_model_fitments')
      .select(
        'id,part_id,model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,generation,chassis_code,slug)',
      )
      .eq('part_id', request.params.id)
      .limit(500);
    if (error) return jsonError(reply, 500, error.message);
    return { data: data ?? [] };
  },
);

app.put(
  '/api/v1/admin/parts/:id/fitments',
  { preHandler: requireAdmin as any },
  async (
    request: FastifyRequest<{
      Params: { id: string };
      Body: { fitments?: unknown };
    }>,
    reply,
  ) => {
    const input = request.body?.fitments;
    if (!Array.isArray(input)) return jsonError(reply, 400, 'fitments must be an array');

    const fitments: { part_id: string; model_id: string; compatible_years: number[] }[] = [];
    const selectedModelIds = new Set<string>();
    for (const item of input) {
      if (!item || typeof item !== 'object') return jsonError(reply, 400, 'Each fitment must include a model_id');
      const row = item as { model_id?: unknown; compatible_years?: unknown };
      if (typeof row.model_id !== 'string' || !row.model_id.trim())
        return jsonError(reply, 400, 'Each fitment must include a model_id');
      const modelId = row.model_id.trim();
      if (selectedModelIds.has(modelId))
        return jsonError(reply, 400, 'A vehicle model can only be assigned once per part');
      selectedModelIds.add(modelId);
      const rawYears = Array.isArray(row.compatible_years) ? row.compatible_years : [];
      const years = rawYears.map(Number);
      if (years.some((year) => !Number.isInteger(year) || year < 1900 || year > 2200))
        return jsonError(reply, 400, 'Compatible years must be between 1900 and 2200');
      fitments.push({
        part_id: request.params.id,
        model_id: modelId,
        compatible_years: [...new Set(years)].sort((a, b) => a - b),
      });
    }

    const supabase = getSupabaseAdmin();
    const { data: part, error: partError } = await supabase
      .from('parts')
      .select('id')
      .eq('id', request.params.id)
      .maybeSingle();
    if (partError || !part) return jsonError(reply, 404, 'Part could not be found.');

    const { data: existing, error: existingError } = await supabase
      .from('part_model_fitments')
      .select('model_id')
      .eq('part_id', request.params.id)
      .limit(500);
    if (existingError) return jsonError(reply, 500, existingError.message);

    if (fitments.length) {
      const { error: upsertError } = await supabase
        .from('part_model_fitments')
        .upsert(fitments, { onConflict: 'part_id,model_id' });
      if (upsertError) return jsonError(reply, 400, upsertError.message);
    }

    const { error: primaryModelError } = await supabase
      .from('parts')
      .update({ model_id: fitments[0]?.model_id ?? null })
      .eq('id', request.params.id);
    if (primaryModelError) return jsonError(reply, 500, primaryModelError.message);

    for (const oldFitment of existing ?? []) {
      if (selectedModelIds.has(oldFitment.model_id)) continue;
      const { error: deleteError } = await supabase
        .from('part_model_fitments')
        .delete()
        .eq('part_id', request.params.id)
        .eq('model_id', oldFitment.model_id);
      if (deleteError) return jsonError(reply, 500, deleteError.message);
    }

    const { data, error } = await supabase
      .from('part_model_fitments')
      .select(
        'id,part_id,model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,generation,chassis_code,slug)',
      )
      .eq('part_id', request.params.id)
      .limit(500);
    if (error) return jsonError(reply, 500, error.message);
    return { data: data ?? [] };
  },
);

app.get(
  '/api/v1/admin/parts/:id/fitment',
  { preHandler: requireAdmin as any },
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const { data, error } = await getSupabaseAdmin()
      .from('part_model_fitments')
      .select(
        'id,part_id,model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,generation,chassis_code,slug)',
      )
      .eq('part_id', request.params.id)
      .limit(1)
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
      Body: { model_id?: string; compatible_years?: unknown };
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
    if (!body.model_id) return jsonError(reply, 400, 'Choose one vehicle model for this part.');
    const { data, error } = await getSupabaseAdmin()
      .from('part_model_fitments')
      .upsert(
        {
          part_id: request.params.id,
          model_id: body.model_id,
          compatible_years: years,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'part_id,model_id' },
      )
      .select(
        'id,part_id,model_id,compatible_years,vehicles:car_models!part_model_fitments_model_id_fkey(id,model_name,generation,chassis_code,slug)',
      )
      .eq('part_id', request.params.id)
      .eq('model_id', body.model_id)
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
      .from('part_model_fitments')
      .delete()
      .eq('part_id', request.params.id);
    if (error) return jsonError(reply, 400, error.message);
    return { data: null };
  },
);

const editableManufacturerFields = [
  'manufacturer_name', 'slug', 'logo_url', 'company_description', 'country',
  'founded_year', 'status', 'is_active', 'sort_order',
] as const;
const editableModelFields = [
  'manufacturer_id', 'model_name', 'slug', 'generation', 'chassis_code',
  'year_start', 'year_end', 'engine_code', 'engine_capacity', 'fuel_type',
  'transmission', 'vehicle_type', 'cover_image_url', 'vehicle_images',
  'gallery_images', 'status', 'is_featured', 'sort_order', 'seo_title',
  'seo_description',
] as const;

type PageResult<T> = { data: T[] | null; error: { message: string } | null };
async function fetchAllPages<T>(
  fetchPage: (start: number, end: number) => PromiseLike<PageResult<T>>,
) {
  const rows: T[] = [];
  const pageSize = 500;
  for (let start = 0; ; start += pageSize) {
    const { data, error } = await fetchPage(start, start + pageSize - 1);
    if (error) return { data: null as T[] | null, error };
    const page = data ?? [];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return { data: rows, error: null };
}

app.get('/api/v1/admin/lookups', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const supabase = getSupabaseAdmin();
  const [manufacturers, models, categories] = await Promise.all([
    supabase.from('manufacturers').select('id,manufacturer_name,slug,logo_url').order('manufacturer_name').limit(500),
    fetchAllPages((start, end) => supabase.from('car_models').select('id,manufacturer_id,model_name,generation,year_start,year_end').order('model_name').order('manufacturer_id').order('id').range(start, end)),
    supabase.from('parts_categories').select('id,category_name,slug').eq('status', 'active').order('category_name').limit(200),
  ]);
  const failed = [manufacturers, models, categories].find((result) => result.error);
  if (failed?.error) return jsonError(reply, 500, failed.error.message);
  return { data: { manufacturers: manufacturers.data ?? [], models: models.data ?? [], categories: categories.data ?? [] } };
});

app.get('/api/v1/admin/manufacturers', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin().from('manufacturers').select('*').order('sort_order').order('manufacturer_name').limit(500);
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});
app.post('/api/v1/admin/manufacturers', { preHandler: requireAdmin as any }, async (request, reply) => {
  const body = pickFields((request.body ?? {}) as Record<string, unknown>, editableManufacturerFields);
  if (!body.manufacturer_name || !body.slug) return jsonError(reply, 400, 'manufacturer_name and slug are required');
  const { data, error } = await getSupabaseAdmin().from('manufacturers').insert(body).select().single();
  if (error) return jsonError(reply, 400, error.message);
  return reply.code(201).send({ data });
});
app.patch('/api/v1/admin/manufacturers/:id', { preHandler: requireAdmin as any }, async (request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>, reply) => {
  const { data, error } = await getSupabaseAdmin().from('manufacturers').update(pickFields(request.body ?? {}, editableManufacturerFields)).eq('id', request.params.id).select().single();
  if (error) return jsonError(reply, 400, error.message);
  return { data };
});
app.delete('/api/v1/admin/manufacturers/:id', { preHandler: requireAdmin as any }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
  const { data, error } = await getSupabaseAdmin().from('manufacturers').update({ status: 'inactive', is_active: false }).eq('id', request.params.id).select('id,status,is_active').single();
  if (error) return jsonError(reply, 400, 'Manufacturer could not be deactivated. Remove its models first if it is still in use.');
  return { data };
});

app.get('/api/v1/admin/vehicles', { preHandler: requireAdmin as any }, async (_request, reply) => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await fetchAllPages((start, end) => supabase.from('car_models').select('*,manufacturers(id,manufacturer_name,slug,logo_url)').order('sort_order').order('model_name').order('id').range(start, end));
  if (error) return jsonError(reply, 500, error.message);
  return { data: (data ?? []).map((row, index) => { const record = row as CarBrandRecord; const manufacturer = (record.manufacturers as CarBrandRecord | undefined) ?? { id: record.manufacturer_id, manufacturer_name: '' }; return { ...record, ...normalizeModel(record, manufacturer, index), manufacturer_id: record.manufacturer_id }; }) };
});
app.post('/api/v1/admin/vehicles', { preHandler: requireAdmin as any }, async (request, reply) => {
  const body = pickFields((request.body ?? {}) as Record<string, unknown>, editableModelFields);
  if (!body.manufacturer_id || !body.model_name) return jsonError(reply, 400, 'manufacturer_id and model_name are required');
  const { data, error } = await getSupabaseAdmin().from('car_models').insert(body).select('*,manufacturers(id,manufacturer_name,slug,logo_url)').single();
  if (error) return jsonError(reply, 400, error.message);
  return reply.code(201).send({ data });
});
app.patch('/api/v1/admin/vehicles/:id', { preHandler: requireAdmin as any }, async (request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>, reply) => {
  const { data, error } = await getSupabaseAdmin().from('car_models').update(pickFields(request.body ?? {}, editableModelFields)).eq('id', request.params.id).select('*,manufacturers(id,manufacturer_name,slug,logo_url)').single();
  if (error) return jsonError(reply, 400, error.message);
  return { data };
});
app.delete('/api/v1/admin/vehicles/:id', { preHandler: requireAdmin as any }, async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
  const { data, error } = await getSupabaseAdmin().from('car_models').update({ status: 'inactive' }).eq('id', request.params.id).select('id,status').single();
  if (error) return jsonError(reply, 404, 'Model could not be deactivated.');
  return { data };
});

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
