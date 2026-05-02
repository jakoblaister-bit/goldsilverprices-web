import { createClient } from '@sanity/client'

const PROJECT_ID = import.meta.env.VITE_SANITY_PROJECT_ID

const client = PROJECT_ID
  ? createClient({
      projectId: PROJECT_ID,
      dataset: import.meta.env.VITE_SANITY_DATASET || 'production',
      useCdn: true,
      apiVersion: '2024-01-01',
    })
  : null

export async function fetchArticlesMeta() {
  if (!client) return null
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      "slug": slug.current,
      title,
      tag,
      readMin,
      excerpt,
      "img": coverImage.asset->url + "?w=800&auto=format",
      publishedAt
    }
  `)
}

export async function fetchCoinImages() {
  if (!client) return null
  const rows = await client.fetch(`
    *[_type == "coinImage"] {
      coinType,
      metal,
      "url": image.asset->url + "?w=400&auto=format"
    }
  `)
  const lookup = {}
  for (const r of rows) {
    if (!lookup[r.coinType]) lookup[r.coinType] = {}
    lookup[r.coinType][r.metal] = r.url
  }
  return lookup
}

export async function fetchBarImages() {
  if (!client) return null
  const rows = await client.fetch(`
    *[_type == "barImage"] {
      metal,
      "url": image.asset->url + "?w=600&auto=format"
    }
  `)
  const lookup = {}
  for (const r of rows) lookup[r.metal] = r.url
  return lookup
}

export async function fetchArticleBySlug(slug) {
  if (!client) return null
  const raw = await client.fetch(`
    *[_type == "post" && slug.current == $slug][0] {
      "slug": slug.current,
      title,
      tag,
      readMin,
      "img": coverImage.asset->url + "?w=1200&auto=format",
      sections[] { heading, body }
    }
  `, { slug })
  if (!raw) return null
  return {
    ...raw,
    sections: (raw.sections || []).map(s => ({
      h: s.heading,
      p: s.body.split(/\n\n+/).filter(Boolean),
    })),
  }
}