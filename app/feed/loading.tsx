import CatCamperLoader from '@/components/CatCamperLoader'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <CatCamperLoader message="Loading your feed..." />
    </div>
  )
}
