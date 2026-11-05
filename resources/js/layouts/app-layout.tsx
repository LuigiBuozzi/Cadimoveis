import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { home, logout } from '@/routes';
import { create, index, review, search } from '@/routes/listings';

type NavigationItem = {
    label: string;
    href: string;
    count?: number | null;
};

const navigation: NavigationItem[] = [
    { label: 'Início', href: home.url() },
    { label: 'Pesquisar', href: search.url() },
    { label: 'Anunciar', href: create.url() },
    { label: 'Anúncios', href: index.url() },
];

export default function AppLayout({ children }: { children: ReactNode }) {
    const { auth, pendingReviewCount } = usePage().props;
    const items: NavigationItem[] = auth.user?.is_admin
        ? [
              ...navigation,
              {
                  label: 'Aprovações',
                  href: review.url(),
                  count: pendingReviewCount,
              },
          ]
        : navigation;
    const { url, flash } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a] dark:text-[#EDEDEC]">
            <header className="border-b border-[#e3e3e0] bg-white dark:border-[#3E3E3A] dark:bg-[#161615]">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:flex-nowrap sm:px-6">
                    <Link
                        href={home()}
                        className="text-xl font-semibold tracking-tight"
                    >
                        Cadimoveis
                    </Link>

                    <nav className="order-last flex w-full flex-wrap gap-1 sm:order-0 sm:w-auto sm:flex-1">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={
                                    currentPath === item.href
                                        ? 'page'
                                        : undefined
                                }
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-[#706f6c] hover:bg-[#f5f5f3] hover:text-[#1b1b18] dark:text-[#A1A09A] dark:hover:bg-[#1f1f1d] dark:hover:text-[#EDEDEC]',
                                    currentPath === item.href &&
                                        'bg-[#f5f5f3] text-[#1b1b18] dark:bg-[#1f1f1d] dark:text-[#EDEDEC]',
                                )}
                            >
                                {item.label}
                                {item.count ? (
                                    <span className="rounded-full bg-[#f53003] px-1.5 text-xs leading-5 text-white tabular-nums dark:bg-[#FF4433]">
                                        {item.count}
                                        <span className="sr-only">
                                            {item.count === 1
                                                ? ' anúncio aguardando'
                                                : ' anúncios aguardando'}
                                        </span>
                                    </span>
                                ) : null}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3 text-sm">
                        <span className="hidden text-[#706f6c] md:inline dark:text-[#A1A09A]">
                            {auth.user?.email}
                        </span>
                        <Link
                            href={logout()}
                            as="button"
                            className="rounded-md border border-[#e3e3e0] px-3 py-1.5 hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:hover:border-[#EDEDEC]"
                        >
                            Sair
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
                {flash.success && (
                    <div
                        role="status"
                        className="mb-6 rounded-md border border-[#1b1b18] bg-white px-4 py-3 text-sm dark:border-[#EDEDEC] dark:bg-[#161615]"
                    >
                        {flash.success}
                    </div>
                )}
                {children}
            </main>
        </div>
    );
}
