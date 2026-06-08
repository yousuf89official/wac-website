"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import api from '@/lib/api';

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        api.get('/auth/me')
            .then(({ data }) => {
                if (data.authenticated) {
                    setIsAuthenticated(true);
                } else {
                    router.push('/login');
                }
            })
            .catch(() => {
                router.push('/login');
            });
    }, [router]);

    const handleLogout = async () => {
        await api.post('/auth/logout');
        router.push('/login');
    };

    // Loading state
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#00f0ff] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <AdminDashboard
            onClose={() => router.push('/')}
            onLogout={handleLogout}
        />
    );
};

export default AdminPage;
