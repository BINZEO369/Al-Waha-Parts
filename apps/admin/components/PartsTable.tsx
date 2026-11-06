'use client';

import { useEffect, useState } from 'react';
import { formatSar } from '../../../packages/shared/src/currency';
import { adminFetch } from '../lib/auth';

type PartRow = {
  id: string;
  part_name: string;
  sku: string;
  brand_name?: string;
  stock_quantity: number;
  price: number;
  status: string;
  primary_image_url?: string | null;
};

export function PartsTable() {
  const [rows, setRows] = useState<PartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    adminFetch<PartRow[]>('/api/v1/admin/parts')
      .then((data) => { if (mounted) setRows(data); })
      .catch((reason: unknown) => {
        if (mounted) setError(reason instanceof Error ? reason.message : 'Parts could not be loaded.');
      })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="admin-inline-loader" role="status"><span className="loading-spinner" /><div><strong>Loading live parts</strong><small>Syncing inventory from Supabase</small></div></div>;
  if (error) return <div className="admin-alert" role="alert">{error}</div>;
  if (!rows.length) return <div className="admin-empty">No parts found in the live catalog.</div>;

  return (
    <div className="data-table">
      <div className="table-head">
        <span>Part</span>
        <span>SKU / brand</span>
        <span>Stock</span>
        <span>Price</span>
        <span>Status</span>
        <span />
      </div>
      {rows.map((row) => (
        <div className="table-row" key={row.id}>
          <div className="table-primary">
            {row.primary_image_url ? <img className="mini-glyph" src={row.primary_image_url} alt="" /> : <div className="mini-glyph">AWP</div>}
            <strong>{row.part_name}</strong>
          </div>
          <span>{row.sku}<small>{row.brand_name ?? '—'}</small></span>
          <span>{row.stock_quantity} units</span>
          <span>{formatSar(row.price)}</span>
          <span><b className={`status ${row.status}`}>{row.status}</b></span>
          <button className="icon-button" type="button" aria-label={`Actions for ${row.part_name}`}>···</button>
        </div>
      ))}
    </div>
  );
}
