// Helper to get the base URL for API calls in Server Components
export function getBaseUrl() {
    // In browser (client-side), use relative URL
    if (typeof window !== 'undefined') {
        return '';
    }

    // In production on Vercel - check multiple env vars
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Custom domain or NEXT_PUBLIC version
    if (process.env.NEXT_PUBLIC_VERCEL_URL) {
        return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    }

    // Vercel production with custom domain
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    // In development
    return 'http://localhost:3000';
}
