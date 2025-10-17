"use client";
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState('');

  useEffect(() => { setQ(searchParams.get('q') || ''); }, [searchParams]);

  function onSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (q) params.set('q', q); else params.delete('q');
    router.push(`/?${params.toString()}`);
  }

  return (
    <div style={{ borderBottom: '1px solid var(--ocean-border)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--ocean-white)' }}>
      <Link href="/" style={{ fontWeight: 800, fontSize: 22, textDecoration: 'none', color: 'var(--ocean-primary-deep)' }}>ShopRedLive</Link>
      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, flex: 1 }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" style={{ flex: 1, padding: 10, border: '1px solid var(--ocean-border)', borderRadius: 8, background: 'var(--ocean-bg)' }} />
        <button className="btn-primary" type="submit">Search</button>
      </form>
      <Link href="/sell">Sell</Link>
      <Link href="/messages">Messages</Link>
      <Link href="/profile">Profile</Link>
    </div>
  );
}


