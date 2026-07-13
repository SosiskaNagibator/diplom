export const IconButton = ({ onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-gray-400 hover:text-red-500 transition-all duration-200 text-xl hover:scale-125 active:scale-90 ${className}`}
  >
    {children}
  </button>
);