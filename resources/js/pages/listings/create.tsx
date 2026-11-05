import { Form, Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import PhotoPicker from '@/components/listings/photo-picker';
import type { PhotoPickerState } from '@/components/listings/photo-picker';
import PriceInput from '@/components/price-input';
import AppLayout from '@/layouts/app-layout';
import {
    featureFields,
    listingDeals,
    nearbyFields,
    propertyTypes,
    roomFields,
} from '@/lib/listing-options';
import { store, update } from '@/routes/listings';
import type { ListingFormData, UploadLimits } from '@/types';

const inputClassName =
    'w-full rounded-md border border-[#e3e3e0] bg-[#FDFDFC] px-3 py-2 text-sm outline-none focus:border-[#1b1b18] focus:ring-1 focus:ring-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:focus:border-[#EDEDEC] dark:focus:ring-[#EDEDEC]';

const primaryButtonClassName =
    'rounded-md bg-[#1b1b18] px-6 py-2 text-sm font-medium text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white';

// Fields shown in step 2. Errors on any other field send the user back to
// step 1.
const stepTwoFields = ['photos', 'photo_rooms', 'featured_photo'];

type CepStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'error';

type CepLocation = {
    neighborhood: string;
    city: string;
    state: string;
};

type ViaCepResponse =
    | { erro: true | 'true' }
    | {
          logradouro: string;
          bairro: string;
          localidade: string;
          uf: string;
      };

const maxDocumentSizeMb = 10;

const fileSize = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
});

function formatFileSize(bytes: number) {
    return bytes < 1024 * 1024
        ? `${fileSize.format(bytes / 1024)} KB`
        : `${fileSize.format(bytes / (1024 * 1024))} MB`;
}

function formatCep(digits: string) {
    return digits.length > 5
        ? `${digits.slice(0, 5)}-${digits.slice(5)}`
        : digits;
}

type ListingFormProps = {
    uploadLimits: UploadLimits;
    // Present when editing an existing listing.
    listing?: ListingFormData;
};

