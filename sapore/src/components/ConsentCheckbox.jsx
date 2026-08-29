import { Link } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';

const ConsentCheckbox = ({
  type = 'personal',
  checked = false,
  onChange = () => {},
  className = '',
}) => {
  const texts = {
    personal: {
      label: 'Я даю согласие на обработку своих персональных данных в соответствии с ',
      linkText: 'Политикой обработки персональных данных',
      linkTo: '/privacy',
      required: true,
    },
    offer: {
      label: 'Я принимаю условия ',
      linkText: 'публичной оферты',
      linkTo: '/offer',
      required: true,
    },
  };

  const current = texts[type] || texts.personal;

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <label
        htmlFor={`consent-${type}`}
        className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer select-none group"
      >
        <input
          type="checkbox"
          id={`consent-${type}`}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={current.required}
          className="hidden"
        />
        <span
          className={`relative inline-flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-200 flex-shrink-0 mt-0.5
            ${checked
              ? 'bg-amber-500 border-amber-500'
              : 'bg-white border-gray-300 group-hover:border-amber-400'
            }
            focus-within:ring-0 focus-within:ring-offset-0 focus-within:outline-none
          `}
        >
          {checked && <FaCheck className="w-3 h-3 text-white animate-checkmark" />}
        </span>
        <span>
          {current.label}
          <Link
            to={current.linkTo}
            target="_blank"
            className="text-amber-600 hover:text-amber-800 hover:underline transition-colors duration-200"
          >
            {current.linkText}
          </Link>
          {current.required && <span className="text-red-500 ml-0.5">*</span>}
        </span>
      </label>
    </div>
  );
};

export default ConsentCheckbox;