export const LoadingSpinner = ({ text = 'Загрузка...' }) => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin text-4xl">🍕</div>
    <div className="text-gray-500 mt-4">{text}</div>
  </div>
);