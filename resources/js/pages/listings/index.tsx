import { Head, Link } from '@inertiajs/react';
import ListingCard from '@/components/listings/listing-card';
import AppLayout from '@/layouts/app-layout';
import { create } from '@/routes/listings';
import type { ListingSummary } from '@/types';

export default function Listings({ listings }: { listings: ListingSummary[] }) {
    const hasPending = listings.some((listing) => listing.status === 'pending');

    return (
        <AppLayout>
            <Head title="Anúncios" />

            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold">Meus anúncios</h1>
                    <p className="mt-1 text-[#706f6c] dark:text-[#A1A09A]">
                        {listings.length === 0
                            ? 'Você ainda não anunciou nenhum imóvel.'
                            : `Você tem ${listings.length} ${listings.length === 1 ? 'imóvel anunciado' : 'imóveis anunciados'}.`}
                    </p>
                </div>
                <Link
                    href={create()}
                    className="rounded-md bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:bg-black dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                >
                    Anunciar imóvel
                </Link>
            </div>

            {hasPending && (
                <p className="mt-4 rounded-md border border-[#e3e3e0] bg-white px-4 py-3 text-sm dark:border-[#3E3E3A] dark:bg-[#161615]">
                    Anúncios <strong className="font-medium">em análise</strong>{' '}
                    só aparecem para você. Eles passam a aparecer na pesquisa
                    depois de aprovados por um administrador.
                </p>
            )}

            {listings.length > 0 && (
                <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((listing) => (
                        <li key={listing.id}>
                            <ListingCard listing={listing} />
                        </li>
                    ))}
                </ul>
            )}
        </AppLayout>
    );
}
