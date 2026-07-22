import PizzaSkeleton from '../PizzaSkeleton';

const HomeSkeleton = () => {
  return (
    <>
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-xl mb-16 h-64 animate-pulse">
        <div className="absolute inset-0 bg-gray-200 opacity-50" />
        <div className="relative px-6 py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl mb-4">🍕</div>
            <div className="h-10 bg-gray-300 rounded w-3/4 mx-auto mb-4" />
            <div className="h-6 bg-gray-300 rounded w-1/2 mx-auto" />
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="h-12 bg-gray-300 rounded-full w-40" />
              <div className="h-12 bg-gray-300 rounded-full w-40" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100 animate-pulse">
              <div className="text-4xl mb-3">🧑‍🍳</div>
              <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto" />
              <div className="h-4 bg-gray-300 rounded w-full mt-2" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <PizzaSkeleton key={i} />
        ))}
      </div>
    </>
  );
};

export default HomeSkeleton;