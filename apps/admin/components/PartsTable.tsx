'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
const fallback = [
  {
    id: '1',
    part_name: 'Front brake pad set',
    sku: 'AWP-BR-001',
    brand_name: 'Brembo',
    stock_quantity: 8,
    price: 280,
    status: 'active',
  },
  {
    id: '2',
    part_name: 'Oil filter housing',
    sku: 'AWP-OF-044',
    brand_name: 'Mann',
    stock_quantity: 12,
    price: 145,
    status: 'active',
  },
  {
    id: '3',
    part_name: 'Alternator assembly',
    sku: 'AWP-AL-208',
    brand_name: 'Bosch',
    stock_quantity: 3,
    price: 640,
    status: 'draft',
  },
];
export function PartsTable() {
  const [rows, setRows] = useState(fallback);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_URL)
      apiFetch<any[]>(process.env.NEXT_PUBLIC_API_URL, '/api/v1/admin/parts')
        .then(setRows)
        .catch(() => {});
  }, []);
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
      {rows.map((row: any) => (
        <div className="table-row" key={row.id}>
          <div className="table-primary">
            <div className="mini-glyph">AWP</div>
            <strong>{row.part_name}</strong>
          </div>
          <span>
            {row.sku}
            <small>{row.brand_name}</small>
          </span>
          <span>{row.stock_quantity} units</span>
          <span>{row.price} AED</span>
          <span>
            <b className={`status ${row.status}`}>{row.status}</b>
          </span>
          <button className="icon-button">···</button>
        </div>
      ))}
    </div>
  );
}
