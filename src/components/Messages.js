export default function Messages() {
  const threads = [
    { id: '1', with: 'Alice', last: 'Is this still available?' },
    { id: '2', with: 'Bob', last: 'Can pick up tomorrow' }
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>
      <div style={{ border: '1px solid #eee', borderRadius: 8 }}>
        {threads.map(t => (
          <div key={t.id} style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontWeight: 600 }}>{t.with}</div>
            <div style={{ color: '#666', fontSize: 13 }}>{t.last}</div>
          </div>
        ))}
      </div>
      <div style={{ border: '1px solid #eee', borderRadius: 8, height: 360 }} />
    </div>
  );
}


