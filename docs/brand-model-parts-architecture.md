# Brand, model and parts architecture

Al Waha Parts uses `public.car_brands` as the canonical automotive directory.

- A company row has `record_type = 'brand'`, its own `id`, company details and `logo_url`.
- A model row has `record_type = 'vehicle'`, its own `id`, `model_name`, and `car_brand_id` pointing to the parent company. The model inherits the parent's logo through that relationship.
- A part stores the parent `car_brand_id` for fast brand filtering.
- A part's model compatibility is stored in `part_vehicle_fitments`; `model_id` is the canonical name and `vehicle_id` remains as a backward-compatible alias for existing data.
- `compatible_years` stores the supported model years for each part/model pair.

The API accepts `model_id` for catalog filtering and still accepts legacy `vehicle_id` links. The model detail page sends `model_id` and renders the parent brand logo from the brand response. The migration is `database/migrations/018_brand_model_part_fitment.sql`.
