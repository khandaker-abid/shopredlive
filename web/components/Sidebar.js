export default function Sidebar() {
  const categories = ['All', 'Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Tickets'];
  return (
    <div style={{ width: 240 }}>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Categories</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {categories.map((c) => (
            <li key={c} style={{ padding: '8px 4px', cursor: 'pointer', color: '#0654ba' }}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}


