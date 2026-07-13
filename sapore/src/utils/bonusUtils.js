export const getLevel = (points) => {
  if (points >= 1000) return { name: 'Золотой', emoji: '👑', color: 'text-yellow-500', bg: 'bg-yellow-100' };
  if (points >= 500) return { name: 'Серебряный', emoji: '🥈', color: 'text-gray-400', bg: 'bg-gray-100' };
  if (points >= 100) return { name: 'Бронзовый', emoji: '🥉', color: 'text-amber-700', bg: 'bg-amber-100' };
  return { name: 'Новичок', emoji: '🌱', color: 'text-green-500', bg: 'bg-green-100' };
};

export const getNextLevel = (points) => {
  if (points < 100) return { name: 'Бронзовый', need: 100 - points };
  if (points < 500) return { name: 'Серебряный', need: 500 - points };
  if (points < 1000) return { name: 'Золотой', need: 1000 - points };
  return null;
};