import { resolveUrl as resolvePublicUrl } from '$lib/utils/http';
import { env } from '$env/dynamic/private';

import { log } from './logs';
import { Cache } from './cache';

const TTL = Number(env.RESOURCE_CACHE_TTL) || 60000;

const resourceCache = Cache<string | null>(TTL);
const jsonCache = Cache<unknown>(TTL);

function resolveUrl(path : string) {
  return resolvePublicUrl(path, env.BASE_URL ?? '/');
}

async function requestResource(url : string, { fetch } : {
  fetch : typeof window.fetch;
}) : Promise<Response | null> {
  log({
    message : `Requesting resource`,
    url : resolveUrl(url),
    type : 'http',
  }, { level : 'info' });
  try {
    const response = await fetch(resolveUrl(url), {
      method : 'GET',
      headers : env.RESOURCE_AUTH_TOKEN
        ? { Authorization : `Bearer ${env.RESOURCE_AUTH_TOKEN}` }
        : undefined,
    });
    if (!response.ok) {
      log({
        message : `Failed to fetch resource`,
        resource : resolveUrl(url),
        response : { status : response.status },
      }, { level : 'warn' });
      return null;
    }
    return response;
  } catch (error) {
    log({
      message : `Error fetching resource`,
      resource : resolveUrl(url),
      error,
    }, { level : 'warn' });
    return null;
  }
}

export async function fetchResource(url : string, { fetch } : {
  fetch : typeof window.fetch;
}) : Promise<string | null> {
  return resourceCache.get(url, async () => {
    const response = await requestResource(url, { fetch });
    if (!response) return null;

    try {
      return await response.text();
    } catch (error) {
      log({
        message : `Error reading response`,
        resource : resolveUrl(url),
        response : { status : response.status },
        error,
      }, { level : 'warn' });
      return null;
    }
  });
}

export async function fetchJsonResource(url : string, { fetch } : {
  fetch : typeof window.fetch;
}) {
  return jsonCache.get(url, async () => {
    const response = await requestResource(url, { fetch });
    if (!response) return null;

    try {
      return await response.json();
    } catch (error) {
      log({
        message : `Error reading JSON response`,
        resource : resolveUrl(url),
        response : { status : response.status },
        error,
      }, { level : 'warn' });
      return null;
    }
  });
}
