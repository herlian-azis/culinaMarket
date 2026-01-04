// Helper to get the base URL for API calls in Server Components
export function getBaseUrl() {
    // In production on Vercel
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // In development
    return 'http://localhost:3000';
}
