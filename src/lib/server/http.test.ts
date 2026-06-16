import { beforeEach, afterAll, describe, expect, it, vi } from 'vitest';

import { log } from './logs';

let authToken : string | undefined;
let ttl = vi.hoisted(() => 42000);
let baseUrl : string | undefined = vi.hoisted(() => '/');

const getCacheMock =
  vi.hoisted(() => vi.fn(async (key : string, load : () => unknown) => load()));

vi.mock('$env/dynamic/private', () => ({
  get env() {
    return {
      RESOURCE_AUTH_TOKEN : authToken,
      RESOURCE_CACHE_TTL : `${ttl}`,
      BASE_URL : baseUrl,
    };
  },
}));
vi.mock('./logs', () => ({
  log : vi.fn(),
}));
vi.mock('./cache', async () => ({
  Cache : vi.fn(() => ({ get : getCacheMock })),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();

  baseUrl = '/';
  ttl = 42000;

  getCacheMock
    .mockImplementation(async (key : string, load : () => unknown) => load());
  fetchMock.mockReturnValue(Promise.resolve({
    ok : true,
    text : () => Promise.resolve('fetched text'),
    json : () => Promise.resolve({ fetched : 'json' }),
  }));
});

afterAll(() => { vi.restoreAllMocks(); });

describe('fetchResource', () => {
  it.each([
    ['base url undefined', undefined, 'resource', '/resource'],
    ['base url empty', '', 'resource', '/resource'],
    ['base url slash', '/', 'resource', '/resource'],
    ['relative root url', './base', 'resource', '/base/resource'],
    ['base url without slash', 'base', 'resource', '/base/resource'],
    ['base url with leading slash', '/base', '/resource', '/base/resource'],
    ['base url with trailing slash', 'base/', 'resource', '/base/resource'],
    ['base url with double slashes', '/base/', '/resource', '/base/resource'],
    ['relative url', './base', './resource', '/base/resource'],
  ])('fetches from local folder with %s', async (_, base, res, expected) => {
    const { fetchResource } = await import('./http');
    baseUrl = base;

    await fetchResource(res, { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      expected,
      expect.objectContaining({ method : 'GET' }),
    );
  });

  it('fetches from relative URL', async () => {
    const { fetchResource } = await import('./http');
    baseUrl = 'http://example.com/';

    await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/resource', baseUrl),
      expect.objectContaining({ method : 'GET' }),
    );
  });

  it('fetches from absolute URL', async () => {
    const { fetchResource } = await import('./http');
    baseUrl = 'http://example.com/';

    await fetchResource('http://example.org/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('http://example.org/resource'),
      expect.objectContaining({ method : 'GET' }),
    );
  });

  it('fetches with authorization header', async () => {
    const { fetchResource } = await import('./http');
    authToken = 'abc123';

    await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method : 'GET',
        headers : expect.objectContaining({
          Authorization : 'Bearer abc123',
        }),
      }),
    );
  });

  it('logs outgoing request', async () => {
    const { fetchResource } = await import('./http');

    await fetchResource('/resource', { fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Requesting resource',
      url : '/resource',
      type : 'http',
    }, { level : 'info' });
  });

  it('returns response text', async () => {
    const { fetchResource } = await import('./http');
    fetchMock.mockResolvedValue({
      ok : true,
      text : () => Promise.resolve('fetched text'),
    });

    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(result).toEqual('fetched text');
  });

  it('returns null on fetch error', async () => {
    const { fetchResource } = await import('./http');
    fetchMock.mockRejectedValue(new Error('Network error'));

    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
  });

  it('logs a warning on fetch error', async () => {
    const { fetchResource } = await import('./http');
    const error = new Error('Network error');
    fetchMock.mockRejectedValue(error);

    await fetchResource('/resource', { fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Error fetching resource',
      resource : '/resource',
      error,
    }, { level : 'warn' });
  });

  it('returns null when fetch not ok', async () => {
    const { fetchResource } = await import('./http');
    fetchMock.mockRejectedValue(new Error('Network error'));

    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
  });

  it('logs a warning when fetch not ok', async () => {
    const { fetchResource } = await import('./http');
    fetchMock.mockResolvedValue({ ok : false, status : 404 });

    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
    expect(log).toHaveBeenCalledWith({
      message : 'Failed to fetch resource',
      resource : '/resource',
      response : { status : 404 },
    }, { level : 'warn' });
  });

  it('returns null when text parsing fails', async () => {
    const { fetchResource } = await import('./http');
    fetchMock.mockResolvedValue({
      ok : true,
      text : async () => { throw new Error('Text parsing error'); },
    });

    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
  });

  it('logs a warning when text parsing fails', async () => {
    const { fetchResource } = await import('./http');
    const error = new Error('Text parsing error');
    fetchMock.mockResolvedValue({
      ok : true,
      status : 200,
      text : async () => { throw error; },
    });

    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
    expect(log).toHaveBeenCalledWith({
      message : 'Error reading response',
      resource : '/resource',
      response : { status : 200 },
      error,
    }, { level : 'warn' });
  });

  it('returns cached response', async () => {
    const { fetchResource } = await import('./http');
    getCacheMock.mockImplementation(async () => 'cached response');

    const result = await fetchResource('/resource', { fetch : fetchMock });
    expect(result).toBe('cached response');
    expect(getCacheMock).toHaveBeenCalledWith(
      '/resource',
      expect.any(Function),
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});

describe('fetchJsonResource', () => {
  it.each([
    ['with base url undefined', undefined, 'res', '/res'],
    ['with base url empty', '', 'res', '/res'],
    ['with base url slash', '/', 'res', '/res'],
    ['with relative root url', './base', 'res', '/base/res'],
    ['with base url without slash', 'base', 'res', '/base/res'],
    ['with base url with leading slash', '/base', '/res', '/base/res'],
    ['with base url with trailing slash', 'base/', 'res', '/base/res'],
    ['with base url with double slashes', '/base/', '/res', '/base/res'],
    ['with relative url', './base', './res', '/base/res'],
  ])('fetches from local folder %s', async (_, base, resource, expected) => {
    const { fetchJsonResource } = await import('./http');
    baseUrl = base;

    await fetchJsonResource(resource, { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      expected,
      expect.objectContaining({ method : 'GET' }),
    );
  });

  it('fetches from relative URL', async () => {
    const { fetchJsonResource } = await import('./http');
    baseUrl = 'http://example.com/';

    await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/resource', baseUrl),
      expect.objectContaining({ method : 'GET' }),
    );
  });

  it('fetches from absolute URL', async () => {
    const { fetchJsonResource } = await import('./http');
    baseUrl = 'http://example.com/';

    await fetchJsonResource(
      'http://example.org/resource',
      { fetch : fetchMock },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('http://example.org/resource'),
      expect.objectContaining({ method : 'GET' }),
    );
  });

  it('fetches with authorization header', async () => {
    const { fetchJsonResource } = await import('./http');
    authToken = 'abc123';

    await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        method : 'GET',
        headers : expect.objectContaining({
          Authorization : 'Bearer abc123',
        }),
      }),
    );
  });

  it('logs outgoing request', async () => {
    const { fetchJsonResource } = await import('./http');

    await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Requesting resource',
      url : '/resource',
      type : 'http',
    }, { level : 'info' });
  });

  it('returns JSON response', async () => {
    const { fetchJsonResource } = await import('./http');
    fetchMock.mockResolvedValue({
      ok : true,
      json : () => Promise.resolve({ fetched : 'json' }),
    });

    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(result).toEqual({ fetched : 'json' });
  });

  it('returns null on fetch error', async () => {
    const { fetchJsonResource } = await import('./http');
    fetchMock.mockRejectedValue(new Error('Network error'))
    ;
    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
  });

  it('logs a warning on fetch error', async () => {
    const { fetchJsonResource } = await import('./http');
    const error = new Error('Network error');
    fetchMock.mockRejectedValue(error);

    await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(log).toHaveBeenCalledWith({
      message : 'Error fetching resource',
      resource : '/resource',
      error,
    }, { level : 'warn' });
  });

  it('returns null when fetch not ok', async () => {
    const { fetchJsonResource } = await import('./http');
    fetchMock.mockResolvedValue({ ok : false, status : 404 });

    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
  });

  it('logs a warning when fetch not ok', async () => {
    const { fetchJsonResource } = await import('./http');
    fetchMock.mockResolvedValue({ ok : false, status : 404 });

    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
    expect(log).toHaveBeenCalledWith({
      message : 'Failed to fetch resource',
      resource : '/resource',
      response : { status : 404 },
    }, { level : 'warn' });
  });

  it('returns null when JSON parsing fails', async () => {
    const { fetchJsonResource } = await import('./http');
    fetchMock.mockResolvedValue({
      ok : true,
      json : async () => { throw new Error('Error reading JSON'); },
    });

    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
  });

  it('logs a warning when JSON parsing fails', async () => {
    const { fetchJsonResource } = await import('./http');
    const error = new Error('Error reading JSON');
    fetchMock.mockResolvedValue({
      ok : true,
      status : 200,
      json : async () => { throw error; },
    });

    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(fetchMock).toHaveBeenCalledWith(
      '/resource',
      expect.objectContaining({ method : 'GET' }),
    );
    expect(result).toBeNull();
    expect(log).toHaveBeenCalledWith({
      message : 'Error reading JSON response',
      resource : '/resource',
      response : { status : 200 },
      error,
    }, { level : 'warn' });
  });

  it('returns cached JSON response', async () => {
    const { fetchJsonResource } = await import('./http');
    getCacheMock.mockImplementation(async () => ({ cached : 'json' }));

    const result = await fetchJsonResource('/resource', { fetch : fetchMock });
    expect(result).toEqual({ cached : 'json' });
    expect(getCacheMock).toHaveBeenCalledWith(
      '/resource',
      expect.any(Function),
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });
});
