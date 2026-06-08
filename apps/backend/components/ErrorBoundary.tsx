import React, { Component, ErrorInfo, ReactNode } from 'react';
import NotificationModal from './ui/NotificationModal';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/'; // Redirect to home on "Acknowledge"
    };

    public render() {
        if (this.state.hasError) {
            return (
                <>
                    {/* We render the modal "open" permanently if crashed */}
                    <NotificationModal
                        isOpen={true}
                        onClose={this.handleReset}
                        type="error"
                        title="Application Error"
                        message={this.state.error?.message || 'An unexpected error occurred. We are redirecting you to safety.'}
                    />
                    {/* Blurred background content (optional) */}
                    <div className="opacity-10 pointer-events-none filter blur-sm h-screen overflow-hidden">
                        {this.props.children}
                    </div>
                </>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
