import BlogPost from '@/components/pages/BlogPost';

export function generateStaticParams() {
    return []; // We will stick to dynamic rendering for now or implement SSG later
}

export default function Page() {
    return <BlogPost />;
}
