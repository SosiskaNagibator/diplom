const ProfileSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="h-10 bg-gray-300 rounded w-48 mb-6" />
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/30" />
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-32" />
              <div className="h-6 bg-gray-200 rounded w-24 mt-2" />
              <div className="h-5 bg-gray-200 rounded w-40 mt-1" />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">🎁 Бонусный баланс</span>
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5" />
          </div>
          <div className="border-t border-gray-100 pt-4">
            <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
          <div className="h-12 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;