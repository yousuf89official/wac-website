import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[], offset = 100) {
    const [activeSection, setActiveSection] = useState<string>('');

    useEffect(() => {
        const handleScroll = () => {
            let currentSection = '';

            // Find the section that is currently most visible or just passed the offset
            for (const id of sectionIds) {
                const element = document.getElementById(id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    // Check if the section top is near the top of the viewport
                    if (rect.top <= offset && rect.bottom >= offset) {
                        currentSection = id;
                    }
                }
            }

            setActiveSection(currentSection);
        };

        window.addEventListener('scroll', handleScroll);
        // Call once on mount to set initial state
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionIds, offset]);

    return activeSection;
}
