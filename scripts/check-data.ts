import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function check() {
  const payload = await getPayload({ config })
  
  // Check globals
  const header = await payload.findGlobal({ slug: 'header', depth: 0 })
  console.log('Header navItems:', JSON.stringify(header.navItems, null, 2))
  
  // Check pages
  const pages = await payload.find({ collection: 'pages', limit: 10 })
  console.log('Pages:', pages.docs.map(p => ({ title: p.title, slug: p.slug })))
  
  // Check products
  const products = await payload.find({ collection: 'products', limit: 10, depth: 2 })
  console.log('Products:', products.docs.map(p => ({ title: p.title, slug: p.slug, _status: p._status })))
}

check()