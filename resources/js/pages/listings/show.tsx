import { Head, Link } from '@inertiajs/react';
import { Fragment, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import {
    featureFields,
    nearbyFields,
    photoRoomLabel,
    propertyTypeLabel,
    roomFields,
} from '@/lib/listing-options';
import { formatListingPrice } from '@/lib/price';
import { cn } from '@/lib/utils';
import { approve, destroy, edit } from '@/routes/listings';
import { download } from '@/routes/listings/documents';
import type { ListingDetails } from '@/types';

const fileSize = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

function formatFileSize(bytes: number) {
    return bytes < 1024 * 1024
        ? `${fileSize.format(bytes / 1024)} KB`
        : `${fileSize.format(bytes / (1024 * 1024))} MB`;
}

function OptionsSection({
    title,
    options,
    selected,
}: {
    title: string;
    options: { name: string; label: string }[];
    selected: string[];
}) {
    return (
        <section className="mt-8">
            <h2 className="font-semibold">{title}</h2>
            <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {options.map((option) => {
                    const checked = selected.includes(option.name);

                    return (
                        <li
                            key={option.name}
                            className={cn(
                                'flex items-center gap-2',
                                !checked &&
                                    'text-[#706f6c] dark:text-[#A1A09A]',
                            )}
                        >
                            <span
                                aria-hidden="true"
                                className={cn(
                                    'flex size-4 shrink-0 items-center justify-center rounded-sm border text-[10px] leading-none',
                                    checked
                                        ? 'border-[#1b1b18] bg-[#1b1b18] text-white dark:border-[#EDEDEC] dark:bg-[#EDEDEC] dark:text-[#1b1b18]'
                                        : 'border-[#e3e3e0] dark:border-[#3E3E3A]',
                                )}
                            >
                                {checked && '✓'}
                            </span>
                            {option.label}
                            <span className="sr-only">
                                {checked ? ': sim' : ': não'}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}

type ShowListingProps = {
    listing: ListingDetails;
    can: { update: boolean; delete: boolean; approve: boolean };
};

export default function ShowListing({ listing, can }: ShowListingProps) {
    const photos = [...listing.photos].sort(
        (a, b) => Number(b.is_featured) - Number(a.is_featured),
    );
    const [activePhotoId, setActivePhotoId] = useState(photos[0]?.id);
    const activePhoto =
        photos.find((photo) => photo.id === activePhotoId) ?? photos[0];

    const cep = `${listing.cep.slice(0, 5)}-${listing.cep.slice(5)}`;

    return (
        <AppLayout>
            <Head title={`${listing.street}, ${listing.number}`} />

            <div
                className={cn(
                    'grid items-start gap-8',
                    activePhoto && 'md:grid-cols-2',
                )}
            >
                {activePhoto && (
                    <section
                        aria-label="Fotos do imóvel"
                        className="md:sticky md:top-6"
                    >
                        <figure className="overflow-hidden rounded-lg bg-[#f5f5f3] dark:bg-[#1f1f1d]">
                            <img
                                src={activePhoto.url}
                                alt={
                                    activePhoto.room
                                        ? photoRoomLabel(activePhoto.room)
                                        : 'Foto do imóvel'
                                }
                                className="aspect-4/3 w-full object-cover"
                            />
                            {activePhoto.room && (
                                <figcaption className="px-4 py-2 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    {photoRoomLabel(activePhoto.room)}
                                </figcaption>
                            )}
                        </figure>

                        {photos.length > 1 && (
                            <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                                {photos.map((photo, index) => (
                                    <li key={photo.id}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setActivePhotoId(photo.id)
                                            }
                                            aria-label={`Ver foto ${index + 1}${photo.room ? ` (${photoRoomLabel(photo.room)})` : ''}`}
                                            aria-pressed={
                                                photo.id === activePhoto.id
                                            }
                                            className={cn(
                                                'block w-full overflow-hidden rounded-md border-2',
                                                photo.id === activePhoto.id
                                                    ? 'border-[#1b1b18] dark:border-[#EDEDEC]'
                                                    : 'border-transparent opacity-80 hover:opacity-100',
                                            )}
                                        >
                                            <img
                                                src={photo.url}
                                                alt=""
                                                loading="lazy"
                                                className="aspect-4/3 w-full object-cover"
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                )}

                <div className="min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium tracking-wide text-[#f53003] uppercase dark:text-[#FF4433]">
                                {propertyTypeLabel(listing.type)}
                                {listing.deal === 'aluguel' && ' · para alugar'}
                                {listing.deal === 'venda' && ' · à venda'}
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold">
                                {listing.street}, {listing.number}
                            </h1>
                            <p className="mt-1 text-[#706f6c] dark:text-[#A1A09A]">
                                {[
                                    listing.neighborhood,
                                    `${listing.city} - ${listing.state}`,
                                    `CEP ${cep}`,
                                ]
                                    .filter(Boolean)
                                    .join(', ')}
                            </p>
                            {listing.price !== null && (
                                <p className="mt-3 text-2xl font-semibold tabular-nums">
                                    {formatListingPrice(
                                        listing.price,
                                        listing.deal,
                                    )}
                                </p>
                            )}
                        </div>

                        {(can.update || can.delete) && (
                            <div className="flex gap-2">
                                {can.update && (
                                    <Link
                                        href={edit(listing.id)}
                                        className="rounded-md border border-[#e3e3e0] px-4 py-2 text-sm font-medium hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:hover:border-[#EDEDEC]"
                                    >
                                        Editar
                                    </Link>
                                )}
                                {can.delete && (
                                    <Link
                                        href={destroy(listing.id)}
                                        as="button"
                                        onBefore={() =>
                                            window.confirm(
                                                'Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.',
                                            )
                                        }
                                        className="rounded-md border border-[#f53003] px-4 py-2 text-sm font-medium text-[#f53003] hover:bg-[#fff2f2] dark:border-[#FF4433] dark:text-[#FF4433] dark:hover:bg-[#1D0002]"
                                    >
                                        Excluir
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {listing.status === 'pending' && (
                        <div
                            role="status"
                            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#f53003] bg-[#fff2f2] px-4 py-3 text-sm dark:border-[#FF4433] dark:bg-[#1D0002]"
                        >
                            <p>
                                <strong className="font-medium text-[#f53003] dark:text-[#FF4433]">
                                    Em análise.
                                </strong>{' '}
                                Este anúncio ainda não aparece na pesquisa. Ele
                                será exibido depois de aprovado por um
                                administrador.
                            </p>
                            {can.approve && (
                                <Link
                                    href={approve(listing.id)}
                                    as="button"
                                    className="rounded-md bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:bg-black dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                                >
                                    Aprovar anúncio
                                </Link>
                            )}
                        </div>
                    )}

                    <section className="mt-8">
                        <h2 className="font-semibold">
                            Características do imóvel
                        </h2>
                        <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
                            {roomFields.map((room) => (
                                <div
                                    key={room.name}
                                    className="flex justify-between gap-3"
                                >
                                    <dt>{room.label}</dt>
                                    <dd className="font-medium tabular-nums">
                                        {listing[room.name]}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    <OptionsSection
                        title="Itens do imóvel"
                        options={featureFields}
                        selected={listing.features}
                    />

                    <OptionsSection
                        title="Pontos de interesse próximos"
                        options={nearbyFields}
                        selected={listing.nearby_places}
                    />

                    <section className="mt-8">
                        <h2 className="font-semibold">Endereço do imóvel</h2>
                        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                            {[
                                ['CEP', cep],
                                ['Endereço', listing.street],
                                ['Número', listing.number],
                                ['Bairro', listing.neighborhood ?? '—'],
                                ['Cidade', listing.city],
                                ['Estado', listing.state],
                            ].map(([label, value]) => (
                                <Fragment key={label}>
                                    <dt className="text-[#706f6c] dark:text-[#A1A09A]">
                                        {label}
                                    </dt>
                                    <dd className="font-medium">{value}</dd>
                                </Fragment>
                            ))}
                        </dl>
                    </section>

                    {can.update && listing.documents.length > 0 && (
                        <section className="mt-8">
                            <h2 className="font-semibold">Documentação</h2>
                            <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                Visível apenas para você e para os
                                administradores.
                            </p>
                            <ul className="mt-3 flex flex-col gap-2">
                                {listing.documents.map((pdf) => (
                                    <li
                                        key={pdf.id}
                                        className="flex items-center justify-between gap-3 rounded-md border border-[#e3e3e0] px-3 py-2 text-sm dark:border-[#3E3E3A]"
                                    >
                                        <span className="min-w-0 truncate">
                                            {pdf.name}
                                        </span>
                                        <span className="flex shrink-0 items-center gap-3">
                                            <span className="text-[#706f6c] tabular-nums dark:text-[#A1A09A]">
                                                {formatFileSize(pdf.size)}
                                            </span>
                                            <a
                                                href={
                                                    download({
                                                        listing: listing.id,
                                                        document: pdf.id,
                                                    }).url
                                                }
                                                className="font-medium underline underline-offset-2"
                                            >
                                                Baixar
                                            </a>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
