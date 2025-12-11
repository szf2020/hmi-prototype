import { classNames } from '../../utils/classNames';
import './Button.css';

/**
 * Button Component
 * 
 * A versatile button component with multiple variants and sizes.
 * Designed for automotive HMI interfaces with touch-optimized sizing.
 * 
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'tertiary' | 'danger'} props.variant - Button visual variant
 * @param {'regular' | 'large'} props.size - Button size (regular = 64px height, large = 96px height)
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {boolean} props.loading - Whether button is in loading state
 * @param {ReactNode} props.children - Button content
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {ReactNode} props.icon - Optional icon to display
 * @param {'left' | 'right'} props.iconPosition - Position of icon relative to text
 */
const Button = ({
  variant = 'primary',
  size = 'regular',
  disabled = false,
  loading = false,
  children,
  onClick,
  className,
  type = 'button',
  icon,
  iconPosition = 'left',
  ...rest
}) => {
  const buttonClass = classNames(
    'ds-button',
    `ds-button--${variant}`,
    `ds-button--${size}`,
    {
      'ds-button--disabled': disabled,
      'ds-button--loading': loading,
      'ds-button--icon-only': icon && !children,
    },
    className
  );

  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      type={type}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <span className="ds-button__spinner" aria-hidden="true">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle
              className="ds-button__spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="3"
            />
          </svg>
        </span>
      )}
      {!loading && (
        <>
          {icon && iconPosition === 'left' && (
            <span className="ds-button__icon ds-button__icon--left">{icon}</span>
          )}
          {children && <span className="ds-button__text">{children}</span>}
          {icon && iconPosition === 'right' && (
            <span className="ds-button__icon ds-button__icon--right">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;

