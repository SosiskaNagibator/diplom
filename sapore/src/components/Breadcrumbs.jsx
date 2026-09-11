import { Link } from 'react-router-dom';
import { FaChevronRight } from 'react-icons/fa';

const Breadcrumbs = ({ items }) => {
  return (
    <nav className="text-sm text-gray-500 mb-4" aria-label="breadcrumbs">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {item.to ? (
              <Link to={item.to} className="hover:text-amber-600 transition">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700 font-medium">{item.label}</span>
            )}
            {i < items.length - 1 && <FaChevronRight className="text-xs text-gray-400" />}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;