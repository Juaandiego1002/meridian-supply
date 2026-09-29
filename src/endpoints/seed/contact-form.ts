import { RequiredDataFromCollectionSlug } from 'payload'

export const contactFormData: () => RequiredDataFromCollectionSlug<'forms'> = () => {
  return {
    confirmationMessage: {
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
                text: 'Recibimos tu mensaje. Te respondemos pronto.',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            tag: 'h2',
            version: 1,
          },
        ],
        direction: 'ltr',
        format: '',
        indent: 0,
        version: 1,
      },
    },
    confirmationType: 'message',
    createdAt: '2023-01-12T21:47:41.374Z',
    emails: [
      {
        emailFrom: '"Payload" \u003Cdemo@payloadcms.com\u003E',
        emailTo: '{{email}}',
        message: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'Recibimos tu mensaje. Te responderemos lo antes posible.',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
        subject: 'Nuevo mensaje desde Meridian Supply',
      },
    ],
    fields: [
      {
        name: 'full-name',
        blockName: 'full-name',
        blockType: 'text',
        label: 'Nombre completo',
        required: true,
        width: 100,
      },
      {
        name: 'email',
        blockName: 'email',
        blockType: 'email',
        label: 'Correo electrónico',
        required: true,
        width: 100,
      },
      {
        name: 'phone',
        blockName: 'phone',
        blockType: 'number',
        label: 'Teléfono',
        required: false,
        width: 100,
      },
      {
        name: 'message',
        blockName: 'message',
        blockType: 'textarea',
        label: 'Mensaje',
        required: true,
        width: 100,
      },
    ],
    redirect: undefined,
    submitButtonLabel: 'Enviar',
    title: 'Formulario de contacto',
    updatedAt: '2023-01-12T21:47:41.374Z',
  }
}
