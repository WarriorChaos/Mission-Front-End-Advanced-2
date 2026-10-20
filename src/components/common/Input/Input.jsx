import './Input.css';

export default function Input({
  label,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  name,
  required = false,
  error = '',
  disabled = false,
  className = ''
}) {
  return (
    <div className={`input-field ${error ? 'input-field--error' : ''} ${className}`.trim()}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        disabled={disabled}
        className="input-control"
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
