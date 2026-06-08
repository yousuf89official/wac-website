'use client';

import React, { Component, ReactNode } from 'react';
import { triggerGlobalError } from '../contexts/ErrorContext';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);

        // Prevent infinite loops if the error is "Maximum update depth exceeded"
        if (error.message && error.message.includes('Maximum update depth exceeded')) {
            console.error('Caught update depth error - stopping propagation');
            return;
        }

        // If we are already displaying an error, don't trigger another one
        if (this.state.hasError) {
            return;
        }

        // Trigger the global modal - deferred to prevent update loops
        setTimeout(() => {
            triggerGlobalError(
                'Application Error',
                `An unexpected error occurred: ${error.message}. The application has been paused to prevent data loss.`,
                () => {
                    this.setState({ hasError: false });
                    window.location.href = '/dashboard';
                }
            );
        }, 0);
    }

    render() {
        // We can render children here. The modal in Providers will take over display.
        // If the error is critical enough that Providers unmount, we might need a fallback here.
        // Ideally, ErrorProvider is OUTSIDE this boundary? No, inside is better for context usage, 
        // but triggerGlobalError handles the "outside hook" case.
        // Let's just always render children - if they crash, the modal pops up over the frozen/broken UI.
        // Or we can return null to "clear" the broken UI behind the modal.
        if (this.state.hasError) {
            return (
                <div className="h-screen w-screen bg-black flex items-center justify-center text-white p-4">
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-gray-400 mb-4">Please check the alert dialog for details.</p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
