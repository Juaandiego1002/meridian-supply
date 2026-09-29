import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function check() {
  const payload = await getPayload({ config })
  
  // Simulate shop page query
  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: { title: true, slug: true, gallery: true, categories: true, priceInMXN: true },
    depth: 2,
    where: { _status: { equals: 'published' } },
  })
  console.log('Shop query result:', products.docs.length, 'products')
  products.docs.forEach(p => console.log(' -', p.title, p.slug, 'gallery:', p.gallery?.length || 0, p.gallery))
}

check()