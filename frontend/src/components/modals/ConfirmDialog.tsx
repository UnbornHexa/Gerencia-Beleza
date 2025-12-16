import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar ação',
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0">
        <div className="p-6 pb-4">
          <DialogClose onClose={onClose} />
          <div className="flex gap-4">
            {/* Ícone de alerta destacado */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-600" aria-hidden="true" />
            </div>
            
            <div className="flex-1 pt-0.5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                {title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 rounded-b-lg gap-3 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto min-w-[100px]"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            className="w-full sm:w-auto min-w-[100px]"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
