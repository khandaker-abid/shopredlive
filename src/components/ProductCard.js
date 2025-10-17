import Link from 'next/link';

export default function ProductCard({ product }) {
  return (
    <Link href={`/listing/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--ocean-primary), var(--ocean-accent))', height: 160 }} />
        <div style={{ padding: 12 }}>
          <div className="chip" style={{ marginBottom: 6 }}>{product.category || 'General'}</div>
          <div style={{ fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--ocean-primary-deep)' }}>{product.name}</div>
          <div style={{ color: '#0f172a', fontSize: 16 }}>${product.price}</div>
        </div>
      </div>
    </Link>
  );
}


