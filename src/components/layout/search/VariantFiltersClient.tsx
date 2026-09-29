'use client'

import { Button } from '@/components/ui/button'
import { VariantOption, VariantType } from '@/payload-types'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import clsx from 'clsx'

type Props = {
  variantTypes: VariantType[]
}

// Los links se construyen con los searchParams actuales de la URL, así que
// este componente debe ser "use client" (usa useSearchParams). Las variantes
// funcionan con <Link> y no necesitan JavaScript adicional.
export const VariantFiltersClient: React.FC<Props> = ({ variantTypes }) => {
  const searchParams = useSearchParams()

  const buildURL = (param: string, value: string) => {
    const params = new URLSearchParams()

    searchParams.forEach((val, key) => {
      if (key === param) return
      if (val) params.set(key, val)
    })

    if (value !== 'todas') {
      params.set(param, value)
    }

    const qs = params.toString()
    return `/shop${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="flex flex-col gap-4">
      {variantTypes.map((type) => {
        if (!type || typeof type !== 'object') return <></>

        const options = (type.options?.docs || []).filter(
          (option): option is VariantOption => typeof option === 'object' && option !== null,
        )

        if (!options.length) return <></>

        const activeOption = searchParams.get(type.name) || 'todas'

        return (
          <div key={type.id}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {type.label}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                size={'sm'}
                key="todas"
                variant={activeOption === 'todas' ? 'default' : 'ghost'}
                className={clsx('h-8', activeOption === 'todas' && 'pointer-events-none')}
              >
                <Link href={buildURL(type.name, 'todas')}>Todas</Link>
              </Button>
              {options.map((option) => {
                const label = typeof option.label === 'string' ? option.label : option.value
                const isActive = activeOption === option.value

                return (
                  <Button
                    asChild
                    size={'sm'}
                    key={option.id}
                    variant={isActive ? 'default' : 'ghost'}
                    className={clsx('h-8', isActive && 'pointer-events-none')}
                  >
                    <Link href={buildURL(type.name, option.value)}>{label}</Link>
                  </Button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}