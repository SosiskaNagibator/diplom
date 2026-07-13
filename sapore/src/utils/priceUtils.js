export const getPriceWithSize = (basePrice, selectedSize) => {
  if (!selectedSize) return basePrice;
  return Math.round(basePrice * selectedSize.price_multiplier);
};