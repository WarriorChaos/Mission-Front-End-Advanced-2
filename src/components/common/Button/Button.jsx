import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false,
  type = 'button',
  className = ''
}) {
  const baseClass = `button button--${variant} button--${size}`;
  const widthClass = fullWidth ? 'button--full-width' : '';
  const finalClass = `${baseClass} ${widthClass} ${className}`.trim();

  return (
    <button
      className={finalClass}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
}
