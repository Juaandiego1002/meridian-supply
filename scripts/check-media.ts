import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function checkMedia() {
  const payload = await getPayload({ config })
  
  const media = await payload.find({
    collection: 'media',
    limit: 50,
    depth: 0,
  })
  
  console.log('Total media:', media.totalDocs)
  media.docs.forEach((m, i) => {
    console.log(`${i+1}. ${m.filename} (${m.mimeType}) - ${m.url}`)
  })
}

checkMedia()