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

app.get(
  '/api/v1/vehicles/:id',
  async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    const supabase = getSupabaseAdmin();
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', request.params.id)
      .eq('status', 'active')
      .maybeSingle();
    if (vehicleError) return jsonError(reply, 500, vehicleError.message);
    if (!vehicle) return jsonError(reply, 404, 'Vehicle not found');

    const { data: parts, error: partsError } = await supabase
      .from('parts')
      .select('*,parts_categories(id,category_name,slug),part_vehicles!inner(vehicle_id)')
      .eq('part_vehicles.vehicle_id', request.params.id)
      .eq('status', 'active')
      .order('position')
      .order('part_name')
      .limit(200);
    if (partsError) return jsonError(reply, 500, partsError.message);
    return { data: { vehicle, parts: parts ?? [] } };
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
    const supabase = getSupabaseAdmin();
    if (body.delivery_method === 'delivery' && !body.shipping_address?.trim()) {
      return jsonError(reply, 400, 'A delivery address is required for delivery requests');
    }

    const requestedItems = new Map<string, { part_id: string; vehicle_id?: string; quantity: number }>();
    for (const item of body.items ?? []) {
      if (!item?.part_id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        return jsonError(reply, 400, 'Each cart item must have a valid quantity between 1 and 99');
      }
      const previous = requestedItems.get(item.part_id);
      const quantity = (previous?.quantity ?? 0) + item.quantity;
      if (quantity > 99) return jsonError(reply, 400, 'The quantity for one product cannot exceed 99');
      requestedItems.set(item.part_id, { part_id: item.part_id, vehicle_id: item.vehicle_id, quantity });
    }

    if (body.part_number && requestedItems.size === 0) {
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
      if (matchedPart)
        requestedItems.set(matchedPart.id, { part_id: matchedPart.id, quantity: 1 });
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
    if (parts.length !== partIds.length) return jsonError(reply, 400, 'One or more products are no longer available');

    const partById = new Map(parts.map((part) => [part.id, part]));
    const vehicleIds = [...new Set([...requestedItems.values()].map((item) => item.vehicle_id).filter(Boolean))] as string[];
    const { data: vehicles, error: vehiclesError } = vehicleIds.length
      ? await supabase.from('vehicles').select('id,manufacturer_name,model_name,generation').in('id', vehicleIds).eq('status', 'active')
      : { data: [], error: null };
    if (vehiclesError) return jsonError(reply, 500, 'Unable to verify vehicle fitment');
    if (vehicles.length !== vehicleIds.length) return jsonError(reply, 400, 'The selected vehicle is no longer available');
    const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

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
        customer_email: body.customer_email ?? null,
        customer_note: bookingNote,
        total_amount: totalAmount,
        currency: 'AED',
        shipping_address: body.shipping_address?.trim() ?? null,
        customer_city: body.customer_city?.trim() ?? null,
        delivery_method: body.delivery_method ?? 'pickup',
        payment_method: body.payment_method ?? 'cash_on_delivery',
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
