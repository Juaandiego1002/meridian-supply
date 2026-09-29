import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

async function fetchFileByURL(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const data = await res.arrayBuffer()
  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}

async function runSeed() {
  console.log('Iniciando seed simple...')
  
  const payload = await getPayload({ config })
  
  try {
    // Obtener o crear usuario admin
    const adminUser = await payload.find({
      collection: 'users',
      where: { email: { equals: 'admin@meridiansupply.com' } },
      limit: 1,
    })
    
    let user = adminUser.docs[0]
    
    if (!user) {
      user = await payload.create({
        collection: 'users',
        data: {
          name: 'Admin Meridian',
          email: 'admin@meridiansupply.com',
          password: 'admin123456',
          roles: ['admin'],
        },
      })
    }
    
    const { createLocalReq } = await import('payload')
    const payloadReq = await createLocalReq({ user }, payload)
    
    console.log('— Limpiando datos anteriores...')
    await Promise.all([
      payload.db.deleteMany({ collection: 'variants', req: payloadReq, where: {} }),
      payload.db.deleteMany({ collection: 'variantOptions', req: payloadReq, where: {} }),
      payload.db.deleteMany({ collection: 'variantTypes', req: payloadReq, where: {} }),
      payload.db.deleteMany({ collection: 'products', req: payloadReq, where: {} }),
      payload.db.deleteMany({ collection: 'categories', req: payloadReq, where: {} }),
      payload.db.deleteMany({ collection: 'media', req: payloadReq, where: {} }),
    ])
    
    console.log('— Creando categorías...')
    const [accessoriesCat, tshirtsCat, hatsCat] = await Promise.all([
      payload.create({ collection: 'categories', data: { title: 'Accesorios', slug: 'accesorios' }, req: payloadReq }),
      payload.create({ collection: 'categories', data: { title: 'Playeras', slug: 'playeras' }, req: payloadReq }),
      payload.create({ collection: 'categories', data: { title: 'Gorras', slug: 'gorras' }, req: payloadReq }),
    ])
    
    console.log('— Creando tipos de variante...')
    const sizeType = await payload.create({
      collection: 'variantTypes',
      data: { name: 'size', label: 'Talla' },
      req: payloadReq,
    })
    
    const colorType = await payload.create({
      collection: 'variantTypes',
      data: { name: 'color', label: 'Color' },
      req: payloadReq,
    })
    
    const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    const colorOptions = ['Negro', 'Blanco', 'Gris', 'Azul', 'Verde']
    
    const createdSizeOpts = await Promise.all(
      sizeOptions.map((label) =>
        payload.create({
          collection: 'variantOptions',
          data: { label, value: label.toLowerCase(), variantType: sizeType.id },
          req: payloadReq,
        })
      )
    )
    
    const createdColorOpts = await Promise.all(
      colorOptions.map((label) =>
        payload.create({
          collection: 'variantOptions',
          data: { label, value: label.toLowerCase(), variantType: colorType.id },
          req: payloadReq,
        })
      )
    )
    
    console.log('— Descargando imágenes de GitHub...')
    const baseUrl = 'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/ecommerce/src/endpoints/seed'
    
    const uploadMedia = async (url: string, alt: string) => {
      const file = await fetchFileByURL(url)
      return payload.create({
        collection: 'media',
        data: { alt },
        file,
        req: payloadReq,
      })
    }
    
    const [
      imgPlayeraNegro, imgPlayeraBlanco, imgPlayeraGris,
      imgGorraNegra, imgGorraBlanca, imgHoodieNegro, imgPantalonNegro
    ] = await Promise.all([
      uploadMedia(`${baseUrl}/tshirt-black.png`, 'Playera negra'),
      uploadMedia(`${baseUrl}/tshirt-white.png`, 'Playera blanca'),
      uploadMedia(`${baseUrl}/tshirt-black.png`, 'Playera gris'),
      uploadMedia(`${baseUrl}/hat-logo.png`, 'Gorra negra'),
      uploadMedia(`${baseUrl}/hat-logo.png`, 'Gorra blanca'),
      uploadMedia(`${baseUrl}/tshirt-black.png`, 'Hoodie negro'),
      uploadMedia(`${baseUrl}/tshirt-black.png`, 'Pantalón negro'),
    ])
    
    console.log('— Creando productos con variantes...')
    
    // 1. Playera básica
    const playera = await payload.create({
      collection: 'products',
      data: {
        title: 'Playera Círculo Polar',
        slug: 'playera-circulo-polar',
        enableVariants: true,
        variantTypes: [sizeType.id, colorType.id],
        inventory: 0,
        priceInMXNEnabled: true,
        priceInMXN: 45000,
        _status: 'published',
        categories: [tshirtsCat.id],
        gallery: [
          { image: imgPlayeraNegro.id, variantOption: createdColorOpts.find(o => o.label === 'Negro')?.id },
          { image: imgPlayeraBlanco.id, variantOption: createdColorOpts.find(o => o.label === 'Blanco')?.id },
          { image: imgPlayeraGris.id, variantOption: createdColorOpts.find(o => o.label === 'Gris')?.id },
        ],
        description: {
          root: {
            type: 'root',
            version: 1,
            children: [
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Playera de algodón 100% con estampa serigráfica, corte unisex y tejido suave. Disponible en varios colores y tallas.' }] }
            ],
            direction: 'ltr', format: '', indent: 0
          }
        },
      },
      req: payloadReq,
    })
    
    // Crear variantes para la playera (tallas XS-XXL × Negro/Blanco/Gris)
    const playeraColors = ['Negro', 'Blanco', 'Gris']
    for (const colorLabel of playeraColors) {
      const colorOpt = createdColorOpts.find(o => o.label === colorLabel)
      if (!colorOpt) continue
      for (const sizeOpt of createdSizeOpts) {
        await payload.create({
          collection: 'variants',
          data: {
            product: playera.id,
            options: [sizeOpt.id, colorOpt.id],
            inventory: sizeOpt.label === 'M' && colorOpt.label === 'Negro' ? 0 : 25, // M Negro agotado
            priceInMXNEnabled: true,
            priceInMXN: 45000,
            _status: 'published',
          },
          req: payloadReq,
        })
      }
    }
    
    // 2. Hoodie
    const hoodie = await payload.create({
      collection: 'products',
      data: {
        title: 'Hoodie Logotipo',
        slug: 'hoodie-logotipo',
        enableVariants: true,
        variantTypes: [sizeType.id, colorType.id],
        inventory: 0,
        priceInMXNEnabled: true,
        priceInMXN: 85000,
        _status: 'published',
        categories: [tshirtsCat.id],
        gallery: [
          { image: imgHoodieNegro.id, variantOption: createdColorOpts.find(o => o.label === 'Negro')?.id },
        ],
        description: {
          root: {
            type: 'root',
            version: 1,
            children: [
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Hoodie pesado de algodón 320g, capucha forrada, bolsillo canguro. Corte oversize unisex.' }] }
            ],
            direction: 'ltr', format: '', indent: 0
          }
        },
      },
      req: payloadReq,
    })
    
    const hoodieColors = ['Negro', 'Gris', 'Azul']
    for (const colorLabel of hoodieColors) {
      const colorOpt = createdColorOpts.find(o => o.label === colorLabel)
      if (!colorOpt) continue
      for (const sizeOpt of createdSizeOpts) {
        await payload.create({
          collection: 'variants',
          data: {
            product: hoodie.id,
            options: [sizeOpt.id, colorOpt.id],
            inventory: 20,
            priceInMXNEnabled: true,
            priceInMXN: 85000,
            _status: 'published',
          },
          req: payloadReq,
        })
      }
    }
    
    // 3. Gorra
    const gorra = await payload.create({
      collection: 'products',
      data: {
        title: 'Gorra Trucker',
        slug: 'gorra-trucker',
        enableVariants: true,
        variantTypes: [colorType.id],
        inventory: 0,
        priceInMXNEnabled: true,
        priceInMXN: 35000,
        _status: 'published',
        categories: [hatsCat.id, accessoriesCat.id],
        gallery: [
          { image: imgGorraNegra.id, variantOption: createdColorOpts.find(o => o.label === 'Negro')?.id },
          { image: imgGorraBlanca.id, variantOption: createdColorOpts.find(o => o.label === 'Blanco')?.id },
        ],
        description: {
          root: {
            type: 'root',
            version: 1,
            children: [
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Gorra trucker 5 paneles, malla trasera, cierre snapback ajustable. Logo bordado frontal.' }] }
            ],
            direction: 'ltr', format: '', indent: 0
          }
        },
      },
      req: payloadReq,
    })
    
    const gorraColors = ['Negro', 'Blanco', 'Verde']
    for (const colorLabel of gorraColors) {
      const colorOpt = createdColorOpts.find(o => o.label === colorLabel)
      if (!colorOpt) continue
      await payload.create({
        collection: 'variants',
        data: {
          product: gorra.id,
          options: [colorOpt.id],
          inventory: 30,
          priceInMXNEnabled: true,
          priceInMXN: 35000,
          _status: 'published',
        },
        req: payloadReq,
      })
    }
    
    // 4. Pantalón
    const pantalon = await payload.create({
      collection: 'products',
      data: {
        title: 'Pantalón Cargo',
        slug: 'pantalon-cargo',
        enableVariants: true,
        variantTypes: [sizeType.id, colorType.id],
        inventory: 0,
        priceInMXNEnabled: true,
        priceInMXN: 75000,
        _status: 'published',
        categories: [tshirtsCat.id],
        gallery: [
          { image: imgPantalonNegro.id, variantOption: createdColorOpts.find(o => o.label === 'Negro')?.id },
        ],
        description: {
          root: {
            type: 'root',
            version: 1,
            children: [
              { type: 'paragraph', version: 1, children: [{ type: 'text', version: 1, text: 'Pantalón cargo de lona resistente, 6 bolsillos, cintura elástica con cordón. Corte relajado.' }] }
            ],
            direction: 'ltr', format: '', indent: 0
          }
        },
      },
      req: payloadReq,
    })
    
    const pantalonColors = ['Negro', 'Verde', 'Gris']
    for (const colorLabel of pantalonColors) {
      const colorOpt = createdColorOpts.find(o => o.label === colorLabel)
      if (!colorOpt) continue
      for (const sizeOpt of createdSizeOpts) {
        await payload.create({
          collection: 'variants',
          data: {
            product: pantalon.id,
            options: [sizeOpt.id, colorOpt.id],
            inventory: 15,
            priceInMXNEnabled: true,
            priceInMXN: 75000,
            _status: 'published',
          },
          req: payloadReq,
        })
      }
    }
    
    // Configurar header y footer globals
    console.log('— Configurando header y footer...')
    await payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Inicio', url: '/' } },
          { link: { type: 'custom', label: 'Tienda', url: '/shop' } },
          { link: { type: 'custom', label: 'Mi cuenta', url: '/account' } },
        ],
      },
      req: payloadReq,
    })
    
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Admin', url: '/admin' } },
          { link: { type: 'custom', label: 'Buscar mi pedido', url: '/find-order' } },
          { link: { type: 'custom', label: 'Contacto', url: '/contact' } },
        ],
      },
      req: payloadReq,
    })
    
    console.log('¡Seed completado exitosamente!')
    console.log('')
    console.log('Productos creados:')
    console.log('  - Playera Círculo Polar (XS-XXL, Negro/Blanco/Gris) - M Negro agotado')
    console.log('  - Hoodie Logotipo (XS-XXL, Negro/Gris/Azul)')
    console.log('  - Gorra Trucker (Negro/Blanco/Verde)')
    console.log('  - Pantalón Cargo (XS-XXL, Negro/Verde/Gris)')
    console.log('')
    console.log('Usuario admin: admin@meridiansupply.com / admin123456')
    console.log('Usuario cliente: customer@example.com / password')
    
    process.exit(0)
  } catch (error) {
    console.error('Error en seed:', error)
    process.exit(1)
  }
}

runSeed()