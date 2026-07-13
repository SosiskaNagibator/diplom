import { parsePhoneNumberFromString, isValidPhoneNumber } from 'react-phone-number-input';

// Нормализация: приводит к международному формату (например, +79991234567)
export const normalizePhone = (phone) => {
  if (!phone) return '';
  try {
    const parsed = parsePhoneNumberFromString(phone);
    if (parsed && parsed.isValid()) {
      return parsed.format('E.164'); // +79991234567
    }
    return phone;
  } catch {
    return phone;
  }
};

// Проверка валидности номера (использует библиотеку)
export const isValidPhone = (phone) => {
  if (!phone) return false;
  try {
    return isValidPhoneNumber(phone);
  } catch {
    return false;
  }
};

// Полная валидация с нормализацией
export const validateAndNormalizePhone = (phone) => {
  const normalized = normalizePhone(phone);
  const isValid = isValidPhone(normalized);
  return { normalized, isValid };
};