import { setRequestLocale } from 'next-intl/server';

export default async function AuthLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background gradient effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px]" />

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-destructive p-[2px]">
                        <div className="w-full h-full bg-[#0a0a0a] rounded-[10px] flex items-center justify-center font-black text-white text-xl">
                            W
                        </div>
                    </div>
                    <span className="text-white font-black text-xl tracking-tighter">
                        WAC
                    </span>
                </div>

                {children}
            </div>
        </div>
    );
}
