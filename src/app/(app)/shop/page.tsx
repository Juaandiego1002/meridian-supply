import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

// Force dynamic rendering to avoid build-time MongoDB connection
export const dynamic = 'force-dynamic'

export const metadata = {
  description: 'Busca productos en la tienda.',
  title: 'Tienda',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

// Filtra los productos que tienen una variante con la talla/color elegidos.
// Las variantes son una relación virtual del producto, así que resolvemos los IDs
// consultando primero 'variantOptions' y luego 'variants'.
const filterByVariantOption = async ({
  payload,
  optionValue,
  currentIDs,
}: {
  payload: Awaited<ReturnType<typeof getPayload>>
  optionValue: string
  currentIDs: string[] | null
}): Promise<string[]> => {
  const option = await payload.find({
    collection: 'variantOptions',
    depth: 0,
    limit: 1,
    pagination: false,
    where: {
      value: { equals: optionValue },
    },
  })

  const optionID = option.docs[0]?.id
  if (!optionID) return []

  const variants = await payload.find({
    collection: 'variants',
    depth: 0,
    limit: 1000,
    pagination: false,
    where: {
      and: [
        { options: { contains: optionID } },
        { product: { exists: true } },
      ],
    },
    select: { product: true },
  })

  const result = variants.docs.map((variant) => {
    if (typeof variant.product === 'object' && variant.product?.id) {
      return String(variant.product.id)
    }
    return String(variant.product)
  })

  // Intersección con los IDs ya filtrados (si ya veníamos de otro filtro)
  return currentIDs ? currentIDs.filter((id) => result.includes(id)) : result
}

export default async function ShopPage({ searchParams }: Props) {
  const { q: searchValue, sort, category, size, color } = await searchParams
  const payload = await getPayload({ config: configPromise })

  let filteredProductIDs: string[] | null = null

  if (size && typeof size === 'string' && size !== 'todas') {
    filteredProductIDs = await filterByVariantOption({ payload, optionValue: size, currentIDs: filteredProductIDs })
  }

  if (color && typeof color === 'string' && color !== 'todos') {
    filteredProductIDs = await filterByVariantOption({ payload, optionValue: color, currentIDs: filteredProductIDs })
  }

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInMXN: true,
    },
    ...(sort ? { sort } : { sort: 'title' }),
    ...(searchValue || category || filteredProductIDs
      ? {
          where: {
            and: [
              {
                _status: {
                  equals: 'published',
                },
              },
              ...(searchValue
                ? [
                    {
                      or: [
                        {
                          title: {
                            like: searchValue,
                          },
                        },
                        {
                          description: {
                            like: searchValue,
                          },
                        },
                      ],
                    },
                  ]
                : []),
              ...(category
                ? [
                    {
                      categories: {
                        contains: category,
                      },
                    },
                  ]
                : []),
              ...(Array.isArray(filteredProductIDs) && filteredProductIDs.length > 0
                ? [{ id: { in: filteredProductIDs } }]
                : []),
              // El usuario filtró una talla/color pero ningún producto coincide:
              // forzamos un resultado vacío.
              ...(Array.isArray(filteredProductIDs) && filteredProductIDs.length === 0
                ? [{ id: { in: [''] } }]
                : []),
            ],
          },
        }
      : {}),
  })

  const resultsText = products.docs.length === 1 ? 'resultado' : 'resultados'

  return (
    <div>
      {searchValue ? (
        <p className="mb-4">
          {products.docs?.length === 0
            ? 'No hay productos que coincidan con '
            : `Mostrando ${products.docs.length} ${resultsText} para `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}

      {!searchValue && products.docs?.length === 0 && (
        <p className="mb-4">No hay productos. Prueba con otros filtros.</p>
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.docs.map((product) => {
            return <ProductGridItem key={product.id} product={product} />
          })}
        </Grid>
      ) : null}
    </div>
  )
}