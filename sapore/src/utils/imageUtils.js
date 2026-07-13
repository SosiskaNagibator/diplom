import { STATIC_BASE } from '../constants/api';

export const getImageUrl = (image) => {
  if (!image) return '';
  // Если это уже полный URL (http:// или https://), возвращаем как есть
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  // Иначе собираем из базового пути + имя файла
  return `${STATIC_BASE}${image}`;
};