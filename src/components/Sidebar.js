"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function Sidebar() {
  const categories = ['All', 'Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Tickets'];
  const searchParams = useSearchParams();
  const active = (searchParams.get('category') || 'All');
  return (
    <div style={{ width: 240 }}>
      <div className="card" style={{ padding: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--ocean-primary-deep)' }}>Categories</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {categories.map((c) => {
            const params = new URLSearchParams(searchParams.toString());
            if (c === 'All') params.delete('category'); else params.set('category', c);
            const href = `/?${params.toString()}`;
            const isActive = active === c || (c === 'All' && !searchParams.get('category'));
            return (
              <li key={c}>
                <Link href={href} style={{ display: 'block', padding: '8px 8px', borderRadius: 6, background: isActive ? '#e0f2fe' : 'transparent', color: isActive ? '#0c4a6e' : 'var(--ocean-primary)' }}>{c}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}


