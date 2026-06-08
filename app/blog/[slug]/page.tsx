import { redirect } from 'next/navigation';

// Legacy /blog/<slug> URLs live on as a permanent redirect to the canonical
// /resources/<slug>. (The old [locale] segment was removed, so there is no
// locale to prepend anymore.)
export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    redirect(`/resources/${slug}`);
}
