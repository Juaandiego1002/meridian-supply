import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import React from 'react'

import { CheckoutPage } from '@/components/checkout/CheckoutPage'
import { isStripeClientEnabled } from '@/utilities/isStripeEnabled'

// Force dynamic rendering to avoid build-time MongoDB connection
export const dynamic = 'force-dynamic'

export default function Checkout() {
  const stripeEnabled = isStripeClientEnabled()

  return (
    <div className="container min-h-[90vh] flex flex-col gap-8 py-16">
      <h1 className="sr-only">Checkout</h1>

      {!stripeEnabled ? (
        <div className="mx-auto max-w-xl rounded-lg border border-muted p-8 text-center">
          <h2 className="mb-3 text-xl font-semibold">Pagos no configurados</h2>
          <p className="text-muted-foreground text-sm">
            Esta tienda todavía no tiene un método de pago activo. El catálogo y el carrito
            funcionan, pero no se pueden completar pedidos. Añade las claves de Stripe al
            entorno para activarlo.
          </p>
        </div>
      ) : (
        <CheckoutPage />
      )}
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Checkout.',
  openGraph: mergeOpenGraph({
    title: 'Checkout',
    url: '/checkout',
  }),
  title: 'Checkout',
}
