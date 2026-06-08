import {
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './dialog';
import { Button } from './button';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists, typical in shadcn

interface GlobalDialogProps {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    mode?: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
}

export function GlobalDialog({
    title,
    message,
    type = 'info',
    mode = 'alert',
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = 'Cancel',
}: GlobalDialogProps) {
    const icons = {
        info: <Info className="h-6 w-6 text-blue-500" />,
        success: <CheckCircle className="h-6 w-6 text-green-500" />,
        warning: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
        error: <AlertTriangle className="h-6 w-6 text-red-500" />, // Or XCircle
    };

    const iconBg = {
        info: 'bg-blue-500/10 border-blue-500/20',
        success: 'bg-green-500/10 border-green-500/20',
        warning: 'bg-yellow-500/10 border-yellow-500/20',
        error: 'bg-red-500/10 border-red-500/20',
    };

    const confirmButtonColors = {
        info: 'bg-blue-600 hover:bg-blue-700',
        success: 'bg-green-600 hover:bg-green-700',
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        error: 'bg-red-600 hover:bg-red-700',
    };

    return (
        <div className="w-full">
            <DialogHeader>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full border ${iconBg[type]}`}>
                        {icons[type]}
                    </div>
                    <DialogTitle className="text-xl font-bold text-foreground">
                        {title}
                    </DialogTitle>
                </div>
                <DialogDescription className="text-foreground-soft mt-2">
                    {message}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end gap-2 mt-6">
                {mode === 'confirm' && (
                    <Button
                        type="button"
                        variant="secondary"
                        className="bg-card hover:bg-card text-foreground"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </Button>
                )}
                <Button
                    type="button"
                    className={`text-foreground ${confirmButtonColors[type]}`}
                    onClick={onConfirm}
                >
                    {confirmText}
                </Button>
            </DialogFooter>
        </div>
    );
}
