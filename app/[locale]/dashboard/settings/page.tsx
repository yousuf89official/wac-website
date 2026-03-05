"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCustomer } from '../layout';
import { User, Lock, Check } from 'lucide-react';

export default function SettingsPage() {
    const t = useTranslations('dashboard');
    const tAuth = useTranslations('auth');
    const customer = useCustomer();

    const [tab, setTab] = useState<'profile' | 'security'>('profile');

    // Profile form
    const [profile, setProfile] = useState({
        firstName: customer?.firstName || '',
        lastName: customer?.lastName || '',
        phone: customer?.phone || '',
        company: customer?.company || '',
        country: customer?.country || 'ID',
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');

    // Password form
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg('');
        try {
            const res = await fetch('/api/customer/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (res.ok) {
                setProfileMsg(t('profileUpdated'));
            }
        } catch {
            // silently fail
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordMsg('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            const res = await fetch('/api/customer/me', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setPasswordError(data.error || 'Failed to change password');
                return;
            }
            setPasswordMsg(t('passwordChanged'));
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch {
            setPasswordError('Something went wrong');
        } finally {
            setPasswordLoading(false);
        }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-600 focus:border-primary/50 focus:outline-none transition-colors";

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-black text-white tracking-tighter">{t('settings')}</h1>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'profile' as const, label: t('profile'), icon: User },
                    { key: 'security' as const, label: t('security'), icon: Lock },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            tab === key ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Icon className="w-4 h-4" /> {label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {tab === 'profile' && (
                <form onSubmit={handleProfileSubmit} className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 space-y-5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-black font-black text-xl">
                            {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                        </div>
                        <div>
                            <p className="text-white font-bold">{customer?.firstName} {customer?.lastName}</p>
                            <p className="text-gray-500 text-sm">{customer?.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                {tAuth('firstName')}
                            </label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                {tAuth('lastName')}
                            </label>
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('phone')}
                        </label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('company')}
                        </label>
                        <input
                            type="text"
                            value={profile.company}
                            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('country')}
                        </label>
                        <select
                            value={profile.country}
                            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                            className={inputClass}
                        >
                            <option value="ID">Indonesia</option>
                            <option value="US">United States</option>
                            <option value="GB">United Kingdom</option>
                            <option value="SG">Singapore</option>
                            <option value="MY">Malaysia</option>
                            <option value="AU">Australia</option>
                        </select>
                    </div>

                    {profileMsg && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <Check className="w-4 h-4" /> {profileMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {profileLoading ? '...' : t('save')}
                    </button>
                </form>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
                <form onSubmit={handlePasswordSubmit} className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 space-y-5">
                    <h2 className="text-white font-bold">{t('changePassword')}</h2>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('currentPassword')}
                        </label>
                        <input
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('newPassword')}
                        </label>
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            required
                            minLength={8}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                            {t('confirmPassword')}
                        </label>
                        <input
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                            required
                            minLength={8}
                            className={inputClass}
                        />
                    </div>

                    {passwordError && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {passwordError}
                        </div>
                    )}

                    {passwordMsg && (
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <Check className="w-4 h-4" /> {passwordMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {passwordLoading ? '...' : t('changePassword')}
                    </button>
                </form>
            )}
        </div>
    );
}
