import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { usePathname } from 'next/navigation';

export function useNewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState({ title: '', message: '' });
    const sessionIdRef = useRef('');
    const pathname = usePathname();

    // Initialize Session ID
    useEffect(() => {
        let storedSession = localStorage.getItem('visitor_session_id');
        if (!storedSession) {
            storedSession = uuidv4();
            localStorage.setItem('visitor_session_id', storedSession);
        }
        sessionIdRef.current = storedSession;
    }, []);

    // Fetch Config on Route Change
    useEffect(() => {
        if (!sessionIdRef.current) return;

        const checkPopupRules = async () => {
            try {
                // Client-side quick check (optional, but good for immediate feedback)
                if (localStorage.getItem('newsletter_subscribed')) return;

                const res = await fetch('/api/marketing/popup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: sessionIdRef.current,
                        currentPath: pathname
                    })
                });
                const data = await res.json();

                if (data.show && data.config) {
                    setContent({
                        title: data.config.title,
                        message: data.config.message
                    });

                    // Set up Triggers
                    const scrollTrigger = data.config.trigger?.scrollInfo || 50;
                    const timeTrigger = data.config.trigger?.timeInfo || 30;

                    const handleScroll = () => {
                        const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                        if (scrollPercentage > scrollTrigger) {
                            setIsOpen(true);
                            window.removeEventListener('scroll', handleScroll);
                        }
                    };

                    window.addEventListener('scroll', handleScroll);
                    const timer = setTimeout(() => {
                        setIsOpen(true);
                        window.removeEventListener('scroll', handleScroll);
                    }, timeTrigger * 1000);

                    return () => {
                        window.removeEventListener('scroll', handleScroll);
                        clearTimeout(timer);
                    };
                }
            } catch (error) {
                console.error("Popup check failed", error);
            }
        };

        // Track Page View
        fetch('/api/visitor/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sessionIdRef.current,
                type: 'pageview',
                data: { path: pathname }
            })
        }).catch(() => { });

        // Run check
        // Small delay to ensure render
        const timeoutId = setTimeout(checkPopupRules, 1000);

        return () => clearTimeout(timeoutId);

    }, [pathname]);

    const trackEvent = (type: string) => {
        fetch('/api/visitor/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sessionIdRef.current,
                type,
                data: { path: pathname }
            })
        }).catch(() => { });
    };

    const dismiss = () => {
        setIsOpen(false);
        trackEvent('popup_dismiss');
    };

    const subscribe = () => {
        setIsOpen(false);
        localStorage.setItem('newsletter_subscribed', 'true'); // Client-side backup
        trackEvent('popup_subscribe');
    };

    return { isOpen, content, dismiss, subscribe };
}
