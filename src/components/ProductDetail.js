export default function ProductDetail({ id }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div style={{ border: '1px solid #eee', borderRadius: 8, height: 360, background: '#f7f7f7' }} />
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Sample Item {id}</div>
        <div style={{ fontSize: 18, color: '#111', marginBottom: 16 }}>$42.00</div>
        <button style={{ background: '#0654ba', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 6 }}>Make Offer</button>
        <div style={{ marginTop: 24, color: '#444' }}>
          Simple description of the item. Condition: Good. Pickup on campus.
        </div>
      </div>
    </div>
  );
}


