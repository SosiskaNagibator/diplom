import PizzaSkeleton from '../PizzaSkeleton';

const WishlistSkeleton = () => {
  return (
    <div className="fade-in">
      <div className="h-10 bg-gray-300 rounded w-48 mb-6 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PizzaSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

export default WishlistSkeleton;