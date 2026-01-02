import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import NotificationModal, { NotificationType } from '../components/ui/NotificationModal';

interface NotificationState {
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
}

interface NotificationContextType {
    notify: {
        success: (message: string, title?: string) => void;
        error: (message: string, title?: string) => void;
        warn: (message: string, title?: string) => void;
        info: (message: string, title?: string) => void;
    };
    closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<NotificationState>({
        isOpen: false,
        type: 'info',
        title: '',
        message: ''
    });

    const closeNotification = useCallback(() => {
        setState(prev => ({ ...prev, isOpen: false }));
    }, []);

    const show = useCallback((type: NotificationType, message: string, title?: string) => {
        const defaultTitles = {
            success: 'Success',
            error: 'Error Occurred',
            warn: 'Warning',
            info: 'Information'
        };

        setState({
            isOpen: true,
            type,
            message,
            title: title || defaultTitles[type]
        });
    }, []);

    const notify = {
        success: (message: string, title?: string) => show('success', message, title),
        error: (message: string, title?: string) => show('error', message, title),
        warn: (message: string, title?: string) => show('warn', message, title),
        info: (message: string, title?: string) => show('info', message, title),
    };

    return (
        <NotificationContext.Provider value={{ notify, closeNotification }}>
            {children}
            <NotificationModal
                isOpen={state.isOpen}
                onClose={closeNotification}
                type={state.type}
                title={state.title}
                message={state.message}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
