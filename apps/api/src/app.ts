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

const limit = (value: unknown, fallback = 50) =>
  Math.min(Math.max(Number(value) || fallback, 1), 200);
const jsonError = (reply: FastifyReply, statusCode: number, message: string) =>
  reply.code(statusCode).send({ error: { message } });

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
    .order('category_name')
    .limit(200);
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});

app.get('/api/v1/popular-categories', async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('popular_categories')
    .select('display_order,category:parts_categories!inner(id,category_name,slug,description,image_url,status)')
    .eq('is_active', true)
    .eq('category.status', 'active')
    .order('display_order', { ascending: true })
    .limit(200);
  if (error) return jsonError(reply, 500, error.message);
  return {
    data: (data ?? []).map((item) => ({ ...item.category, sort_order: item.display_order })),
  };
});

app.get('/api/v1/banners', async (_request, reply) => {
  const now = new Date().toISOString();
  const { data, error } = await getSupabaseAdmin()
    .from('hero_banners')
    .select('id,eyebrow,title,description,cta_label,cta_href,image_url,mobile_image_url,badge_text,sort_order')
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
    let query = getSupabaseAdmin()
      .from('vehicles')
      .select('*')
      .order('manufacturer_name')
      .order('model_name')
      .range(Number(q.offset) || 0, (Number(q.offset) || 0) + limit(q.limit) - 1);
    if (q.status) query = query.eq('status', q.status);
    if (q.search)
      query = query.or(
        `manufacturer_name.ilike.%${q.search}%,model_name.ilike.%${q.search}%,chassis_code.ilike.%${q.search}%`,
      );
    const { data, error } = await query;
    if (error) return jsonError(reply, 500, error.message);
    return { data: data ?? [] };
  },
);

app.get('/api/v1/homepage-selected-vehicles', async (_request, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('homepage_selected_vehicles')
    .select('display_order,vehicle:vehicles!inner(id,manufacturer_name,manufacturer_logo,model_name,generation,chassis_code,year_start,year_end,vehicle_type,cover_image_url,status)')
    .eq('is_active', true)
    .eq('vehicle.status', 'active')
    .order('display_order', { ascending: true })
    .limit(200);
  if (error) return jsonError(reply, 500, error.message);
  return {
    data: (data ?? []).map((item) => ({ ...item.vehicle, sort_order: item.display_order })),
  };
});

app.get(
  '/api/v1/parts',
  async (
    request: FastifyRequest<{
      Querystring: {
        search?: string;
        category_id?: string;
        vehicle_id?: string;
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
    let query = getSupabaseAdmin()
      .from('parts')
      .select('*,parts_categories(id,category_name,slug),part_vehicles!inner(vehicle_id)')
      .order('position')
      .order('part_name')
      .range(start, start + limit(q.limit) - 1);
    if (!q.vehicle_id)
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
    const { data, error } = await getSupabaseAdmin()
      .from('parts')
      .select('*,parts_categories(id,category_name,slug,image_url),part_vehicles(vehicle_id,vehicles(id,manufacturer_name,model_name,year_start,year_end,generation,chassis_code))')
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
          unit_price: number;
        }>;
      };
    }>,
    reply,
  ) => {
    const body = request.body;
    if (
      !body?.customer_name ||
      !body.customer_phone ||
      (!body.part_number && (!Array.isArray(body.items) || body.items.length === 0))
    ) {
      return jsonError(
        reply,
        400,
        'customer_name, customer_phone and a part number or item are required',
      );
    }
    const supabase = getSupabaseAdmin();
    let items = body.items ?? [];
    if (body.part_number && items.length === 0) {
      const { data: matchedPart } = await supabase
        .from('parts')
        .select('id,price')
        .or(
          `sku.eq.${body.part_number},oem_number.eq.${body.part_number},part_number.eq.${body.part_number}`,
        )
        .limit(1)
        .maybeSingle();
      if (matchedPart)
        items = [{ part_id: matchedPart.id, quantity: 1, unit_price: matchedPart.price }];
    }
    const bookingNumber = `AWP-${Date.now()}`;
    const bookingNote = body.part_number
      ? `${body.customer_note ?? ''}\nRequested part: ${body.part_number}`.trim()
      : (body.customer_note ?? null);
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_number: bookingNumber,
        customer_name: body.customer_name,
        customer_phone: body.customer_phone,
        customer_email: body.customer_email ?? null,
        customer_note: bookingNote,
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
            vehicle_id: item.vehicle_id ?? null,
            quantity: item.quantity,
            unit_price: item.unit_price,
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
  const body = request.body as Record<string, unknown>;
  if (!body.slug || !body.title || !body.image_url) return jsonError(reply, 400, 'slug, title and image_url are required');
  const { data, error } = await getSupabaseAdmin().from('hero_banners').insert(body).select().single();
  if (error) return jsonError(reply, 400, error.message);
  return reply.code(201).send({ data });
});

app.patch('/api/v1/admin/banners/:id', { preHandler: requireAdmin as any }, async (request: FastifyRequest<{ Params: { id: string }; Body: Record<string, unknown> }>, reply) => {
  const { data, error } = await getSupabaseAdmin()
    .from('hero_banners')
    .update(request.body)
    .eq('id', request.params.id)
    .select()
    .single();
  if (error) return jsonError(reply, 400, error.message);
  return { data };
});

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
    .select('*,parts_categories(id,category_name,slug)')
    .order('created_at', { ascending: false });
  if (error) return jsonError(reply, 500, error.message);
  return { data: data ?? [] };
});

app.setErrorHandler((error, _request, reply) => {
  app.log.error(error);
  return jsonError(reply, 500, 'Internal server error');
});
