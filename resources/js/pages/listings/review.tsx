import { Head } from '@inertiajs/react';
import ListingCard from '@/components/listings/listing-card';
import AppLayout from '@/layouts/app-layout';
import type { ListingSummary } from '@/types';

export default function ReviewListings({
    listings,
}: {
    listings: ListingSummary[];
}) {
    return (
        <AppLayout>
            <Head title="Aprovações" />

            <h1 className="text-2xl font-semibold">Aguardando aprovação</h1>
            <p className="mt-1 text-[#706f6c] dark:text-[#A1A09A]">
                {listings.length === 0 &&
                    'Nenhum anúncio está aguardando aprovação.'}
                {listings.length === 1 &&
                    '1 anúncio está aguardando aprovação.'}
                {listings.length > 1 &&
                    `${listings.length} anúncios estão aguardando aprovação.`}{' '}
                {listings.length > 0 &&
                    'Os mais antigos aparecem primeiro. Abra um anúncio para conferir as informações e aprová-lo.'}
            </p>

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
