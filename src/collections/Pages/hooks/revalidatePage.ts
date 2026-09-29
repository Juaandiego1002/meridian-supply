import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'

// revalidatePath lanza "static generation store missing" cuando no hay servidor
// de Next (por ejemplo, al sembrar la base desde la CLI o desde un contenedor).
// Es esperado: no hay cache que invalidar, y el error no debe tumbar el seed.
const safeRevalidatePath = (path: string) => {
  try {
    revalidatePath(path)
  } catch (_err) {
    // Sin servidor de Next no hay cache que revalidar. Es normal fuera de la app.
  }
}

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`

      payload.logger.info(`Revalidating page at path: ${path}`)

      safeRevalidatePath(path)
      //revalidateTag('pages-sitemap', 'max')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`

      payload.logger.info(`Revalidating old page at path: ${oldPath}`)

      safeRevalidatePath(oldPath)
      //revalidateTag('pages-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path = doc?.slug === 'home' ? '/' : `/${doc?.slug}`
    safeRevalidatePath(path)
    //revalidateTag('pages-sitemap', 'max')
  }

  return doc
}