export default function ListingForm({
    uploadLimits,
    listing,
}: ListingFormProps) {
    const isEditing = listing !== undefined;
    const [step, setStep] = useState<1 | 2>(1);
    const [photosState, setPhotosState] = useState<PhotoPickerState>({
        hasFeatured: false,
        totalSize: 0,
    });
    const [type, setType] = useState(listing?.type ?? '');
    const [cep, setCep] = useState(listing?.cep ?? '');
    const [cepStatus, setCepStatus] = useState<CepStatus>(
        listing ? 'found' : 'idle',
    );
    const [street, setStreet] = useState(listing?.street ?? '');
    const [number, setNumber] = useState(listing?.number ?? '');
    const [deal, setDeal] = useState<string>(listing?.deal ?? '');
    const [price, setPrice] = useState(
        listing?.price ? String(listing.price) : '',
    );
    const [location, setLocation] = useState<CepLocation | null>(
        listing
            ? {
                  neighborhood: listing.neighborhood ?? '',
                  city: listing.city,
                  state: listing.state,
              }
            : null,
    );
    const latestCep = useRef(listing?.cep ?? '');
    const streetInput = useRef<HTMLInputElement>(null);
    const numberInput = useRef<HTMLInputElement>(null);
    const [documents, setDocuments] = useState<File[]>([]);
    const [rejectedDocuments, setRejectedDocuments] = useState<string[]>([]);
    const documentsInput = useRef<HTMLInputElement>(null);

    const maxDocumentSize = Math.min(
        maxDocumentSizeMb * 1024 * 1024,
        uploadLimits.maxFileSize,
    );

    /**
     * Looks up the address of a CEP on ViaCEP and fills in the address fields.
     */
    async function lookUpCep(digits: string) {
        latestCep.current = digits;
        setCepStatus('loading');
        setLocation(null);

        try {
            const response = await fetch(
                `https://viacep.com.br/ws/${digits}/json/`,
            );

            if (!response.ok) {
                throw new Error(`ViaCEP respondeu ${response.status}`);
            }

            const data = (await response.json()) as ViaCepResponse;

            // Ignore answers for a CEP the user has since changed.
            if (latestCep.current !== digits) {
                return;
            }

            if ('erro' in data) {
                setCepStatus('not-found');

                return;
            }

            setCepStatus('found');
            setLocation({
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf,
            });

            // Some CEPs cover a whole city and have no street.
            if (data.logradouro) {
                setStreet(data.logradouro);
                numberInput.current?.focus();
            } else {
                setStreet('');
                streetInput.current?.focus();
            }
        } catch {
            if (latestCep.current === digits) {
                setCepStatus('error');
            }
        }
    }

    /**
     * Keeps the file input in sync with the list shown on screen, so the
     * removed files are not sent with the form.
     */
    function updateDocuments(files: File[]) {
        const transfer = new DataTransfer();
        files.forEach((file) => transfer.items.add(file));

        if (documentsInput.current) {
            documentsInput.current.files = transfer.files;
        }

        setDocuments(files);
    }

    function handleDocumentsChange(selected: FileList | null) {
        const accepted: File[] = [];
        const rejected: string[] = [];

        Array.from(selected ?? []).forEach((file) => {
            const isPdf =
                file.type === 'application/pdf' ||
                file.name.toLowerCase().endsWith('.pdf');

            if (!isPdf) {
                rejected.push(`${file.name}: apenas arquivos PDF são aceitos.`);
            } else if (file.size > maxDocumentSize) {
                rejected.push(
                    `${file.name}: o arquivo passa de ${formatFileSize(maxDocumentSize)}.`,
                );
            } else if (
                !documents.some(
                    (pdf) => pdf.name === file.name && pdf.size === file.size,
                )
            ) {
                accepted.push(file);
            }
        });

        setRejectedDocuments(rejected);
        updateDocuments([...documents, ...accepted]);
    }

    function handleCepChange(value: string) {
        const digits = value.replace(/\D/g, '').slice(0, 8);

        setCep(digits);

        if (digits.length === 8 && digits !== latestCep.current) {
            void lookUpCep(digits);
        } else if (digits.length < 8) {
            latestCep.current = '';
            setCepStatus('idle');
            setLocation(null);
        }
    }

    function goToStep(next: 1 | 2) {
        setStep(next);
        window.scrollTo({ top: 0 });
    }

    const canContinue =
        type !== '' &&
        cep.length === 8 &&
        location !== null &&
        street.trim() !== '' &&
        number.trim() !== '' &&
        deal !== '' &&
        price !== '';

    const uploadSize =
        photosState.totalSize +
        documents.reduce((total, pdf) => total + pdf.size, 0);
    // Leave some room for the other form fields.
    const uploadTooLarge = uploadSize > uploadLimits.maxPostSize * 0.95;

    const formAttributes = listing ? update.form(listing.id) : store.form();

    return (
        <AppLayout>
            <Head title={isEditing ? 'Editar anúncio' : 'Anunciar'} />

            <h1 className="text-2xl font-semibold">
                {isEditing ? 'Editar anúncio' : 'Anunciar um imóvel'}
            </h1>
            <p className="mt-1 text-[#706f6c] dark:text-[#A1A09A]">
                {isEditing &&
                    'Altere as informações do imóvel e salve as alterações. Depois de salvo, o anúncio volta para análise e sai da pesquisa até ser aprovado novamente.'}
                {!isEditing &&
                    step === 1 &&
                    'Etapa 1: preencha as informações do imóvel que você deseja anunciar.'}
                {!isEditing &&
                    step === 2 &&
                    'Etapa 2: adicione as fotos do imóvel e escolha a de destaque.'}
            </p>

            <Form
                {...formAttributes}
                noValidate
                onError={(errors) => {
                    const hasStepOneError = Object.keys(errors).some(
                        (field) => !stepTwoFields.includes(field.split('.')[0]),
                    );

                    goToStep(hasStepOneError ? 1 : 2);
                }}
                className="mt-6 max-w-xl rounded-lg border border-[#e3e3e0] bg-white p-6 dark:border-[#3E3E3A] dark:bg-[#161615]"
            >
                {({ errors, processing }) => (
                    <>
                        {Object.keys(errors).length > 0 && (
                            <div
                                role="alert"
                                className="mb-6 rounded-md border border-[#f53003] bg-[#fff2f2] p-4 text-sm text-[#f53003] dark:border-[#FF4433] dark:bg-[#1D0002] dark:text-[#FF4433]"
                            >
                                <p className="font-medium">
                                    Corrija os itens abaixo para continuar:
                                </p>
                                <ul className="mt-2 list-disc pl-5">
                                    {[...new Set(Object.values(errors))].map(
                                        (message) => (
                                            <li key={message}>{message}</li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Step 1 stays mounted while hidden so its values are kept. */}
                        <div hidden={step !== 1}>
                            <div className="flex flex-col gap-1.5">
                                <label
                                    htmlFor="type"
                                    className="text-sm font-medium"
                                >
                                    Tipo do imóvel
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={type}
                                    onChange={(event) =>
                                        setType(event.target.value)
                                    }
                                    required
                                    className={inputClassName}
                                >
                                    <option value="" disabled>
                                        Selecione o tipo do imóvel
                                    </option>
                                    {propertyTypes.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <fieldset className="mt-6">
                                <legend className="text-sm font-medium">
                                    Características do imóvel
                                </legend>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Informe a quantidade de cada cômodo.
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                                    {roomFields.map((room) => (
                                        <div
                                            key={room.name}
                                            className="flex flex-col gap-1.5"
                                        >
                                            <label
                                                htmlFor={room.name}
                                                className="text-sm"
                                            >
                                                {room.label}
                                            </label>
                                            <input
                                                id={room.name}
                                                name={room.name}
                                                type="number"
                                                inputMode="numeric"
                                                min={0}
                                                max={99}
                                                step={1}
                                                defaultValue={
                                                    listing?.[room.name] ?? 0
                                                }
                                                className={`${inputClassName} tabular-nums`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </fieldset>

                            <fieldset className="mt-6">
                                <legend className="text-sm font-medium">
                                    Itens do imóvel
                                </legend>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Marque o que o imóvel possui.
                                </p>

                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {featureFields.map((feature) => (
                                        <label
                                            key={feature.name}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                name={feature.name}
                                                value="1"
                                                defaultChecked={listing?.features.includes(
                                                    feature.name,
                                                )}
                                                className="size-4 accent-[#1b1b18] dark:accent-[#EDEDEC]"
                                            />
                                            {feature.label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <fieldset className="mt-6">
                                <legend className="text-sm font-medium">
                                    Pontos de interesse próximos
                                </legend>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Marque o que existe perto do imóvel.
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {nearbyFields.map((place) => (
                                        <label
                                            key={place.name}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type="checkbox"
                                                name={place.name}
                                                value="1"
                                                defaultChecked={listing?.nearby_places.includes(
                                                    place.name,
                                                )}
                                                className="size-4 accent-[#1b1b18] dark:accent-[#EDEDEC]"
                                            />
                                            {place.label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <fieldset className="mt-6">
                                <legend className="text-sm font-medium">
                                    Endereço do imóvel
                                </legend>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Digite o CEP para preencher o endereço
                                    automaticamente.
                                </p>

                                <div className="mt-4 flex flex-col gap-1.5">
                                    <label htmlFor="cep" className="text-sm">
                                        CEP
                                    </label>
                                    <input
                                        id="cep"
                                        name="cep"
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="postal-code"
                                        placeholder="00000-000"
                                        required
                                        value={formatCep(cep)}
                                        onChange={(event) =>
                                            handleCepChange(event.target.value)
                                        }
                                        aria-invalid={
                                            cepStatus === 'not-found' ||
                                            undefined
                                        }
                                        aria-describedby="cep-status"
                                        className={`${inputClassName} tabular-nums aria-invalid:border-[#f53003] sm:w-40 dark:aria-invalid:border-[#FF4433]`}
                                    />
                                    <div
                                        id="cep-status"
                                        aria-live="polite"
                                        className={
                                            cepStatus === 'not-found' ||
                                            cepStatus === 'error'
                                                ? 'text-sm text-[#f53003] dark:text-[#FF4433]'
                                                : 'text-sm text-[#706f6c] dark:text-[#A1A09A]'
                                        }
                                    >
                                        {cepStatus === 'loading' &&
                                            'Buscando endereço...'}
                                        {cepStatus === 'found' &&
                                            location &&
                                            [
                                                location.neighborhood,
                                                `${location.city} - ${location.state}`,
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
                                        {cepStatus === 'not-found' &&
                                            'CEP não encontrado. Confira o número digitado.'}
                                        {cepStatus === 'error' && (
                                            <>
                                                Não foi possível buscar o
                                                endereço.{' '}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        void lookUpCep(cep)
                                                    }
                                                    className="font-medium underline underline-offset-2"
                                                >
                                                    Tentar novamente
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {location && (
                                    <>
                                        <input
                                            type="hidden"
                                            name="neighborhood"
                                            value={location.neighborhood}
                                        />
                                        <input
                                            type="hidden"
                                            name="city"
                                            value={location.city}
                                        />
                                        <input
                                            type="hidden"
                                            name="state"
                                            value={location.state}
                                        />
                                    </>
                                )}

                                <div className="mt-4 flex gap-4">
                                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                        <label
                                            htmlFor="street"
                                            className="text-sm"
                                        >
                                            Endereço
                                        </label>
                                        <input
                                            ref={streetInput}
                                            id="street"
                                            name="street"
                                            type="text"
                                            autoComplete="address-line1"
                                            placeholder="Ex.: Rua das Flores"
                                            required
                                            value={street}
                                            onChange={(event) =>
                                                setStreet(event.target.value)
                                            }
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div className="flex w-28 flex-col gap-1.5">
                                        <label
                                            htmlFor="number"
                                            className="text-sm"
                                        >
                                            Número
                                        </label>
                                        <input
                                            ref={numberInput}
                                            id="number"
                                            name="number"
                                            type="text"
                                            placeholder="Ex.: 123"
                                            maxLength={10}
                                            required
                                            value={number}
                                            onChange={(event) =>
                                                setNumber(event.target.value)
                                            }
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            <fieldset className="mt-6">
                                <legend className="text-sm font-medium">
                                    Aluguel ou venda
                                </legend>
                                <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Informe se o imóvel é para alugar ou vender
                                    e o valor pedido.
                                </p>

                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div className="flex flex-col gap-1.5">
                                        <label
                                            htmlFor="deal"
                                            className="text-sm font-medium"
                                        >
                                            Tipo de negócio
                                        </label>
                                        <select
                                            id="deal"
                                            name="deal"
                                            value={deal}
                                            onChange={(event) =>
                                                setDeal(event.target.value)
                                            }
                                            required
                                            className={inputClassName}
                                        >
                                            <option value="" disabled>
                                                Selecione
                                            </option>
                                            {listingDeals.map((option) => (
                                                <option
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <PriceInput
                                        id="price"
                                        label={
                                            deal === 'aluguel'
                                                ? 'Valor do aluguel (por mês)'
                                                : deal === 'venda'
                                                  ? 'Valor de venda'
                                                  : 'Valor'
                                        }
                                        value={price}
                                        onChange={setPrice}
                                        placeholder="0"
                                        required
                                        inputClassName={inputClassName}
                                    />
                                </div>
                            </fieldset>

                            {!isEditing && (
                                <fieldset className="mt-6">
                                    <legend className="text-sm font-medium">
                                        Documentação
                                    </legend>
                                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        Envie os documentos do imóvel em PDF
                                        (até {formatFileSize(maxDocumentSize)}{' '}
                                        cada). Apenas você e os administradores
                                        podem vê-los.
                                    </p>

                                    <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#e3e3e0] bg-[#FDFDFC] px-4 py-6 text-center text-sm focus-within:border-[#1b1b18] focus-within:ring-1 focus-within:ring-[#1b1b18] hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:focus-within:border-[#EDEDEC] dark:focus-within:ring-[#EDEDEC] dark:hover:border-[#EDEDEC]">
                                        <span className="font-medium">
                                            Clique para selecionar arquivos PDF
                                        </span>
                                        <span className="text-[#706f6c] dark:text-[#A1A09A]">
                                            Você pode enviar mais de um arquivo.
                                        </span>
                                        <input
                                            ref={documentsInput}
                                            name="documents[]"
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            multiple
                                            onChange={(event) => {
                                                handleDocumentsChange(
                                                    event.target.files,
                                                );
                                            }}
                                            className="sr-only"
                                        />
                                    </label>

                                    {rejectedDocuments.length > 0 && (
                                        <ul
                                            role="alert"
                                            className="mt-3 flex flex-col gap-1 text-sm text-[#f53003] dark:text-[#FF4433]"
                                        >
                                            {rejectedDocuments.map(
                                                (message) => (
                                                    <li key={message}>
                                                        {message}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}

                                    {documents.length > 0 && (
                                        <ul className="mt-3 flex flex-col gap-2">
                                            {documents.map((pdf, index) => (
                                                <li
                                                    key={`${pdf.name}-${pdf.size}`}
                                                    className="flex items-center justify-between gap-3 rounded-md border border-[#e3e3e0] px-3 py-2 text-sm dark:border-[#3E3E3A]"
                                                >
                                                    <span className="min-w-0 truncate">
                                                        {pdf.name}
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-3">
                                                        <span className="text-[#706f6c] tabular-nums dark:text-[#A1A09A]">
                                                            {formatFileSize(
                                                                pdf.size,
                                                            )}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateDocuments(
                                                                    documents.filter(
                                                                        (
                                                                            _,
                                                                            i,
                                                                        ) =>
                                                                            i !==
                                                                            index,
                                                                    ),
                                                                )
                                                            }
                                                            aria-label={`Remover ${pdf.name}`}
                                                            className="font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
                                                        >
                                                            Remover
                                                        </button>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </fieldset>
                            )}

                            <div className="mt-8 flex flex-col items-end gap-2">
                                {isEditing ? (
                                    <button
                                        type="submit"
                                        disabled={!canContinue || processing}
                                        aria-describedby={
                                            canContinue
                                                ? undefined
                                                : 'continue-hint'
                                        }
                                        className={primaryButtonClassName}
                                    >
                                        {processing
                                            ? 'Salvando...'
                                            : 'Salvar alterações'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => goToStep(2)}
                                        disabled={!canContinue}
                                        aria-describedby={
                                            canContinue
                                                ? undefined
                                                : 'continue-hint'
                                        }
                                        className={primaryButtonClassName}
                                    >
                                        Continuar
                                    </button>
                                )}
                                {!canContinue && (
                                    <p
                                        id="continue-hint"
                                        className="text-right text-sm text-[#706f6c] dark:text-[#A1A09A]"
                                    >
                                        Preencha o tipo, o endereço, o tipo de
                                        negócio e o valor do imóvel para
                                        continuar.
                                    </p>
                                )}
                            </div>
                        </div>

                        {!isEditing && (
                            <div hidden={step !== 2}>
                                <h2 className="text-sm font-medium">
                                    Fotos do imóvel
                                </h2>
                                <p className="mt-1 mb-4 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                    Adicione as fotos do imóvel. Clique em uma
                                    foto para marcá-la como destaque.
                                </p>

                                <PhotoPicker
                                    maxFileSize={uploadLimits.maxFileSize}
                                    onChange={setPhotosState}
                                />

                                {uploadTooLarge && (
                                    <p
                                        role="alert"
                                        className="mt-4 text-sm text-[#f53003] dark:text-[#FF4433]"
                                    >
                                        As fotos e os documentos somam{' '}
                                        {formatFileSize(uploadSize)}, acima do
                                        limite de{' '}
                                        {formatFileSize(
                                            uploadLimits.maxPostSize,
                                        )}{' '}
                                        por envio. Remova algumas fotos ou
                                        documentos.
                                    </p>
                                )}

                                <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={() => goToStep(1)}
                                        className="rounded-md border border-[#e3e3e0] px-6 py-2 text-sm font-medium hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:hover:border-[#EDEDEC]"
                                    >
                                        Voltar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            !photosState.hasFeatured ||
                                            uploadTooLarge ||
                                            processing
                                        }
                                        className={primaryButtonClassName}
                                    >
                                        {processing
                                            ? 'Publicando...'
                                            : 'Continuar'}
                                    </button>
                                </div>
                                {!photosState.hasFeatured && (
                                    <p className="mt-2 text-right text-sm text-[#706f6c] dark:text-[#A1A09A]">
                                        Adicione as fotos e escolha uma de
                                        destaque para continuar.
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AppLayout>
    );
}
