import { VariantFiltersClient } from './VariantFiltersClient'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

// Filtros de variante (Talla, Color) para la tienda. El servidor obtiene los
// tipos de variante (porque requieren acceso a la base de datos) y el cliente
// construye los links con los searchParams actuales de la URL.
export const VariantFilters: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })

  const variantTypes = await payload.find({
    collection: 'variantTypes',
    depth: 1,
  })

  if (!variantTypes.docs.length) return null

  return <VariantFiltersClient variantTypes={variantTypes.docs} />
}