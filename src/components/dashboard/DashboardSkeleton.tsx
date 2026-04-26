import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-10 w-full animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 border-b pb-4">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-5 w-[450px]" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={`kpi-skel-${i}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 h-[350px]">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[250px] rounded-md" />
          </CardContent>
        </Card>
        <Card className="h-[350px]">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[250px]">
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
