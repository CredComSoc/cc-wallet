import type { PageLoad } from './$types';

export const ssr = false;

export const load = (async ({ fetch, params }) => {
    const res = await fetch(`http://localhost:8001/account/names`, {
      headers: {
        "cc-user": "fees",
        "cc-auth": "123"
      }
    });
    const json = await res.json();

    return { json };
}) satisfies PageLoad;
