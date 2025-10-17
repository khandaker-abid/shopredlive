import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <Link href={`/listing/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ border: '1px solid #eee', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ background: '#f7f7f7', height: 160 }} />
        <div style={{ padding: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
          <div style={{ color: '#111' }}>${product.price}</div>
        </div>
      </div>
    </Link>
  );
}


