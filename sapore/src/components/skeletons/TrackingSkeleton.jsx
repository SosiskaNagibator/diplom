const TrackingSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="space-y-2">
            {[1, 2].map((j) => (
              <div key={j} className="flex justify-between items-center py-1">
                <div className="h-5 bg-gray-200 rounded w-40" />
                <div className="h-5 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="flex justify-between">
              {['Принят', 'Готовится', 'В пути', 'Доставлен'].map((_, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded w-10 mt-1" />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 h-4 bg-gray-200 rounded w-48" />
        </div>
      ))}
    </div>
  );
};

export default TrackingSkeleton;