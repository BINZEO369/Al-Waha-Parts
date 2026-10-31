insert into tenants (name, slug) values ('Al Waha Parts Demo', 'al-waha-demo') on conflict (slug) do nothing;
insert into users (tenant_id, email, display_name) select id, 'admin@alwahaparts.local', 'Development Admin' from tenants where slug = 'al-waha-demo' on conflict (tenant_id, email) do nothing;
insert into parts (tenant_id, sku, name, description, status) select id, 'DEMO-BRAKE-001', 'Demo Brake Pad Set', 'Development-only seed record', 'active'::part_status from tenants where slug = 'al-waha-demo' on conflict (tenant_id, sku) do nothing;
