import { FaPizzaSlice, FaUtensils, FaRocket, FaLeaf } from 'react-icons/fa';

const HomeSkeleton = () => {
  return (
    <>
      <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl overflow-hidden shadow-xl mb-16 h-80 animate-pulse">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="20" cy="20" r="30" fill="#f59e0b" />
            <circle cx="80" cy="80" r="40" fill="#f59e0b" />
            <circle cx="60" cy="10" r="20" fill="#f59e0b" />
          </svg>
        </div>
        <div className="relative px-6 py-12 sm:py-16 md:py-20 text-center flex flex-col items-center justify-center h-full">
          <div className="mb-4 text-7xl text-amber-600/50">
            <FaPizzaSlice className="inline-block" />
          </div>
          <div className="w-3/4 max-w-md h-12 bg-gray-200 rounded-lg mx-auto" />
          <div className="w-1/2 max-w-sm h-6 bg-gray-200 rounded-lg mx-auto mt-4" />
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <div className="w-40 h-12 bg-gray-200 rounded-full" />
            <div className="w-40 h-12 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>

      <div className="mb-16">
        <div className="w-48 h-8 bg-gray-200 rounded-lg mx-auto mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: <FaUtensils className="text-3xl" />, label: 'Итальянские рецепты' },
            { icon: <FaRocket className="text-3xl" />, label: 'Быстрая доставка' },
            { icon: <FaLeaf className="text-3xl" />, label: 'Свежие продукты' },
          ].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 text-gray-300">
                {_.icon}
              </div>
              <div className="w-32 h-5 bg-gray-200 rounded mx-auto" />
              <div className="w-48 h-4 bg-gray-200 rounded mx-auto mt-2" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="w-32 h-8 bg-gray-200 rounded" />
          <div className="w-24 h-5 bg-gray-200 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="w-full h-52 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-3/4 h-5 bg-gray-200 rounded" />
                  <div className="w-6 h-6 bg-gray-200 rounded-full" />
                </div>
                <div className="w-full h-4 bg-gray-200 rounded" />
                <div className="w-2/3 h-4 bg-gray-200 rounded" />
                <div className="flex gap-1 mt-3">
                  <div className="w-12 h-7 bg-gray-200 rounded-full" />
                  <div className="w-12 h-7 bg-gray-200 rounded-full" />
                  <div className="w-12 h-7 bg-gray-200 rounded-full" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="w-16 h-6 bg-gray-200 rounded" />
                  <div className="w-24 h-9 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HomeSkeleton;