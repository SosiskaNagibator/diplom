import toast from 'react-hot-toast';

export const copyToClipboard = (text, successMessage = 'Скопировано!') => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(successMessage))
      .catch(() => fallbackCopy(text, successMessage));
  } else {
    fallbackCopy(text, successMessage);
  }
};

const fallbackCopy = (text, successMessage) => {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    toast.success(successMessage);
  } catch (err) {
    toast.error('Не удалось скопировать');
  }
  document.body.removeChild(textarea);
};