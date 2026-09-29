import type { Metadata } from 'next'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { draftMode } from 'next/headers'

import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { ArrowRightIcon, ShieldIcon, TruckIcon, RotateCcwIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Product, Media, Category, Variant } from '@/payload-types'

// Force dynamic rendering to avoid build-time MongoDB connection
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Meridian Supply — Streetwear Técnico',
  description: 'Ropa urbana funcional: hoodies, playeras, gorras y pantalones. Diseño de almacén, señalética industrial. Envíos a todo México.',
  openGraph: {
    title: 'Meridian Supply — Streetwear Técnico',
    description: 'Ropa urbana funcional: hoodies, playeras, gorras y pantalones. Diseño de almacén, señalética industrial. Envíos a todo México.',
    type: 'website',
  },
}

function isMedia(obj: unknown): obj is Media {
  return typeof obj === 'object' && obj !== null && 'url' in obj
}

function isCategory(obj: unknown): obj is Category {
  return typeof obj === 'object' && obj !== null && 'title' in obj
}

function isVariant(obj: unknown): obj is Variant {
  return typeof obj === 'object' && obj !== null && 'priceInMXN' in obj && 'inventory' in obj
}

async function getFeaturedProducts(): Promise<Product[]> {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    draft,
    limit: 4,
    depth: 2,
    overrideAccess: false,
    where: {
      _status: { equals: 'published' },
    },
    select: {
      title: true,
      slug: true,
      priceInMXN: true,
      gallery: true,
      categories: true,
      enableVariants: true,
      variants: true,
    },
  })

  return result.docs as unknown as Product[]
}

function ProductCardClient({ product }: { product: Product }) {
  const image = product.gallery?.[0]?.image
  const variantDocs = Array.isArray(product.variants?.docs)
    ? product.variants.docs.filter(isVariant)
    : []
  const hasVariants = product.enableVariants && variantDocs.length > 0
  
  const minPrice = variantDocs.length > 0
    ? Math.min(...variantDocs.map(v => v.priceInMXN ?? Infinity))
    : product.priceInMXN ?? 0
  
  const hasStock = variantDocs.length > 0
    ? variantDocs.some(v => (v.inventory ?? 0) > 0)
    : true

  const firstCategory = product.categories?.find(isCategory)

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col h-full bg-background border border-border rounded-lg overflow-hidden transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {image && isMedia(image) && (
          <img
            src={`${process.env.NEXT_PUBLIC_SERVER_URL}${image.url}`}
            alt={image.alt || product.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            width={image.width ?? 800}
            height={image.height ?? 800}
            loading="lazy"
          />
        )}
        {!hasStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-3 py-1 text-xs font-mono uppercase tracking-widest bg-destructive text-destructive-foreground rounded">
              Agotado
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
          {firstCategory?.title || 'Nuevo'}
        </p>
        <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-mono text-base font-medium">
            ${minPrice?.toLocaleString('es-MX')} MXN
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors h-auto px-3 py-1.5"
            aria-label={`Ver ${product.title}`}
          >
            <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Link>
  )
}

function FeatureSection({ products }: { products: Product[] }) {
  return (
    <section className="py-16 md:py-24" aria-labelledby="featured-heading">
      <div className="container">
        <header className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-2">
            Selección de la semana
          </p>
          <h2 id="featured-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
            Productos destacados
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Curados para el día a día. Algodón pesado, cortes relajados, señalética funcional.
          </p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCardClient key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/shop">
            <Button variant="outline" size="lg" className="gap-2">
              Ver toda la colección
              <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  const values = [
    {
      icon: ShieldIcon,
      title: 'Calidad de almacén',
      description: 'Materiales probados: algodón 180–320g, costuras reforzadas, estampas que no ceden.',
    },
    {
      icon: TruckIcon,
      title: 'Envío nacional',
      description: 'Llegamos a todo México. CDMX y área metro en 24–48h, resto del país 3–5 días.',
    },
    {
      icon: RotateCcwIcon,
      title: 'Cambios sin fricción',
      description: 'Talla o color no encajan. 30 días para cambiarlo. Sin preguntas, sin coste extra.',
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/50" aria-labelledby="values-heading">
      <div className="container">
        <header className="mb-12 text-center">
          <h2 id="values-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
            Por qué Meridian
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            No somos una marca de marketing. Somos una supply store: producto honesto, logística real.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, i) => (
            <article
              key={value.title}
              className="p-6 md:p-8 bg-background border border-border rounded-lg text-center transition-all hover:border-primary/50"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 mb-4 rounded-lg bg-primary/10 text-primary">
                <value.icon className="w-7 h-7" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-medium mb-2">{value.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function NewsletterSection() {
  return (
    <section className="py-16 md:py-24" aria-labelledby="newsletter-heading">
      <div className="container">
        <div className="max-w-xl mx-auto text-center">
          <h2 id="newsletter-heading" className="text-3xl md:text-4xl font-medium tracking-tight">
            Entra en la supply chain
          </h2>
          <p className="mt-4 text-muted-foreground mb-8">
            Drops, restocks y contenido de almacén. Sin spam, solo señal.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" action="/api/newsletter" method="POST">
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="tu@email.com"
              required
              className="flex-1 px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              autoComplete="email"
            />
            <Button type="submit" className="whitespace-nowrap">
              Suscribirme
              <ArrowRightIcon className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">
            Al suscribirte aceptas nuestra <a href="/privacy" className="underline hover:text-primary">Política de privacidad</a>.
          </p>
        </div>
      </div>
    </section>
  )
}

function HeroSection() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden" aria-labelledby="hero-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" aria-hidden="true" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center bg-auto opacity-5" aria-hidden="true" />
      <div className="relative z-10 container px-4 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4 animate-fade-in-up">
          Nueva temporada · Otoño 2025
        </p>
        <h1
          id="hero-heading"
          className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight leading-tight mb-6 animate-fade-in-up animate-delay-100"
          style={{ fontWeight: 400 }}
        >
          Ropa que
          <br />
          <span className="text-primary">trabaja</span>
          <br />
          contigo
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up animate-delay-200">
          Streetwear técnico de almacén. Algodón pesado, cortes funcionales, señalética industrial.
          Sin logos innecesarios. Solo producto honesto para el día a día.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animate-delay-300">
          <Link href="/shop">
            <Button size="lg" className="gap-2 px-8 py-3 text-base">
              Ver colección
              <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
            </Button>
          </Link>
          <Link href="/shop?category=playeras">
            <Button variant="outline" size="lg" className="gap-2 px-8 py-3 text-base">
              Playeras desde $450
            </Button>
          </Link>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in-up animate-delay-400">
          <span className="flex items-center gap-2 font-mono uppercase tracking-widest">
            <ShieldIcon className="w-4 h-4" aria-hidden="true" />
            Calidad garantizada
          </span>
          <span className="flex items-center gap-2 font-mono uppercase tracking-widest">
            <TruckIcon className="w-4 h-4" aria-hidden="true" />
            Envío 24–48h CDMX
          </span>
          <span className="flex items-center gap-2 font-mono uppercase tracking-widest">
            <RotateCcwIcon className="w-4 h-4" aria-hidden="true" />
            Cambios 30 días
          </span>
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  const products = await getFeaturedProducts()

  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection />
      <FeatureSection products={products} />
      <ValuesSection />
      <NewsletterSection />
    </main>
  )
}