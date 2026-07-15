import { STATIC_BASE } from '../constants/api';

export const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  return `${STATIC_BASE}${image}`;
};