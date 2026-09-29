export type SortFilterItem = {
  reverse: boolean
  slug: null | string
  title: string
}

export const defaultSort: SortFilterItem = {
  slug: null,
  reverse: false,
  title: 'Alfabético A-Z',
}

export const sorting: SortFilterItem[] = [
  defaultSort,
  { slug: '-createdAt', reverse: true, title: 'Novedades' },
  { slug: 'priceInMXN', reverse: false, title: 'Precio: menor a mayor' }, // asc
  { slug: '-priceInMXN', reverse: true, title: 'Precio: mayor a menor' },
]
