import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Forms Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Traveler Details Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lead Traveler */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                  <Skeleton className="h-4 w-full" />

                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Travelers Skeleton */}
                <div className="space-y-4 pt-6 border-t">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>

                {/* Special Requests Skeleton */}
                <div className="space-y-4 pt-6 border-t">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <div className="flex items-center justify-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </CardContent>
            </Card>

            {/* Terms Skeleton */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary Skeleton */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Skeleton */}
                <Skeleton className="aspect-video w-full rounded-lg" />

                {/* Title and Location */}
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>

                <Skeleton className="h-px w-full" />

                {/* Dates */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-48" />
                </div>

                {/* Guests */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-40" />
                </div>

                <Skeleton className="h-px w-full" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />

                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}

                  <Skeleton className="h-px w-full" />

                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pay Button Skeleton */}
            <div className="mt-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
