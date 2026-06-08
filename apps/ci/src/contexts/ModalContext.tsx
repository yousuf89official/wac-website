'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { GlobalDialog } from '@/components/ui/GlobalDialog';

interface AlertOptions {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    onClose?: () => void;
}

interface ConfirmOptions {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
}

interface ModalContextType {
    openModal: (content: ReactNode, options?: { title?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => void;
    closeModal: () => void;
    isOpen: boolean;
    showAlert: (options: AlertOptions) => void;
    showConfirm: (options: ConfirmOptions) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);
    const [options, setOptions] = useState<{ title?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }>({});

    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const openModal = useCallback((content: ReactNode, opts?: { title?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setContent(content);
        setOptions(opts || {});
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            // Small delay to clear content after animation, prevents flickering
            // Only clear if still closed to handle race where it opened again quickly
            setContent((prev) => prev); // Actually we should check isOpen, but state in timeout is stale? 
            // Better to just blindly clear if this timeout runs, because if openModal was called, 
            // it would have cleared this timeout.
            setContent(null);
        }, 300);
    }, []);

    const showAlert = useCallback(({ title, message, type = 'info', onClose }: AlertOptions) => {
        openModal(
            <GlobalDialog
                title={title}
                message={message}
                type={type}
                mode="alert"
                onConfirm={() => {
                    if (onClose) onClose();
                    closeModal();
                }}
                confirmText="OK"
            />,
            { size: 'sm' }
        );
    }, [openModal, closeModal]);

    const showConfirm = useCallback(({ title, message, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }: ConfirmOptions) => {
        openModal(
            <GlobalDialog
                title={title}
                message={message}
                type={type}
                mode="confirm"
                confirmText={confirmText}
                cancelText={cancelText}
                onConfirm={() => {
                    onConfirm();
                    closeModal();
                }}
                onCancel={() => {
                    if (onCancel) onCancel();
                    closeModal();
                }}
            />,
            { size: 'sm' }
        );
    }, [openModal, closeModal]);

    const maxWidthClass = {
        sm: 'sm:max-w-[425px]',
        md: 'sm:max-w-[600px]',
        lg: 'sm:max-w-[800px]',
        xl: 'sm:max-w-[1000px]',
    }[options.size || 'md'];

    return (
        <ModalContext.Provider value={{ openModal, closeModal, isOpen, showAlert, showConfirm }}>
            {children}
            <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
                <DialogContent className={`bg-[#0a0f1a] border-white/[0.08] text-white overflow-y-auto max-h-[90vh] ${maxWidthClass}`}>
                    {content}
                </DialogContent>
            </Dialog>
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
