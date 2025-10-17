export async function fetchProducts() {
  // TODO: wire to backend API. For now return mock.
  return Array.from({ length: 12 }).map((_, i) => ({ id: String(i + 1), name: `Item ${i + 1}`, price: (10 + i * 3).toFixed(2) }));
}

export async function fetchProductById(id) {
  return { id, name: `Item ${id}`, price: '42.00', description: 'Sample' };
}


