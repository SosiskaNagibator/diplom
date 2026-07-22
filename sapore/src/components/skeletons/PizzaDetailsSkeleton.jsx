const PizzaDetailsSkeleton = () => {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-40 mb-6" />
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          <div className="flex justify-center">
            <div className="w-full max-h-96 bg-gray-200 rounded-xl" style={{ aspectRatio: '1/1' }} />
          </div>
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="h-8 bg-gray-300 rounded w-3/4" />
              <div className="h-6 bg-gray-300 rounded w-full mt-2" />
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-200 p-2 rounded-lg text-center h-16" />
                ))}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-300 rounded-full w-20" />
                ))}
              </div>
              <div className="flex items-center justify-between">
                <div className="h-8 bg-gray-300 rounded w-24" />
                <div className="h-12 bg-gray-300 rounded-full w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDetailsSkeleton;