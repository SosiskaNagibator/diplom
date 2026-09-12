const ConstructorSkeleton = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="h-9 bg-gray-200 rounded w-72 mb-8 animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8">
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="aspect-square rounded-xl bg-gray-200 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-40 mb-4" />
            <div className="flex justify-between items-baseline mb-4 pt-4 border-t border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-8 bg-gray-200 rounded w-24" />
            </div>
            <div className="h-12 bg-gray-200 rounded-full w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
          </div>
        </div>

        <div className="space-y-6 pb-24 lg:pb-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="flex items-baseline justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col">
                  <div className="aspect-square bg-gray-200 rounded-t-xl" />
                  <div className="p-2 bg-gray-100 rounded-b-xl">
                    <div className="h-3 bg-gray-200 rounded w-4/5 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructorSkeleton;