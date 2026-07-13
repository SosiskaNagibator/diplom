import { QuantityButton, IconButton } from './ui';

export const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const { id, image, name, description, price, quantity } = item;

  const handleIncrement = () => onUpdateQuantity(id, quantity + 1);
  const handleDecrement = () => onUpdateQuantity(id, quantity - 1);

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <img src={image} alt={name} className="w-20 h-20 object-cover rounded-lg" />
      <div className="flex-1 min-w-[120px]">
        <div className="font-semibold text-gray-800">{name}</div>
        {description && <div className="text-xs text-gray-500 mt-0.5">{description}</div>}
        <div className="text-sm text-amber-600 font-medium mt-1">{price} ₽</div>
      </div>
      <div className="flex items-center gap-2">
        <QuantityButton onClick={handleDecrement}>−</QuantityButton>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <QuantityButton onClick={handleIncrement}>+</QuantityButton>
      </div>
      <div className="text-amber-600 font-bold min-w-[70px] text-right">
        {price * quantity} ₽
      </div>
      <IconButton onClick={() => onRemove(id)}>✕</IconButton>
    </div>
  );
};