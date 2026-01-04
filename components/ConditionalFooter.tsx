'use client';
import { usePathname } from 'next/navigation';
import Footer from './Footer';
// Routes that should NOT show the footer
const hideFooterRoutes = ['/concierge', '/admin'];
export default function ConditionalFooter() {
    const pathname = usePathname();

    // Check if current path starts with any of the hidden routes
    const shouldHideFooter = hideFooterRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );
    if (shouldHideFooter) {
        return null;
    }
    return <Footer />;
}
