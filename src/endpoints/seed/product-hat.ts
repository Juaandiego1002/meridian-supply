import type { Category, Product, VariantOption, VariantType } from '@/payload-types'
import type { Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

type ProductArgs = {
  galleryImage: Media
  metaImage: Media
  variantTypes: VariantType[]
  categories: Category[]
  relatedProducts: Product[]
}

export const productHatData: (args: ProductArgs) => RequiredDataFromCollectionSlug<'products'> = ({
  galleryImage,
  relatedProducts,
  metaImage,
  variantTypes,
  categories,
}) => {
  return {
    meta: {
      title: 'Gorra Meridian | Meridian Supply',
      image: metaImage,
      description:
        'Gorra de seis paneles con bordado frontal Meridian. Ala curva, tela ligera y cierre ajustable.',
    },
    _status: 'published',
    layout: [],
    categories: categories,
    description: {
      root: {
        children: [
          {
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Gorra de seis paneles con bordado frontal Meridian, ala curva y tela ligera. Cierre ajustable trasero para un ajuste firme. Ideal para el diario o para acabar cualquier fit.',
                type: 'text',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'paragraph',
            version: 1,
            textFormat: 0,
            textStyle: '',
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    },
    gallery: [{ image: galleryImage }],
    title: 'Gorra Meridian',
    slug: 'gorra-meridian',
    priceInMXNEnabled: true,
    priceInMXN: 56000,
    relatedProducts: relatedProducts,
  }
}