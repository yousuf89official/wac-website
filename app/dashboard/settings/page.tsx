"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCustomer } from '../layout';
import { User, Lock, Check } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as const;

export default function SettingsPage() {
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
                setProfileMsg("Profile updated successfully.");
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
            setPasswordMsg("Password changed successfully.");
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch {
            setPasswordError('Something went wrong');
        } finally {
            setPasswordLoading(false);
        }
    };

    const inputClass = "w-full bg-transparent border-b border-foreground/15 py-3 font-serif text-lg text-foreground placeholder-foreground-soft focus:border-primary focus:outline-none transition-colors";
    const labelClass = "block font-mono text-2xs uppercase tracking-widest text-foreground-soft mb-2";

    return (
        <div className="space-y-12">
            <motion.header
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
            >
                <p className="eyebrow mb-3">PORTAL / SETTINGS</p>
                <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">Account & security</h1>
                <p className="font-serif text-foreground-soft mt-3 text-lg max-w-2xl">
                    Update the small details that follow you across the platform. Changes save when you press the button.
                </p>
            </motion.header>

            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-foreground/10 pb-4">
                {[
                    { key: 'profile' as const, label: "Profile", icon: User },
                    { key: 'security' as const, label: "Security", icon: Lock },
                ].map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono text-2xs uppercase tracking-widest transition-colors ${
                            tab === key
                                ? 'bg-foreground text-background'
                                : 'text-foreground-soft hover:text-foreground hover:bg-foreground/[0.04]'
                        }`}
                    >
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.5} /> {label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {tab === 'profile' && (
                <motion.form
                    key="profile"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    onSubmit={handleProfileSubmit}
                    className="border-y border-foreground/10 py-10 md:py-12 space-y-8 max-w-3xl"
                >
                    <div className="flex items-center gap-5 pb-6 border-b border-foreground/10">
                        <div className="w-16 h-16 rounded-full border border-foreground/15 flex items-center justify-center font-display text-2xl font-medium text-foreground">
                            {customer?.firstName?.[0]}{customer?.lastName?.[0]}
                        </div>
                        <div>
                            <p className="font-display text-2xl font-medium tracking-tight">{customer?.firstName} {customer?.lastName}</p>
                            <p className="font-mono text-2xs uppercase tracking-widest text-foreground-soft mt-1">{customer?.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <label className={labelClass}>First name</label>
                            <input
                                type="text"
                                value={profile.firstName}
                                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Last name</label>
                            <input
                                type="text"
                                value={profile.lastName}
                                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Phone</label>
                        <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Company</label>
                        <input
                            type="text"
                            value={profile.company}
                            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>Country</label>
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
                        <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-primary">
                            <Check className="w-3.5 h-3.5" strokeWidth={1.75} /> {profileMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="inline-flex h-12 items-center px-6 rounded-full bg-primary text-primary-foreground text-2xs font-semibold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {profileLoading ? 'Saving…' : 'Save changes'}
                    </button>
                </motion.form>
            )}

            {/* Security Tab */}
            {tab === 'security' && (
                <motion.form
                    key="security"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease }}
                    onSubmit={handlePasswordSubmit}
                    className="border-y border-foreground/10 py-10 md:py-12 space-y-8 max-w-3xl"
                >
                    <h2 className="font-display text-2xl font-medium tracking-tight">Change password</h2>

                    <div>
                        <label className={labelClass}>Current password</label>
                        <input
                            type="password"
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label className={labelClass}>New password</label>
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
                        <label className={labelClass}>Confirm password</label>
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
                        <div className="border border-destructive/30 p-3 font-mono text-2xs uppercase tracking-widest text-destructive">
                            {passwordError}
                        </div>
                    )}

                    {passwordMsg && (
                        <div className="flex items-center gap-2 font-mono text-2xs uppercase tracking-widest text-primary">
                            <Check className="w-3.5 h-3.5" strokeWidth={1.75} /> {passwordMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="inline-flex h-12 items-center px-6 rounded-full bg-primary text-primary-foreground text-2xs font-semibold uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {passwordLoading ? 'Updating…' : 'Change password'}
                    </button>
                </motion.form>
            )}
        </div>
    );
}
