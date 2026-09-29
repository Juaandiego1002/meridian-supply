import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function Loading() {
  return (
    <div className="container py-28 flex justify-center">
      <LoadingSpinner className="w-8 h-8" />
    </div>
  )
}