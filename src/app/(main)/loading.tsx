export default function Loading() {
  return (
    <div className="space-y-12 pb-8 pt-4 animate-pulse overflow-hidden">

      {/* Hero skeleton */}
      <div className="-mx-4 md:mx-0 h-52 md:rounded-2xl bg-gray-200 dark:bg-white/5" />

      {/* Sellers skeleton */}
      <div>
        <div className="h-5 w-44 rounded-full bg-gray-200 dark:bg-white/5 mb-4" />
        <div className="-mx-4 px-4 flex gap-3 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-[130px] h-[170px] rounded-2xl bg-gray-200 dark:bg-white/5 flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Turbinados skeleton */}
      <div>
        <div className="h-5 w-52 rounded-full bg-gray-200 dark:bg-white/5 mb-2" />
        <div className="h-3.5 w-64 rounded-full bg-gray-200 dark:bg-white/5 mb-5" />
        <div className="bg-gray-100 dark:bg-white/3 -mx-4 px-4 py-6 rounded-3xl">
          <div className="-mx-4 px-4 flex gap-3 overflow-hidden sm:hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[155px] h-[220px] rounded-xl bg-gray-200 dark:bg-white/5 flex-shrink-0" />
            ))}
          </div>
          <div className="hidden sm:grid sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[220px] rounded-xl bg-gray-200 dark:bg-white/5" />
            ))}
          </div>
        </div>
      </div>

      {/* Megafonados skeleton */}
      <div>
        <div className="h-5 w-36 rounded-full bg-gray-200 dark:bg-white/5 mb-2" />
        <div className="h-3.5 w-56 rounded-full bg-gray-200 dark:bg-white/5 mb-5" />
        <div className="-mx-4 px-4 flex gap-3 overflow-hidden sm:hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[155px] h-[220px] rounded-xl bg-gray-200 dark:bg-white/5 flex-shrink-0" />
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[220px] rounded-xl bg-gray-200 dark:bg-white/5" />
          ))}
        </div>
      </div>

      {/* Feed principal skeleton */}
      <div className="pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="h-5 w-40 rounded-full bg-gray-200 dark:bg-white/5 mb-4" />
        <div className="h-8 w-full rounded-full bg-gray-100 dark:bg-white/5 mb-5" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[240px] rounded-xl bg-gray-200 dark:bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  )
}
