import type { Category, Media } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

type ProductArgs = {
  metaImage: Media
  contentImage: Media
}

export const homePageData: (args: ProductArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  metaImage,
  contentImage,
}) => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'lowImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Ver la tienda',
            url: '/shop',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: 'Contacto',
            url: '/contact',
          },
        },
      ],
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Meridian Supply',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Streetwear técnico hecho para el diario: playeras, gorras y prendas de edición limitada. Envíos a todo México.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
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
                        text: 'Meridian es una supply store: prendas básicas bien resueltas, tallas claras y stock real en cada variante. Sin colecciones infinitas — poca ropa, hecha para que la uses hasta cansarla.',
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
                            text: 'Elige talla y color con stock real, sin sorpresas.',
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
                            text: 'Paga con tarjeta de forma segura (Stripe).',
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
                            text: 'Seguimiento de tu pedido desde tu cuenta.',
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
    meta: {
      description: 'Streetwear técnico de edición limitada. Envíos a todo México.',
      image: metaImage,
      title: 'Meridian Supply | Streetwear técnico',
    },
    title: 'Inicio',
  }
}