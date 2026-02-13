import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Customer Display - Lân Coffee',
    description: 'Real-time order view for customers',
};

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased overflow-hidden">
            {children}
        </div>
    );
}
