"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoginModal from '@/components/ui/LoginModal';
import SEO from '@/components/SEO';
import api from '@/lib/api';

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        api.get('/auth/me')
            .then(({ data }) => {
                setIsAuthenticated(data.authenticated);
            })
            .catch(() => {
                setIsAuthenticated(false);
            });
    }, []);

    const handleLogout = async () => {
        await api.post('/auth/logout');
        setIsAuthenticated(false);
        router.push('/');
    };

    // Loading state
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <>
                <SEO title="Command Centre" description="Admin access only." />
                <AdminDashboard
                    onClose={() => router.push('/')}
                    onLogout={handleLogout}
                />
            </>
        );
    }

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
