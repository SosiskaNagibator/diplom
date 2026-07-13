const PizzaSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="flex justify-between items-center mt-3">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-9 bg-gray-200 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
};

export default PizzaSkeleton;