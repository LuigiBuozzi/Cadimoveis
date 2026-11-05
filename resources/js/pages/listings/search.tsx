import { Form, Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ListingCard from '@/components/listings/listing-card';
import PriceInput from '@/components/price-input';
import AppLayout from '@/layouts/app-layout';
import { propertyTypes } from '@/lib/listing-options';
import { formatCurrency, priceDigits } from '@/lib/price';
import { search } from '@/routes/listings';
import type { ListingSummary, Paginated } from '@/types';

const dealTypes = [
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'compra', label: 'Compra' },
];

const states = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
];

const fieldClassName =
    'w-full min-w-0 rounded-md border border-[#e3e3e0] bg-white px-3 py-2 text-sm outline-none focus:border-[#1b1b18] focus:ring-1 focus:ring-[#1b1b18] disabled:opacity-50 dark:border-[#3E3E3A] dark:bg-[#161615] dark:focus:border-[#EDEDEC] dark:focus:ring-[#EDEDEC]';

type CitiesStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Loads the municipalities of a state from the IBGE public API.
 */
function useCities(state: string) {
    const [cities, setCities] = useState<string[]>([]);
    const [status, setStatus] = useState<CitiesStatus>('idle');

    useEffect(() => {
        if (!state) {
            setCities([]);
            setStatus('idle');

            return;
        }

        const controller = new AbortController();
        setStatus('loading');

        fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`,
            { signal: controller.signal },
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`IBGE respondeu ${response.status}`);
                }

                return response.json() as Promise<{ nome: string }[]>;
            })
            .then((data) => {
                setCities(data.map((city) => city.nome));
                setStatus('loaded');
            })
            .catch(() => {
                if (!controller.signal.aborted) {
                    setCities([]);
                    setStatus('error');
                }
            });

        return () => controller.abort();
    }, [state]);

    return { cities, status };
}

export default function SearchListings({
    listings,
}: {
    listings: Paginated<ListingSummary>;
}) {
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const query = params.get('q') ?? '';
    const type = params.get('type') ?? '';
    const typeLabel = propertyTypes.find(
        (option) => option.value === type,
    )?.label;
    const deal = params.get('deal') ?? '';
    const dealLabel = dealTypes.find((option) => option.value === deal)?.label;
    const searchedState = params.get('state') ?? '';
    const searchedCity = params.get('city') ?? '';

    const [state, setState] = useState(searchedState);
    const [city, setCity] = useState(searchedCity);
    const { cities, status: citiesStatus } = useCities(state);

    const location = [searchedCity, searchedState].filter(Boolean).join(' - ');

    const searchedMinPrice = Number(params.get('min_price')) || 0;
    const searchedMaxPrice = Number(params.get('max_price')) || 0;

    const [minPrice, setMinPrice] = useState(
        priceDigits(params.get('min_price') ?? ''),
    );
    const [maxPrice, setMaxPrice] = useState(
        priceDigits(params.get('max_price') ?? ''),
    );
    const priceError =
        minPrice !== '' &&
        maxPrice !== '' &&
        Number(minPrice) > Number(maxPrice);

    let priceRange = '';

    if (searchedMinPrice && searchedMaxPrice) {
        priceRange = ` entre ${formatCurrency(searchedMinPrice)} e ${formatCurrency(searchedMaxPrice)}`;
    } else if (searchedMinPrice) {
        priceRange = ` a partir de ${formatCurrency(searchedMinPrice)}`;
    } else if (searchedMaxPrice) {
        priceRange = ` até ${formatCurrency(searchedMaxPrice)}`;
    }

    return (
        <AppLayout>
            <Head title="Pesquisar" />

            <h1 className="text-2xl font-semibold">Pesquisar imóveis</h1>
            <p className="mt-1 text-[#706f6c] dark:text-[#A1A09A]">
                Busque por bairro, localização ou tipo de imóvel.
            </p>

            <Form
                {...search.form()}
                role="search"
                className="mt-6 flex flex-col gap-3"
            >
                <label htmlFor="q" className="sr-only">
                    Pesquisar imóveis
                </label>
                <input
                    id="q"
                    name="q"
                    type="search"
                    defaultValue={query}
                    placeholder="Ex.: Moema, perto do metrô"
                    className={fieldClassName}
                />

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label htmlFor="type" className="sr-only">
                        Tipo de imóvel
                    </label>
                    <select
                        id="type"
                        name="type"
                        defaultValue={type}
                        className={fieldClassName}
                    >
                        <option value="">Todos os tipos</option>
                        {propertyTypes.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="deal" className="sr-only">
                        Aluguel ou compra
                    </label>
                    <select
                        id="deal"
                        name="deal"
                        defaultValue={deal}
                        className={fieldClassName}
                    >
                        <option value="">Aluguel ou compra</option>
                        {dealTypes.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="state" className="sr-only">
                        Estado
                    </label>
                    <select
                        id="state"
                        name="state"
                        value={state}
                        onChange={(event) => {
                            setState(event.target.value);
                            setCity('');
                        }}
                        className={fieldClassName}
                    >
                        <option value="">Todos os estados</option>
                        {states.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <label htmlFor="city" className="sr-only">
                        Município
                    </label>
                    <select
                        id="city"
                        name="city"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        disabled={citiesStatus !== 'loaded'}
                        aria-describedby={
                            citiesStatus === 'error' ? 'city-error' : undefined
                        }
                        className={fieldClassName}
                    >
                        <option value="">
                            {citiesStatus === 'idle' &&
                                'Selecione um estado primeiro'}
                            {citiesStatus === 'loading' &&
                                'Carregando municípios...'}
                            {citiesStatus === 'loaded' && 'Todos os municípios'}
                            {citiesStatus === 'error' &&
                                'Municípios indisponíveis'}
                        </option>
                        {cities.map((name) => (
                            <option key={name} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                </div>

                {citiesStatus === 'error' && (
                    <p
                        id="city-error"
                        className="text-sm text-[#f53003] dark:text-[#FF4433]"
                    >
                        Não foi possível carregar os municípios. Tente novamente
                        mais tarde.
                    </p>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                    <PriceInput
                        id="min_price"
                        label="Valor mínimo"
                        placeholder="Sem limite"
                        inputClassName={fieldClassName}
                        value={minPrice}
                        invalid={priceError}
                        describedBy={priceError ? 'price-error' : undefined}
                        onChange={setMinPrice}
                    />
                    <PriceInput
                        id="max_price"
                        label="Valor máximo"
                        placeholder="Sem limite"
                        inputClassName={fieldClassName}
                        value={maxPrice}
                        invalid={priceError}
                        describedBy={priceError ? 'price-error' : undefined}
                        onChange={setMaxPrice}
                    />
                </div>

                {priceError && (
                    <p
                        id="price-error"
                        className="text-sm text-[#f53003] dark:text-[#FF4433]"
                    >
                        O valor mínimo não pode ser maior que o valor máximo.
                    </p>
                )}

                <button
                    type="submit"
                    disabled={priceError}
                    className="self-start rounded-md bg-[#1b1b18] px-6 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                >
                    Pesquisar
                </button>
            </Form>

            <section className="mt-10" aria-labelledby="results-heading">
                <h2
                    id="results-heading"
                    className="text-sm text-[#706f6c] dark:text-[#A1A09A]"
                >
                    {listings.total === 0
                        ? 'Nenhum imóvel encontrado'
                        : `${listings.total} ${listings.total === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`}
                    {typeLabel && ` do tipo ${typeLabel.toLowerCase()}`}
                    {dealLabel && ` para ${dealLabel.toLowerCase()}`}
                    {location && ` em ${location}`}
                    {priceRange}
                    {query && ` com “${query}”`}.
                </h2>

                {listings.data.length > 0 && (
                    <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.data.map((listing) => (
                            <li key={listing.id}>
                                <ListingCard listing={listing} />
                            </li>
                        ))}
                    </ul>
                )}

                {listings.last_page > 1 && (
                    <nav
                        aria-label="Paginação"
                        className="mt-6 flex items-center justify-between gap-4 text-sm"
                    >
                        {listings.prev_page_url ? (
                            <Link
                                href={listings.prev_page_url}
                                className="rounded-md border border-[#e3e3e0] px-4 py-2 font-medium hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:hover:border-[#EDEDEC]"
                            >
                                Anterior
                            </Link>
                        ) : (
                            <span />
                        )}
                        <span className="text-[#706f6c] dark:text-[#A1A09A]">
                            Página {listings.current_page} de{' '}
                            {listings.last_page}
                        </span>
                        {listings.next_page_url ? (
                            <Link
                                href={listings.next_page_url}
                                className="rounded-md border border-[#e3e3e0] px-4 py-2 font-medium hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:hover:border-[#EDEDEC]"
                            >
                                Próxima
                            </Link>
                        ) : (
                            <span />
                        )}
                    </nav>
                )}
            </section>
        </AppLayout>
    );
}
