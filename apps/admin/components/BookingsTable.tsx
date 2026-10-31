'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../../packages/shared/src/api';
const fallback = [
  {
    id: '1',
    booking_number: 'AWP-1048',
    customer_name: 'Omar Al Mansoori',
    customer_phone: '+971 50 000 0000',
    booking_status: 'pending',
    created_at: 'Today, 10:42',
  },
  {
    id: '2',
    booking_number: 'AWP-1047',
    customer_name: 'Al Noor Workshop',
    customer_phone: '+971 4 000 0000',
    booking_status: 'confirmed',
    created_at: 'Yesterday',
  },
];
export function BookingsTable() {
  const [rows, setRows] = useState(fallback);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_API_URL)
      apiFetch<any[]>(process.env.NEXT_PUBLIC_API_URL, '/api/v1/admin/bookings')
        .then(setRows)
        .catch(() => {});
  }, []);
  return (
    <div className="data-table">
      <div className="table-head booking-grid">
        <span>Booking</span>
        <span>Customer</span>
        <span>Phone</span>
        <span>Status</span>
        <span>Received</span>
      </div>
      {rows.map((row: any) => (
        <div className="table-row booking-grid" key={row.id}>
          <strong>{row.booking_number}</strong>
          <span>{row.customer_name}</span>
          <span>{row.customer_phone}</span>
          <span>
            <b className={`status ${row.booking_status}`}>{row.booking_status}</b>
          </span>
          <span>{row.created_at}</span>
        </div>
      ))}
    </div>
  );
}
