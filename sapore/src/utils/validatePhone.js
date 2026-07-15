import { parsePhoneNumberFromString, isValidPhoneNumber } from 'react-phone-number-input';

export const normalizePhone = (phone) => {
  if (!phone) return '';
  try {
    const parsed = parsePhoneNumberFromString(phone);
    if (parsed && parsed.isValid()) {
      return parsed.format('E.164');
    }
    return phone;
  } catch {
    return phone;
  }
};

export const isValidPhone = (phone) => {
  if (!phone) return false;
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
};

export const validateAndNormalizePhone = (phone) => {
  const normalized = normalizePhone(phone);
  const isValid = isValidPhone(normalized);
  return { normalized, isValid };
};