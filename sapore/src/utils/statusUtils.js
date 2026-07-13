import { ORDER_STATUSES } from '../constants/statuses';

export const getStatusIndex = (status) => {
  return ORDER_STATUSES.indexOf(status);
};

export const getBadgeVariant = (status) => {
  switch(status) {
    case 'Принят': return 'warning';
    case 'Готовится': return 'primary';
    case 'В пути': return 'info';
    case 'Доставлен': return 'success';
    default: return 'default';
  }
};