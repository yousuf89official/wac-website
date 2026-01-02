import React, { useEffect } from 'react';
import NeonButton from './NeonButton';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warn' | 'info';

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    type?: NotificationType;
    children?: React.ReactNode;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    children
}) => {
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

    const icons = {
        success: <CheckCircle className="w-12 h-12 text-[#00f0ff]" />,
        error: <XCircle className="w-12 h-12 text-[#ff006e]" />,
        warn: <AlertTriangle className="w-12 h-12 text-yellow-400" />,
        info: <Info className="w-12 h-12 text-blue-400" />
    };

    const colors = {
        success: 'border-[#00f0ff]',
        error: 'border-[#ff006e]',
        warn: 'border-yellow-400',
        info: 'border-blue-400'
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-[#0a0a0a] border-2 ${colors[type]} rounded-2xl w-full max-w-sm p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative transform transition-all animate-in zoom-in-95 duration-200`}
            >
                <div className="flex flex-col items-center text-center space-y-4">
                    {children ? (
                        <>
                            <h3 className="text-xl font-black uppercase tracking-wider text-white mb-2">
                                {title}
                            </h3>
                            {children}
                        </>
                    ) : (
                        <>
                            <div className="mb-2 animate-bounce">
                                {icons[type]}
                            </div>

                            <h3 className="text-xl font-black uppercase tracking-wider text-white">
                                {title}
                            </h3>

                            <p className="text-gray-400 text-sm leading-relaxed">
                                {message}
                            </p>

                            <div className="pt-4 w-full">
                                <NeonButton
                                    variant="outline"
                                    className="w-full justify-center"
                                    onClick={onClose}
                                >
                                    Acknowledge
                                </NeonButton>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
