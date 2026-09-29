import type { Category, Media, Product, VariantOption, VariantType } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

type ProductArgs = {
  galleryImages: NonNullable<Product['gallery']>
  metaImage: Media
  contentImage: Media
  variantTypes: VariantType[]
  categories: Category[]
  relatedProducts: Product[]
}

export const productTshirtData: (
  args: ProductArgs,
) => RequiredDataFromCollectionSlug<'products'> = ({
  galleryImages,
  relatedProducts,
  metaImage,
  contentImage,
  variantTypes,
  categories,
}) => {
  return {
    enableVariants: true,
    variantTypes: variantTypes,
    inventory: 0,
    meta: {
      title: 'Playera Círculo Polar | Meridian Supply',
      image: metaImage,
      description:
        'Playera de algodón 100% con estampa serigráfica. Corte unisex, tejido suave y duradero para el diario.',
    },
    _status: 'published',
    layout: [
      {
        blockType: 'mediaBlock',
        media: contentImage,
      },
      {
        blockType: 'content',
        columns: [
          {
            size: 'half',
            richText: {
              root: {
                children: [
                  {
                    children: [
                      {
                        detail: 0,
                        format: 0,
                        mode: 'normal',
                        style: '',
                        text: 'La Círculo Polar es nuestra playera insignia: algodón 100%, estampa serigráfica a mano y un corte unisex que cae derecho. Diseñada para durar temporada tras temporada.',
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
          },
          {
            size: 'half',
            richText: {
              root: {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'Tipo de producto: playera',
                            type: 'text',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'listitem',

checked: false,

version: 1,
                        value: 1,
                      },
                      {
                        children: [
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'Material: 100% algodón peinado, 180 g',
                            type: 'text',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'listitem',

checked: false,

version: 1,
                        value: 2,
                      },
                      {
                        children: [
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'Estampa: serigrafía al agua',
                            type: 'text',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'listitem',

checked: false,

version: 1,
                        value: 3,
                      },
                      {
                        children: [
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'Corte: unisex, tallas XS a G',
                            type: 'text',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'listitem',

checked: false,

version: 1,
                        value: 4,
                      },
                    ],
                    direction: 'ltr',
                    format: 'left',
                    indent: 0,
                    type: 'list',
                    listType: 'bullet',
                    tag: 'ul',
                    version: 1,
                    start: 1,
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
          },
        ],
      },
    ],
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
                text: 'Playera de algodón 100% con estampa serigráfica, corte unisex y tejido suave. Disponible en negro y blanco, tallas XS a G.',
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
    gallery: galleryImages,
    title: 'Playera Círculo Polar',
    slug: 'playera-circulo-polar',
    priceInMXNEnabled: true,
    priceInMXN: 45000,
    relatedProducts: relatedProducts,
  }
}

type ProductVariantArgs = {
  product: Product
  variantOptions: VariantOption[]
  inventory?: number
  priceInMXN?: number
}

export const productTshirtVariant: (
  args: ProductVariantArgs,
) => RequiredDataFromCollectionSlug<'variants'> = ({
  product,
  variantOptions,
  inventory = 48,
  priceInMXN = 45000,
}) => {
  return {
    product: product,
    options: variantOptions,
    inventory,
    priceInMXNEnabled: true,
    priceInMXN,
    _status: 'published',
  }
}