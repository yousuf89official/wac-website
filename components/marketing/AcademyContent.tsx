"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageHero from '@/components/shared/PageHero';
import NeonButton from '@/components/ui/NeonButton';
import { fadeInUp, staggerContainer, staggerItem, scaleOnHover, sectionViewport, sectionPadding, sectionMaxWidth, cardBase } from '@/lib/design-system';

interface Course {
    id: number;
    slug: string;
    title: string;
    description: string;
    price: number;
    image: string;
    category: string;
    duration: string;
    level: string;
    isFeatured: boolean;
}

interface AcademyContentProps {
    courses: Course[];
    categories: string[];
}

const levelColors: Record<string, string> = {
    Beginner: "text-green-400 border-green-400/20 bg-green-400/10",
    Intermediate: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
    Advanced: "text-red-400 border-red-400/20 bg-red-400/10",
};

const valuePropIcons = [
    {
        title: "Expert-Led",
        description: "Learn from practitioners who've scaled real businesses — not just theorists.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
        ),
    },
    {
        title: "Practical",
        description: "Every module includes real-world projects, templates, and frameworks you can use immediately.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
    },
    {
        title: "Community",
        description: "Join a network of ambitious marketers. Share wins, get feedback, grow together.",
        icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

export default function AcademyContent({ courses, categories }: AcademyContentProps) {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<string>("All");

    const filteredCourses = useMemo(() => {
        if (activeCategory === "All") return courses;
        return courses.filter((c) => c.category === activeCategory);
    }, [courses, activeCategory]);

    const allCategories = ["All", ...categories];

    return (
        <>
            <PageHero
                title="WAC Academy"
                subtitle="Learn & Grow"
                description="Master digital marketing with expert-led courses. From SEO fundamentals to advanced affiliate strategies — learn at your pace."
            />

            {/* Category Filter */}
            <section className="pb-8">
                <div className={sectionMaxWidth}>
                    <div className="flex flex-wrap gap-3">
                        {allCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                    activeCategory === cat
                                        ? 'bg-primary text-black'
                                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Course Grid */}
            <section className={sectionPadding}>
                <div className={sectionMaxWidth}>
                    {filteredCourses.length === 0 ? (
                        <p className="text-center text-gray-500 text-lg py-20">
                            No courses in this category yet. Check back soon!
                        </p>
                    ) : (
                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={sectionViewport}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredCourses.map((course) => (
                                <motion.div
                                    key={course.id}
                                    variants={staggerItem}
                                    {...scaleOnHover}
                                    onClick={() => router.push(`/academy/${course.slug}`)}
                                    className={`${cardBase} overflow-hidden cursor-pointer group ${
                                        course.isFeatured ? 'border-primary/30' : ''
                                    }`}
                                >
                                    {course.image && (
                                        <div className="aspect-video overflow-hidden relative">
                                            <img
                                                src={course.image}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {course.isFeatured && (
                                                <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full">
                                                    Featured
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                                {course.category}
                                            </span>
                                            <span className={`text-xs px-2.5 py-1 rounded-full border ${levelColors[course.level] || 'text-gray-400 border-white/10'}`}>
                                                {course.level}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>

                                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                            {course.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    {course.duration}
                                                </span>
                                            </div>
                                            <span className="text-lg font-black text-white">
                                                ${course.price}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Why WAC Academy */}
            <section className={`${sectionPadding} bg-white/[0.02]`}>
                <div className={sectionMaxWidth}>
                    <motion.div {...fadeInUp} viewport={sectionViewport} className="text-center mb-16">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Why Us</p>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                            Why WAC Academy
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={sectionViewport}
                        className="grid md:grid-cols-3 gap-8"
                    >
                        {valuePropIcons.map((prop, i) => (
                            <motion.div
                                key={i}
                                variants={staggerItem}
                                className={`${cardBase} p-8 text-center`}
                            >
                                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-6">
                                    {prop.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{prop.title}</h3>
                                <p className="text-sm text-gray-400">{prop.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA */}
            <section className={sectionPadding}>
                <div className={`${sectionMaxWidth} text-center`}>
                    <motion.div {...fadeInUp} viewport={sectionViewport}>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
                            Start Learning Today
                        </h2>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
                            Invest in your skills. Join thousands of marketers leveling up with WAC Academy.
                        </p>
                        <NeonButton variant="primary" size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            Explore All Courses
                        </NeonButton>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
