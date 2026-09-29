import { Banner } from '@payloadcms/ui'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

export const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>¡Bienvenido a tu tienda Meridian Supply!</h4>
      </Banner>
      Esto es lo que sigue:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' con algunos productos y páginas para arrancar tu proyecto, y visita '}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">tu sitio</a>
          {' para ver el resultado.'}
        </li>
        <li>
          {'Ve a '}
          <a
            href="https://dashboard.stripe.com/test/apikeys"
            rel="noopener noreferrer"
            target="_blank"
          >
            Stripe para obtener tus API Keys de prueba
          </a>
          {
            '. Crea una cuenta si hace falta, cópialas en tus variables de entorno y reinicia el servidor. Consulta el '
          }
          <a
            href="https://github.com/payloadcms/payload/blob/3.x/templates/ecommerce/README.md#stripe"
            rel="noopener noreferrer"
            target="_blank"
          >
            README
          </a>
          {' para más detalles.'}
        </li>
        <li>
          {'Modifica tus '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            collections
          </a>
          {' y agrega más '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            campos
          </a>
          {' según lo necesites. Si eres nuevo en Payload, te recomendamos la '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            documentación de inicio
          </a>
          {'.'}
        </li>
      </ul>
      {'Tip: este bloque es un '}
      <a
        href="https://payloadcms.com/docs/admin/components#base-component-overrides"
        rel="noopener noreferrer"
        target="_blank"
      >
        componente personalizado
      </a>
      {', puedes quitarlo cuando quieras desde tu <strong>payload.config</strong>.'}
    </div>
  )
}