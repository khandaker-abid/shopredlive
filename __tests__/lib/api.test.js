import { clearCache, fetchProducts, cachedFetch } from '@/lib/api';

global.fetch = jest.fn();

beforeEach(() => {
  clearCache();
  fetch.mockClear();
});

describe('cachedFetch', () => {
  it('calls fetch once and returns data', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [1, 2] }),
    });

    const result = await cachedFetch('http://localhost:8000/products');
    expect(result).toEqual({ items: [1, 2] });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('returns cached result on second call within TTL', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [3, 4] }),
    });

    await cachedFetch('http://localhost:8000/products?page=2');
    await cachedFetch('http://localhost:8000/products?page=2');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('throws on non-ok response', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(cachedFetch('http://localhost:8000/missing')).rejects.toThrow('404');
  });
});

describe('clearCache', () => {
  it('clears all entries when called without pattern', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    await cachedFetch('http://localhost:8000/a');
    await cachedFetch('http://localhost:8000/b');

    clearCache();

    fetch.mockClear();
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    await cachedFetch('http://localhost:8000/a');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('only evicts entries matching the pattern', async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    await cachedFetch('http://localhost:8000/products');
    await cachedFetch('http://localhost:8000/categories');

    clearCache('products');
    fetch.mockClear();
    fetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    await cachedFetch('http://localhost:8000/products');
    await cachedFetch('http://localhost:8000/categories');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('fetchProducts', () => {
  it('constructs the correct URL', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => [] });
    await fetchProducts(2, 10);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('page=2'),
      expect.any(Object)
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.any(Object)
    );
  });
});
