'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteModal({ isOpen, title, description, isDeleting, onConfirm, onCancel }: DeleteModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md border border-border bg-[#0b2225] p-6 shadow-2xl sm:p-8">
        <button
          className="absolute right-4 top-4 text-text-tertiary transition-colors hover:text-text-primary disabled:cursor-not-allowed"
          onClick={onCancel}
          disabled={isDeleting}
          aria-label="Close dialog"
        >
          <X size={20} aria-hidden />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-danger/40 bg-danger/10">
            <AlertTriangle className="h-5 w-5 text-danger" aria-hidden />
          </div>
          <div>
            <h2 id="delete-modal-title" className="text-lg font-bold text-text-primary">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            ref={cancelRef}
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting}
            loading={isDeleting}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
