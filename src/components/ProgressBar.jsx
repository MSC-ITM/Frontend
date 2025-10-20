/**
 * ProgressBar component
 * @param {Object} props
 * @param {number} props.value - Progress value (0-100)
 * @param {string} [props.className]
 * @param {string} [props.label]
 */
const ProgressBar = ({ value, className = '', label }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-cyan-400">{label}</span>
          <span className="text-sm font-medium text-cyan-100">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className="w-full bg-black/40 rounded-full h-3 border border-cyan-500/20">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/50"
          style={{ width: `${clampedValue}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
