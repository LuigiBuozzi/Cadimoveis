// Keep these keys in sync with the constants on App\Models\Listing and
// App\Models\ListingPhoto.

export const propertyTypes = [
    { value: 'casa-terrea', label: 'Casa térrea' },
    { value: 'apartamento', label: 'Apartamento' },
    { value: 'sobrado', label: 'Sobrado' },
    { value: 'imovel-rural', label: 'Imóvel rural' },
];

export const listingDeals = [
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'venda', label: 'Venda' },
];

export const roomFields = [
    { name: 'bedrooms', label: 'Quarto' },
    { name: 'suites', label: 'Suíte' },
    { name: 'kitchens', label: 'Cozinha' },
    { name: 'laundry_rooms', label: 'Lavanderia' },
    { name: 'living_rooms', label: 'Sala de estar' },
    { name: 'dining_rooms', label: 'Sala de jantar' },
    { name: 'bathrooms', label: 'Banheiro' },
    { name: 'half_bathrooms', label: 'Lavabo' },
    { name: 'pantries', label: 'Copa' },
] as const;

export const featureFields = [
    { name: 'has_garden', label: 'Possui jardim' },
    { name: 'has_electric_fence', label: 'Possui cerca elétrica' },
    { name: 'has_paved_street', label: 'Possui asfalto' },
    { name: 'has_garage', label: 'Possui garagem' },
    { name: 'has_alarm', label: 'Possui alarme' },
    { name: 'has_barbecue', label: 'Possui churrasqueira' },
];

export const nearbyFields = [
    { name: 'near_hospital', label: 'Hospital' },
    { name: 'near_college', label: 'Faculdade' },
    { name: 'near_state_school', label: 'Escola estadual' },
    { name: 'near_municipal_school', label: 'Escola municipal' },
    { name: 'near_private_school', label: 'Escola privada' },
    { name: 'near_supermarket', label: 'Supermercado' },
    { name: 'near_market', label: 'Mercado' },
    { name: 'near_convenience_store', label: 'Conveniência' },
    { name: 'near_park', label: 'Parque' },
    { name: 'near_bakery', label: 'Padaria' },
    { name: 'near_pharmacy', label: 'Farmácia' },
    { name: 'near_shopping_mall', label: 'Shopping' },
];

export const photoRooms = [
    { value: 'quarto', label: 'Quarto' },
    { value: 'sala-de-estar', label: 'Sala de estar' },
    { value: 'cozinha', label: 'Cozinha' },
    { value: 'fundo', label: 'Fundo' },
    { value: 'fachada', label: 'Fachada' },
    { value: 'sacada', label: 'Sacada' },
    { value: 'banheiro', label: 'Banheiro' },
    { value: 'lavabo', label: 'Lavabo' },
    { value: 'corredor', label: 'Corredor' },
];

export function propertyTypeLabel(type: string) {
    return propertyTypes.find((option) => option.value === type)?.label ?? type;
}

export function photoRoomLabel(room: string) {
    return photoRooms.find((option) => option.value === room)?.label ?? room;
}
