import { AuthProvider } from '@/providers/Auth'
import { EcommerceProvider } from '@payloadcms/plugin-ecommerce/client/react'
import type { Currency } from '@payloadcms/plugin-ecommerce/types'
import { stripeAdapterClient } from '@payloadcms/plugin-ecommerce/payments/stripe'
import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { SonnerProvider } from '@/providers/Sonner'
import { isStripeClientEnabled } from '@/utilities/isStripeEnabled'

const MXN: Currency = {
  code: 'MXN',
  decimals: 2,
  label: 'Peso Mexicano',
  symbol: '$',
}

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HeaderThemeProvider>
          <SonnerProvider />
          <EcommerceProvider
            enableVariants={true}
            currenciesConfig={{
              defaultCurrency: 'MXN',
              supportedCurrencies: [MXN],
            }}
            api={{
              cartsFetchQuery: {
                depth: 2,
                populate: {
                  products: {
                    slug: true,
                    title: true,
                    gallery: true,
                    inventory: true,
                    priceInMXN: true,
                  },
                  variants: {
                    title: true,
                    inventory: true,
                    priceInMXN: true,
                  },
                },
              },
            }}
            paymentMethods={
              isStripeClientEnabled()
                ? [
                    stripeAdapterClient({
                      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!.trim(),
                    }),
                  ]
                : []
            }
          >
            {children}
          </EcommerceProvider>
        </HeaderThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
