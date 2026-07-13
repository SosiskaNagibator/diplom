export const QuantityButton = ({ onClick, children, disabled = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-8 h-8 rounded-full border border-gray-300 hover:border-amber-500 hover:text-amber-500 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);