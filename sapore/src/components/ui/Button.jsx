export const Button = ({ children, variant = 'primary', type = 'button', className = '', disabled = false, onClick, ...props }) => {
  const base = 'px-6 py-3 rounded-full font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-amber-200',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    outline: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
  };
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};