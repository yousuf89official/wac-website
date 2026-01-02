import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoginModal from '@/components/ui/LoginModal';
import SEO from '@/components/SEO';

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();

    // If authenticated, show dashboard
    if (isAuthenticated) {
        return (
            <>
                <SEO title="Command Centre" description="Admin access only." />
                <AdminDashboard
                    onClose={() => router.push('/')}
                    onLogout={() => {
                        setIsAuthenticated(false);
                        router.push('/');
                    }}
                />
            </>
        );
    }

    // Otherwise show login (or redirect)
    return (
        <>
            <SEO title="Admin Access" description="Restricted area." />
            <div className="min-h-screen bg-[#0a0a0a]">
                <LoginModal
                    isOpen={true}
                    onClose={() => router.push('/')}
                    onLoginSuccess={() => setIsAuthenticated(true)}
                />
            </div>
        </>
    );
};

export default AdminPage;
