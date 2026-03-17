export default function OglasiLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header skeleton */}
      <div className="bg-navy-500">
        <div className="container-custom py-8">
          <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-white/10 rounded-lg animate-pulse mt-2" />
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-[var(--muted)] rounded animate-pulse" />
                  <div className="h-10 w-full bg-[var(--muted)] rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          </aside>

          {/* Grid skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-12 w-full bg-[var(--muted)] rounded-xl animate-pulse mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-[var(--muted)] animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 w-3/4 bg-[var(--muted)] rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-[var(--muted)] rounded animate-pulse" />
                    <div className="h-6 w-1/3 bg-[var(--muted)] rounded animate-pulse mt-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
