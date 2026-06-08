'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Shield,
    Briefcase,
    Calendar,
    CreditCard,
    Link2,
    Copy,
    Check,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user: authUser, isLoading } = useAuth();
    const session = authUser ? { user: authUser } : null;
    const status = isLoading ? 'loading' : authUser ? 'authenticated' : 'unauthenticated';
    const [subscription, setSubscription] = useState<any>(null);
    const [referral, setReferral] = useState<any>(null);
    const [loadingSub, setLoadingSub] = useState(true);
    const [loadingRef, setLoadingRef] = useState(true);
    const [userDetails, setUserDetails] = useState<any>(null);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Referral link copy state
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchSubscription();
            fetchReferral();
            fetchUserDetails();
        }
    }, [status]);

    const fetchSubscription = async () => {
        try {
            const res = await fetch('/api/subscriptions');
            if (res.ok) {
                const data = await res.json();
                setSubscription(data);
            }
        } catch {
            // Silently fail
        } finally {
            setLoadingSub(false);
        }
    };

    const fetchReferral = async () => {
        try {
            const res = await fetch('/api/referrals');
            if (res.ok) {
                const data = await res.json();
                setReferral(data);
            }
        } catch {
            // Silently fail
        } finally {
            setLoadingRef(false);
        }
    };

    const fetchUserDetails = async () => {
        try {
            const res = await fetch('/api/users?self=true');
            if (res.ok) {
                const data = await res.json();
                setUserDetails(data);
            }
        } catch {
            // Silently fail
        }
    };

    const handlePasswordChange = async () => {
        if (!currentPassword) {
            toast.error('Please enter your current password');
            return;
        }
        if (!newPassword) {
            toast.error('Please enter a new password');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
            toast.error('Password must contain only letters and numbers');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        setChangingPassword(true);
        try {
            const res = await fetch('/api/users/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Password updated successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.error || 'Failed to change password');
            }
        } catch {
            toast.error('Network error while changing password');
        } finally {
            setChangingPassword(false);
        }
    };

    const copyReferralLink = () => {
        if (!referral?.code) return;
        const link = `${window.location.origin}/register?ref=${referral.code}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        toast.success('Referral link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const user = session?.user;
    const role = (user as any)?.role || 'user';
    const memberSince = userDetails?.createdAt
        ? new Date(userDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';
    const workRole = userDetails?.workRole || 'Not set';
    const accountStatus = userDetails?.status || 'Active';

    const fieldRow = (icon: React.ReactNode, label: string, content: React.ReactNode) => (
        <div className="space-y-2 border-b border-border pb-5">
            <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">
                {icon} {label}
            </label>
            <div className="font-newsreader text-base text-foreground">{content}</div>
        </div>
    );

    return (
        <div className="p-6 md:p-10 space-y-12 max-w-4xl mx-auto">
            {/* Editorial header */}
            <div className="space-y-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground-soft">
                    Intelligence · Profile
                </p>
                <h1 className="font-fraunces text-4xl md:text-5xl text-foreground leading-[1.05] tracking-tight">
                    Your profile
                </h1>
                <p className="font-newsreader text-base text-foreground-soft max-w-xl">
                    View your account details, manage your subscription, and update your password.
                </p>
            </div>

            {/* Account Information */}
            <section className="bg-card border border-border rounded-lg p-8 space-y-6">
                <header className="border-b border-border pb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">Account</p>
                    <h2 className="font-fraunces text-2xl text-foreground mt-1">Account information</h2>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fieldRow(<User className="h-3.5 w-3.5" />, 'Full Name', user?.name || 'N/A')}
                    {fieldRow(<Mail className="h-3.5 w-3.5" />, 'Email Address', user?.email || 'N/A')}
                    {fieldRow(
                        <Shield className="h-3.5 w-3.5" />,
                        'System Role',
                        <span className={cn(
                            "inline-block px-2.5 py-0.5 rounded font-mono text-[10px] uppercase tracking-[0.18em]",
                            role === 'admin' || role === 'super_admin' || role === 'masteradmin'
                                ? "bg-primary/10 text-primary border border-primary/30"
                                : "bg-background-2 text-foreground-soft border border-border"
                        )}>
                            {role}
                        </span>
                    )}
                    {fieldRow(<Briefcase className="h-3.5 w-3.5" />, 'Work Role', <span className="text-foreground-soft">{workRole}</span>)}
                    {fieldRow(
                        <Activity className="h-3.5 w-3.5" />,
                        'Account Status',
                        <span className={cn(
                            "inline-flex items-center gap-2",
                            accountStatus === 'Active' ? "text-success" : "text-warning"
                        )}>
                            <span className={cn(
                                "h-2 w-2 rounded-full",
                                accountStatus === 'Active' ? "bg-success" : "bg-warning"
                            )} />
                            {accountStatus}
                        </span>
                    )}
                    {fieldRow(<Calendar className="h-3.5 w-3.5" />, 'Member Since', <span className="text-foreground-soft">{memberSince}</span>)}
                </div>
            </section>

            {/* Subscription Plan */}
            <section className="bg-card border border-border rounded-lg p-8 space-y-5">
                <header className="border-b border-border pb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">Billing</p>
                    <h2 className="font-fraunces text-2xl text-foreground mt-1">Subscription plan</h2>
                </header>

                {loadingSub ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded bg-primary/10 text-primary border border-primary/30">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <p className="font-fraunces text-lg text-foreground">
                                {subscription?.plan?.name || 'Free Plan'}
                            </p>
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground-soft mt-1">
                                {subscription?.subscription
                                    ? `${subscription.subscription.billingCycle} · ${subscription.subscription.status}`
                                    : 'No active subscription'}
                            </p>
                        </div>
                        {subscription?.subscription?.currentPeriodEnd && (
                            <div className="text-right">
                                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">Renews</p>
                                <p className="font-newsreader text-sm text-foreground mt-1">
                                    {new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Referral */}
            <section className="bg-card border border-border rounded-lg p-8 space-y-5">
                <header className="border-b border-border pb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">Program</p>
                    <h2 className="font-fraunces text-2xl text-foreground mt-1">Referral</h2>
                </header>

                {loadingRef ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                ) : referral ? (
                    <div className="space-y-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded bg-primary/10 text-primary border border-primary/30">
                                <Link2 className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft mb-1">Your Referral Code</p>
                                <p className="font-mono text-base text-foreground">{referral.code}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-11 flex items-center px-4 rounded bg-background-2 border border-border text-foreground-soft text-xs font-mono truncate">
                                {typeof window !== 'undefined'
                                    ? `${window.location.origin}/register?ref=${referral.code}`
                                    : `/register?ref=${referral.code}`}
                            </div>
                            <button
                                onClick={copyReferralLink}
                                className="h-11 w-11 flex items-center justify-center rounded bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-all"
                                title="Copy referral link"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="p-4 rounded bg-background-2 border border-border text-center">
                                <p className="font-fraunces text-2xl text-foreground">{referral.stats?.totalReferrals || 0}</p>
                                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft mt-1">Total</p>
                            </div>
                            <div className="p-4 rounded bg-background-2 border border-border text-center">
                                <p className="font-fraunces text-2xl text-success">{referral.stats?.activeReferrals || 0}</p>
                                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft mt-1">Active</p>
                            </div>
                            <div className="p-4 rounded bg-background-2 border border-border text-center">
                                <p className="font-fraunces text-2xl text-primary">
                                    {((referral.stats?.effectiveRate || 0.1) * 100).toFixed(0)}%
                                </p>
                                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft mt-1">Rate</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="font-newsreader text-sm text-foreground-soft">Referral program not available.</p>
                )}
            </section>

            {/* Change Password */}
            <section className="bg-card border border-border rounded-lg p-8 space-y-6">
                <header className="border-b border-border pb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">Security</p>
                    <h2 className="font-fraunces text-2xl text-foreground mt-1">Change password</h2>
                </header>

                <div className="space-y-6 max-w-md">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">
                            <Lock className="h-3.5 w-3.5" /> Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="w-full h-11 bg-transparent border-0 border-b border-border pr-10 text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                            >
                                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">
                            <Lock className="h-3.5 w-3.5" /> New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 8 characters, letters & numbers only"
                                className="w-full h-11 bg-transparent border-0 border-b border-border pr-10 text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {newPassword && newPassword.length < 8 && (
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-destructive">Password must be at least 8 characters</p>
                        )}
                        {newPassword && newPassword.length >= 8 && !/^[a-zA-Z0-9]+$/.test(newPassword) && (
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-destructive">Only letters and numbers are allowed</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground-soft">
                            <Lock className="h-3.5 w-3.5" /> Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                className="w-full h-11 bg-transparent border-0 border-b border-border pr-10 text-foreground text-base font-newsreader placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-destructive">Passwords do not match</p>
                        )}
                    </div>

                    <button
                        onClick={handlePasswordChange}
                        disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                        className={cn(
                            "h-12 px-6 rounded font-mono text-[11px] uppercase tracking-[0.22em] transition-all",
                            "bg-primary hover:opacity-90 text-primary-foreground",
                            "disabled:opacity-40 disabled:cursor-not-allowed",
                            "flex items-center gap-2"
                        )}
                    >
                        {changingPassword ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating…
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </div>
            </section>
        </div>
    );
}
