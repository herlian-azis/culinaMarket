// Helper to get the base URL for API calls in Server Components
export function getBaseUrl() {
    // In browser (client-side), use relative URL
    if (typeof window !== 'undefined') {
        return '';
    }

    // Priority 1: Custom app URL (set manually in Vercel)
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    // Priority 2: Vercel system URL
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Priority 3: Production URL
    if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
        return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
    }

    // Development
    return 'http://localhost:3000';
}
