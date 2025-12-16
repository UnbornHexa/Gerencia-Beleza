import * as React from 'react';
import { X, CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  onClose: () => void;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = 'info', onClose }, ref) => {
    const icons = {
      success: CheckCircle2,
      error: XCircle,
      info: Info,
      warning: AlertTriangle,
    };

    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };

    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-all',
          colors[variant]
        )}
        role="alert"
      >
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          {title && <div className="font-semibold text-sm">{title}</div>}
          {description && (
            <div className="text-sm mt-1 opacity-90">{description}</div>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 rounded-md p-1 hover:bg-black/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
Toast.displayName = 'Toast';

export { Toast };
