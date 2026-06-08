'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './dialog';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ErrorAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorAlertModal({
    isOpen,
    onClose,
    title,
    message,
    onRetry,
}: ErrorAlertModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-destructive/10 border border-destructive/20">
                            <AlertTriangle className="h-6 w-6 text-destructive" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-foreground-soft mt-2">
                        {message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start gap-2 mt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        className="flex-1 bg-card hover:bg-card text-foreground"
                        onClick={onClose}
                    >
                        Dismiss
                    </Button>
                    {onRetry && (
                        <Button
                            type="button"
                            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={() => {
                                onRetry();
                                onClose();
                            }}
                        >
                            Retry
                        </Button>
                    )}
                    <Button
                        type="button"
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => window.location.href = '/dashboard'}
                    >
                        Reload App
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
