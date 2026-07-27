import * as React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidthClassName?: string;
  closeOnOutsideClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidthClassName = 'max-w-md',
  closeOnOutsideClick = true
}) => {
  // Prevent body scrolling when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Animated Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnOutsideClick ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            id="modal-backdrop"
          />

          {/* Animated Card Body */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className={`relative w-full ${maxWidthClassName} rounded-2xl bg-white shadow-2xl border border-slate-100/80 p-6 sm:p-8 overflow-hidden z-10`}
            id="modal-content"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              {title ? (
                <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  {title}
                </h3>
              ) : (
                <div />
              )}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Modal Content */}
            <div className="text-slate-600 text-sm">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
