import { STATIC_BASE } from '../constants/api';

export const getImageUrl = (image, size = '') => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  const prefix = size ? size + '_' : '';
  return `${STATIC_BASE}${prefix}${image}`;
};