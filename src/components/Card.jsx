/**
 * Card component - container with border and shadow
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.title]
 * @param {string} [props.className]
 */
const Card = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
