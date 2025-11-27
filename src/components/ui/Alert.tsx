import { ReactNode, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success:
          'border-green-50 text-green-800 bg-green-50 [&>svg]:text-green-600',
        warning:
          'border-yellow-50 text-yellow-800 bg-yellow-50 [&>svg]:text-yellow-600',
        error:
          'border-red-50 text-red-800 bg-red-50 [&>svg]:text-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const Alert = ({
  className,
  variant,
  onClose,
  autoClose = false,
  autoCloseDelay = 5000,
  children,
  ...props
}: AlertProps) => {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const getIcon = () => {
    switch (variant) {
      case 'success':
      case 'warning':
      case 'error':
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {variant === 'success' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : variant === 'error' ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            )}
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      role="alert"
      className={alertVariants({ variant, className })}
      {...props}
    >
      {getIcon()}
      <div className="flex items-start justify-between">
        <div className="flex-1">{children}</div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const AlertTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h5
    className={`mb-1 font-medium leading-none tracking-tight ${className}`}
    {...props}
  />
);

const AlertDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <div
    className={`text-sm [&_p]:leading-relaxed ${className}`}
    {...props}
  />
);

export { Alert, AlertTitle, AlertDescription };