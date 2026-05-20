export function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}

export const db = globalThis.__shopredliveDb || (globalThis.__shopredliveDb = {
  users: [],
  products: [],
  orders: [],
  offers: [],
  conversations: [],
  messages: [],
  notifications: [],
  reviews: [],
  reports: [],
  categories: []
});

export async function readJson(req) {
  try {
    const body = await req.json();
    return body || {};
  } catch (e) {
    return {};
  }
}


