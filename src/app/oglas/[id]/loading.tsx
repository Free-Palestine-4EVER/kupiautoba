export default function ListingLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="container-custom pt-24 md:pt-28 pb-16">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-4 w-4 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-4 w-12 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-4 w-4 bg-[var(--muted)] rounded animate-pulse" />
          <div className="h-4 w-32 bg-[var(--muted)] rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery skeleton */}
            <div className="aspect-[16/9] bg-[var(--muted)] rounded-2xl animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-24 h-16 bg-[var(--muted)] rounded-xl animate-pulse flex-shrink-0" />
              ))}
            </div>

            {/* Title skeleton */}
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-[var(--muted)] rounded-lg animate-pulse" />
              <div className="h-4 w-1/2 bg-[var(--muted)] rounded animate-pulse" />
              <div className="h-10 w-40 bg-[var(--muted)] rounded-lg animate-pulse" />
            </div>

            {/* Specs skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                  <div className="h-3 w-12 bg-[var(--muted)] rounded animate-pulse mb-2" />
                  <div className="h-5 w-20 bg-[var(--muted)] rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--muted)] animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-[var(--muted)] rounded animate-pulse" />
                  <div className="h-3 w-20 bg-[var(--muted)] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-12 w-full bg-[var(--muted)] rounded-xl animate-pulse" />
              <div className="h-12 w-full bg-[var(--muted)] rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
