'use client';

/**
 * Client-side auth context. Phase 4 swap: this used to wrap NextAuth's
 * useSession + signIn/signOut. It now fetches the current CI User from
 * /api/me (server-side reads the WAC cookie via getCurrentUser) and bounces
 * login/logout to WAC.
 *
 * Public API (useAuth) is unchanged so downstream components don't need edits.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { type User } from "../services/api";

interface AuthContextType {
    user: User | null;
    /**
     * Compat shim — old call sites passed (email, password). CI now has its own
     * /login page, so this redirects there. Returns true synchronously to
     * preserve the old call-site shape.
     */
    login: (email?: string, password?: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
    hasPermission: (allowedRoles: string[]) => boolean;
    /** Manual refresh — useful after a profile update. */
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch("/api/me", { cache: "no-store" });
            if (!res.ok) {
                setUser(null);
            } else {
                const data = await res.json();
                if (!data.user) {
                    setUser(null);
                } else {
                    setUser({
                        id: data.user.id,
                        name: data.user.name,
                        email: data.user.email,
                        role: data.user.role || "viewer",
                        status: data.user.status || "Active",
                        permissions: data.user.permissions || null,
                    } as User);
                }
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const login = useCallback(async () => {
        if (typeof window === "undefined") return false;
        window.location.href = "/login";
        return true;
    }, []);

    const logout = useCallback(async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }, []);

    const hasPermission = useCallback(
        (allowedRoles: string[]) => {
            if (!user) return false;
            return allowedRoles.includes(user.role);
        },
        [user]
    );

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, hasPermission, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
