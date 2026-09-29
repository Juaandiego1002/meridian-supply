'use client'

import { Button } from '@/components/ui/button'
import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type { Product, Media, Category, Variant } from '@/payload-types'

interface Props {
  product: Product
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

export function ProductCard({ product }: Props) {
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