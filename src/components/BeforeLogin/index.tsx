import React from 'react'

export const BeforeLogin: React.FC = () => {
  return (
    <div>
      <p>
        <b>Administración de Meridian Supply</b>
        {' Aquí inician sesión los administradores para gestionar la tienda. Los clientes usan '}
        <a href={`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/login`}>el login del sitio</a>
        {' para acceder a su cuenta, historial de pedidos y más.'}
      </p>
    </div>
  )
}