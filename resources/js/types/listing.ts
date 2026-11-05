import type { roomFields } from '@/lib/listing-options';

export type RoomName = (typeof roomFields)[number]['name'];

export type ListingStatus = 'pending' | 'approved';

export type ListingDeal = 'aluguel' | 'venda';

export type ListingSummary = {
    id: number;
    type: string;
    status: ListingStatus;
    // Empty only for listings created before these fields existed.
    deal: ListingDeal | null;
    price: number | null;
    street: string;
    number: string;
    neighborhood: string | null;
    city: string;
    state: string;
    bedrooms: number;
    suites: number;
    bathrooms: number;
    featured_photo_url: string | null;
};

export type ListingPhoto = {
    id: number;
    url: string;
    room: string | null;
    is_featured: boolean;
};

export type ListingDocument = {
    id: number;
    name: string;
    size: number;
};

export type ListingDetails = ListingSummary &
    Record<RoomName, number> & {
        cep: string;
        features: string[];
        nearby_places: string[];
        photos: ListingPhoto[];
        documents: ListingDocument[];
    };

export type ListingFormData = Record<RoomName, number> & {
    id: number;
    type: string;
    deal: ListingDeal | null;
    price: number | null;
    cep: string;
    street: string;
    number: string;
    neighborhood: string | null;
    city: string;
    state: string;
    features: string[];
    nearby_places: string[];
};

export type UploadLimits = {
    maxFileSize: number;
    maxPostSize: number;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};
