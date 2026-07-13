export const Input = ({ className = '', label, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all duration-200 ${className}`}
      {...props}
    />
  </div>
);