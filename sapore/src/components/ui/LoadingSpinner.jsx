import { FaPizzaSlice } from 'react-icons/fa';

export const LoadingSpinner = ({ text = 'Загрузка...' }) => (
  <div className="text-center py-12">
    <div className="inline-block animate-spin text-4xl">
      <FaPizzaSlice className="text-amber-500" />
    </div>
    <div className="text-gray-500 mt-4">{text}</div>
  </div>
);