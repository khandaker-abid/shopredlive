import Link from 'next/link';

export default function Header() {
  return (
    <div style={{ borderBottom: '1px solid #eee', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: 20, textDecoration: 'none', color: '#111' }}>ShopRedLive</Link>
      <input placeholder="Search items" style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 4 }} />
      <Link href="/sell" style={{ textDecoration: 'none' }}>Sell</Link>
      <Link href="/messages" style={{ textDecoration: 'none' }}>Messages</Link>
      <Link href="/profile" style={{ textDecoration: 'none' }}>Profile</Link>
    </div>
  );
}


