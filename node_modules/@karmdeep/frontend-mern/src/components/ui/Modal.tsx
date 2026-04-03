import { X } from 'lucide-react';
import { useEffect } from 'react';
import clsx from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className={clsx('relative card !p-0 overflow-hidden shadow-2xl z-50', sizeClasses[size])}>
          <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--surface)]">
            <h3 className="text-xl font-extrabold text-[var(--text)]">{title}</h3>
            <button onClick={onClose} className="p-2 rounded-xl text-[var(--muted)] hover:bg-[var(--surface-2)] shadow-[var(--shadow-inset)] hover:text-[var(--a2)] transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
