import type { Auth } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        flashDataType: {
            success?: string;
        };
        sharedPageProps: {
            name: string;
            auth: Auth;
            // Only set for administrators.
            pendingReviewCount: number | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
