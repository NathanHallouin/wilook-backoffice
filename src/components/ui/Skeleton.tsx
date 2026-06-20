import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

/** Shimmer placeholder block. Compose to build loading states. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton rounded-md', className)} />
}

/** Product/look card placeholder used in grids while data loads. */
export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <Skeleton className="aspect-square rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  )
}

interface CardGridSkeletonProps {
  count?: number
}

export function CardGridSkeleton({ count = 10 }: CardGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
