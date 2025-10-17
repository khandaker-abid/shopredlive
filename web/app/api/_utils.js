export const db = {
  products: [],
  offers: [],
  orders: [],
  conversations: [],
  messages: [],
  categories: [
    { id: 'cat-1', name: 'Electronics' },
    { id: 'cat-2', name: 'Books' },
    { id: 'cat-3', name: 'Furniture' }
  ],
  users: [],
  reviews: [],
  notifications: [],
  reports: []
};

export function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export async function readJson(req) {
  try {
    const body = await req.json();
    return body || {};
  } catch (e) {
    return {};
  }
}


