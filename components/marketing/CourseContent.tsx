"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import NeonButton from '@/components/ui/NeonButton';
import { fadeInUp, staggerContainer, staggerItem, sectionViewport, sectionPadding, sectionMaxWidth, cardBase } from '@/lib/design-system';

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
    modules: string;
    features: string;
}

interface CourseContentProps {
    course: Course;
}

const levelColors: Record<string, string> = {
    Beginner: "text-green-400 border-green-400/20 bg-green-400/10",
    Intermediate: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",
    Advanced: "text-red-400 border-red-400/20 bg-red-400/10",
};

export default function CourseContent({ course }: CourseContentProps) {
    const router = useRouter();

    let modules: { title: string; lessons: string[] | number; duration?: string }[] = [];
    let features: string[] = [];
    try { modules = JSON.parse(course.modules); } catch { /* empty */ }
    try { features = JSON.parse(course.features); } catch { /* empty */ }

    return (
        <>
            {/* Hero */}
            <section className="relative pt-40 pb-16 md:pt-48 md:pb-24 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    {/* Breadcrumb */}
                    <motion.div {...fadeInUp} className="mb-8">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <button onClick={() => router.push('/academy')} className="hover:text-primary transition-colors">
                                Academy
                            </button>
                            <span>/</span>
                            <span className="text-gray-400">{course.title}</span>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main content */}
                        <div className="lg:col-span-2">
                            <motion.div {...fadeInUp}>
                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                                        {course.category}
                                    </span>
                                    <span className={`text-xs px-2.5 py-1 rounded-full border ${levelColors[course.level] || 'text-gray-400 border-white/10'}`}>
                                        {course.level}
                                    </span>
                                    <span className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-gray-400 flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {course.duration}
                                    </span>
                                </div>

                                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
                                    {course.title}
                                </h1>

                                <p className="text-lg text-gray-400 leading-relaxed">
                                    {course.description}
                                </p>
                            </motion.div>

                            {course.image && (
                                <motion.div
                                    {...fadeInUp}
                                    transition={{ ...fadeInUp.transition, delay: 0.1 }}
                                    className="mt-8 rounded-2xl overflow-hidden border border-white/10"
                                >
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full aspect-video object-cover"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Pricing Card (sticky sidebar) */}
                        <div className="lg:col-span-1">
                            <motion.div
                                {...fadeInUp}
                                transition={{ ...fadeInUp.transition, delay: 0.2 }}
                                className={`${cardBase} p-8 lg:sticky lg:top-32`}
                            >
                                <div className="text-center mb-6">
                                    <p className="text-4xl font-black text-white mb-1">
                                        ${course.price}
                                    </p>
                                    <p className="text-sm text-gray-500">One-time payment</p>
                                </div>

                                <NeonButton
                                    variant="primary"
                                    className="w-full mb-6"
                                    onClick={() => router.push('/#contact')}
                                >
                                    Enroll Now
                                </NeonButton>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Lifetime access
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {course.duration} of content
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Certificate of completion
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Community access
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modules */}
            {modules.length > 0 && (
                <section className={sectionPadding}>
                    <div className={sectionMaxWidth}>
                        <motion.div {...fadeInUp} viewport={sectionViewport} className="mb-12">
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-4">Curriculum</p>
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                                What You&apos;ll Learn
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={sectionViewport}
                            className="space-y-4"
                        >
                            {modules.map((mod, i) => (
                                <motion.div
                                    key={i}
                                    variants={staggerItem}
                                    className={`${cardBase} p-6`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-2">{mod.title}</h3>
                                            {Array.isArray(mod.lessons) ? (
                                                <ul className="space-y-1">
                                                    {mod.lessons.map((lesson: string, j: number) => (
                                                        <li key={j} className="text-sm text-gray-400 flex items-center gap-2">
                                                            <svg className="w-3 h-3 text-gray-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                            {lesson}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-sm text-gray-400">
                                                    {mod.lessons} lessons{mod.duration ? ` · ${mod.duration}` : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Features */}
            {features.length > 0 && (
                <section className={`${sectionPadding} bg-white/[0.02]`}>
                    <div className={sectionMaxWidth}>
                        <motion.div {...fadeInUp} viewport={sectionViewport} className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white">
                                What&apos;s Included
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={staggerContainer}
                            initial="initial"
                            whileInView="animate"
                            viewport={sectionViewport}
                            className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto"
                        >
                            {features.map((feature, i) => (
                                <motion.div
                                    key={i}
                                    variants={staggerItem}
                                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5"
                                >
                                    <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-sm text-gray-300">{feature}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className={sectionPadding}>
                <div className={`${sectionMaxWidth} text-center`}>
                    <motion.div {...fadeInUp} viewport={sectionViewport}>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-6">
                            Ready to Level Up?
                        </h2>
                        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
                            Join the next cohort and start building real marketing skills that drive revenue.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <NeonButton variant="primary" size="lg" onClick={() => router.push('/#contact')}>
                                Enroll Now — ${course.price}
                            </NeonButton>
                            <NeonButton variant="ghost" size="lg" onClick={() => router.push('/academy')}>
                                Browse All Courses
                            </NeonButton>
                        </div>
                    </motion.div>
                </div>
            </section>
        </>
    );
}
