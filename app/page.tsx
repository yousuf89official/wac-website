import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';

export default function Home() {
    return (
        <AppProvider>
            <div className="dark">
                <AppLayout />
            </div>
        </AppProvider>
    );
}
