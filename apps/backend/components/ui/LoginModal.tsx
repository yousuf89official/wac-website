import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NeonButton from './NeonButton';
import api from '@/lib/api';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(false);

        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.success) {
                onLoginSuccess();
                // onClose(); // Removed to prevent redirecting to home in AdminPage
                setEmail('');
                setPassword('');
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-xl"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-[2.5rem] p-10 md:p-12 overflow-hidden shadow-2xl"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f0ff] via-[#b000ff] to-[#ff006e]" />

                        <div className="relative z-10">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#00f0ff] to-[#b000ff] rounded-2xl mx-auto mb-6 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">Security Override</h3>
                                <p className="text-gray-500 text-sm font-medium">Clearance required for admin access.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Identifier</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:border-[#00f0ff] focus:outline-none transition-all"
                                        placeholder="yousuf@wearecollaborative.net"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Access Protocol</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-800 focus:border-[#00f0ff] focus:outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                                    >
                                        Access Denied. Invalid Credentials.
                                    </motion.div>
                                )}

                                <NeonButton
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full h-16 rounded-2xl text-lg group"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            Authorizing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            Authenticate Link
                                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    )}
                                </NeonButton>
                            </form>

                            <button
                                onClick={onClose}
                                className="mt-8 w-full text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                            >
                                Abort Connection
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default LoginModal;
