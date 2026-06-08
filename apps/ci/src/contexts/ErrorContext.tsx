'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ErrorAlertModal } from '../components/ui/ErrorAlertModal';

interface ErrorContextType {
    showError: (title: string, message: string, onRetry?: () => void) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Static holder for non-hook access (like in api.ts)
let staticShowError: ((title: string, message: string, onRetry?: () => void) => void) | null = null;

export const triggerGlobalError = (title: string, message: string, onRetry?: () => void) => {
    if (staticShowError) {
        staticShowError(title, message, onRetry);
    } else {
        console.error('Global Error Handler not initialized:', title, message);
    }
};

export function ErrorProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [errorDetails, setErrorDetails] = useState({
        title: '',
        message: '',
        onRetry: undefined as (() => void) | undefined,
    });

    const showError = useCallback((title: string, message: string, onRetry?: () => void) => {
        setErrorDetails({ title, message, onRetry });
        setIsOpen(true);
    }, []);

    // Expose to static holder safely
    React.useEffect(() => {
        staticShowError = showError;
        return () => {
            // Only clear if it's still us (optional safety, but simple null is fine for single provider)
            staticShowError = null;
        };
    }, [showError]);

    const handleClose = () => setIsOpen(false);

    return (
        <ErrorContext.Provider value={{ showError }}>
            {children}
            <ErrorAlertModal
                isOpen={isOpen}
                onClose={handleClose}
                title={errorDetails.title}
                message={errorDetails.message}
                onRetry={errorDetails.onRetry}
            />
        </ErrorContext.Provider>
    );
}

export function useError() {
    const context = useContext(ErrorContext);
    if (context === undefined) {
        throw new Error('useError must be used within an ErrorProvider');
    }
    return context;
}
