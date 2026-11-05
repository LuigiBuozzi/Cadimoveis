import { Link } from '@inertiajs/react';
import { propertyTypeLabel } from '@/lib/listing-options';
import { formatListingPrice } from '@/lib/price';
import { show } from '@/routes/listings';
import type { ListingSummary } from '@/types';

function plural(count: number, singular: string, pluralForm: string) {
    return `${count} ${count === 1 ? singular : pluralForm}`;
}

export default function ListingCard({ listing }: { listing: ListingSummary }) {
    const details = [
        listing.bedrooms > 0 && plural(listing.bedrooms, 'quarto', 'quartos'),
        listing.suites > 0 && plural(listing.suites, 'suíte', 'suítes'),
        listing.bathrooms > 0 &&
            plural(listing.bathrooms, 'banheiro', 'banheiros'),
    ].filter(Boolean);

    return (
        <Link
            href={show(listing.id)}
            className="group block overflow-hidden rounded-lg border border-[#e3e3e0] bg-white hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#EDEDEC]"
        >
            <div className="relative aspect-4/3 bg-[#f5f5f3] dark:bg-[#1f1f1d]">
                {listing.status === 'pending' && (
                    <span className="absolute top-2 left-2 rounded-sm bg-[#fff2f2] px-2 py-0.5 text-xs font-medium text-[#f53003] shadow-sm dark:bg-[#1D0002] dark:text-[#FF4433]">
                        Em análise
                    </span>
                )}
                {listing.featured_photo_url ? (
                    <img
                        src={listing.featured_photo_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Sem foto
                    </div>
                )}
            </div>
            <div className="p-4">
                <p className="text-xs font-medium tracking-wide text-[#f53003] uppercase dark:text-[#FF4433]">
                    {propertyTypeLabel(listing.type)}
                    {listing.deal === 'aluguel' && ' · Aluguel'}
                    {listing.deal === 'venda' && ' · Venda'}
                </p>
                <h2 className="mt-1 font-semibold group-hover:underline">
                    {listing.street}, {listing.number}
                </h2>
                <p className="mt-0.5 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                    {[
                        listing.neighborhood,
                        `${listing.city} - ${listing.state}`,
                    ]
                        .filter(Boolean)
                        .join(', ')}
                </p>
                {listing.price !== null && (
                    <p className="mt-2 text-lg font-semibold tabular-nums">
                        {formatListingPrice(listing.price, listing.deal)}
                    </p>
                )}
                {details.length > 0 && (
                    <p className="mt-2 text-sm">{details.join(' · ')}</p>
                )}
                {listing.status === 'pending' && (
                    <p className="mt-3 border-t border-[#e3e3e0] pt-3 text-sm dark:border-[#3E3E3A]">
                        <span className="font-medium text-[#f53003] dark:text-[#FF4433]">
                            Em análise
                        </span>{' '}
                        <span className="text-[#706f6c] dark:text-[#A1A09A]">
                            · aguardando aprovação para aparecer na pesquisa
                        </span>
                    </p>
                )}
            </div>
        </Link>
    );
}
