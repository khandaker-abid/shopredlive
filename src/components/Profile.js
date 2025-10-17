export default function Profile() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>My Account</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          <li>Profile</li>
          <li>My Listings</li>
          <li>Saved</li>
          <li>Orders</li>
        </ul>
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Profile</div>
        <div style={{ color: '#555' }}>Student Name — University</div>
      </div>
    </div>
  );
}


