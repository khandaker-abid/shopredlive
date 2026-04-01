const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const cache = new Map();
const CACHE_TTL = 60000;

async function cachedFetch(url, options = {}) {
  const cacheKey = url;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    ...options
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });

  return data;
}

export function clearCache(pattern) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

export async function fetchProducts(page = 1, limit = 20) {
  return cachedFetch(`${BACKEND_URL}/products?page=${page}&limit=${limit}`);
}

export async function searchProducts(params) {
  const searchParams = new URLSearchParams(params);
  return cachedFetch(`${BACKEND_URL}/products/search?${searchParams.toString()}`);
}

export async function fetchProductById(id) {
  return cachedFetch(`${BACKEND_URL}/product/${id}`);
}

export async function fetchCategories() {
  return cachedFetch(`${BACKEND_URL}/categories`);
}

export async function fetchUser(id) {
  return cachedFetch(`${BACKEND_URL}/user/${id}`);
}

export async function fetchConversations(userId) {
  return cachedFetch(`${BACKEND_URL}/conversations/${userId}`);
}

export async function fetchNotifications(userId) {
  return cachedFetch(`${BACKEND_URL}/notifications/${userId}`);
}

export async function fetchOrders(userId) {
  return cachedFetch(`${BACKEND_URL}/orders/user/${userId}`);
}

export async function fetchReviews(userId) {
  return cachedFetch(`${BACKEND_URL}/reviews/user/${userId}`);
}

export async function fetchOffers(userId) {
  return cachedFetch(`${BACKEND_URL}/offers/user/${userId}`);
}

export { BACKEND_URL, cachedFetch };
