export const Card = ({ children, className = '', hover = false }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 ${hover ? 'hover:shadow-lg hover:-translate-y-1' : ''} ${className}`}>
    {children}
  </div>
);