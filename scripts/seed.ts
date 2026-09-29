import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from '@/endpoints/seed'

// El admin se crea con credenciales del entorno, nunca hardcodeadas. Un password
// en el repo acaba en producción sin que nadie lo note.
const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD

if (!email || !password) {
  console.error('Faltan SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD en el entorno.')
  console.error('Defínelas antes de ejecutar el seed (en .env.production para producción).')
  process.exit(1)
}

if (password.length < 12) {
  console.error('SEED_ADMIN_PASSWORD debe tener al menos 12 caracteres.')
  process.exit(1)
}

// Anotación explícita: TypeScript no arrastra el estrechamiento de las guardas
// de arriba dentro de la función async.
const adminEmail: string = email
const adminPassword: string = password

async function runSeed() {
  // Por defecto solo contenido. Los pedidos, carritos y transacciones de ejemplo
  // son datos de prueba y no deben acabar en una base real.
  const contentOnly = process.env.SEED_CONTENT_ONLY !== 'false'

  console.log('Iniciando seed...')
  console.log(`  admin:     ${adminEmail}`)
  console.log(`  contenido: ${contentOnly ? 'solo (sin pedidos/carritos)' : 'completo'}`)

  const started = process.hrtime.bigint()
  const payload = await getPayload({ config })

  try {
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: adminEmail } },
      limit: 1,
    })

    let user = existing.docs[0]

    if (!user) {
      user = await payload.create({
        collection: 'users',
        data: {
          name: process.env.SEED_ADMIN_NAME || 'Admin',
          email: adminEmail,
          password: adminPassword,
          roles: ['admin'],
        },
      })
      console.log(`  usuario admin creado: ${adminEmail}`)
    } else {
      console.log(`  usuario admin ya existía: ${adminEmail}`)
    }

    const { createLocalReq } = await import('payload')
    const payloadReq = await createLocalReq({ user }, payload)

    await seed({ payload, req: payloadReq, contentOnly })

    const seconds = Number(process.hrtime.bigint() - started) / 1e9
    console.log(`¡Seed completado exitosamente! (${seconds.toFixed(1)}s)`)
    process.exit(0)
  } catch (error) {
    // Los ValidationError de Payload traen referencias circulares, asi que
    // JSON.stringify normal solo devuelve "[Object]" o "{}".
    if (error instanceof Error) {
      console.error('Error en seed:', error.message)
      const cause = (error as { cause?: unknown }).cause
      if (cause) console.error('Causa:', cause instanceof Error ? cause.message : cause)
      if (process.env.SEED_DEBUG && error.stack) console.error(error.stack)
    } else {
      console.error('Error en seed:', error)
    }
    process.exit(1)
  }
}

runSeed()
