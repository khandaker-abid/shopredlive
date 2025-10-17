"use client";

import { useState } from 'react';

export default function SellForm() {
  const [form, setForm] = useState({ name: '', price: '', description: '' });
  function onChange(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function onSubmit(e) { e.preventDefault(); alert('Submitted (mock)'); }

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 640 }}>
      <div style={{ display: 'grid', gap: 12 }}>
        <input name="name" placeholder="Title" value={form.name} onChange={onChange} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
        <input name="price" placeholder="Price" value={form.price} onChange={onChange} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={onChange} rows={6} style={{ padding: 10, border: '1px solid #ddd', borderRadius: 6 }} />
        <button type="submit" style={{ background: '#0654ba', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 6 }}>List item</button>
      </div>
    </form>
  );
}


