import { useEffect, useRef, useState } from 'react';
import { photoRooms } from '@/lib/listing-options';
import { cn } from '@/lib/utils';

const maxOriginalSizeMb = 30;
const maxPhotoDimension = 1920;
const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const fileSize = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

type Photo = {
    key: string;
    file: File;
    previewUrl: string;
};

export type PhotoPickerState = {
    hasFeatured: boolean;
    totalSize: number;
};

type PhotoPickerProps = {
    // The largest file the server accepts, in bytes.
    maxFileSize: number;
    onChange: (state: PhotoPickerState) => void;
};

/**
 * Resizes a photo to at most 1920px and re-encodes it as JPEG, so photos
 * taken with phones fit the server upload limit. Keeps the original file if
 * that does not make it smaller.
 */
async function shrinkPhoto(file: File): Promise<File> {
    try {
        const bitmap = await createImageBitmap(file, {
            imageOrientation: 'from-image',
        });
        const scale = Math.min(
            1,
            maxPhotoDimension / Math.max(bitmap.width, bitmap.height),
        );
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas
            .getContext('2d')
            ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.82),
        );

        if (!blob || blob.size >= file.size) {
            return file;
        }

        return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', {
            type: 'image/jpeg',
            lastModified: file.lastModified,
        });
    } catch {
        return file;
    }
}

/**
 * Lets the user pick the property photos and choose which one is featured.
 * The selected files are sent as `photos[]`, the room shown in each one as
 * `photo_rooms[]` (same order) and the featured photo as `featured_photo`
 * (its index in `photos[]`).
 */
export default function PhotoPicker({
    maxFileSize,
    onChange,
}: PhotoPickerProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [featuredKey, setFeaturedKey] = useState<string | null>(null);
    const [rejected, setRejected] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    const previewUrls = useRef<string[]>([]);

    // Release the previews when the user leaves the page.
    useEffect(() => {
        const urls = previewUrls;

        return () => urls.current.forEach((url) => URL.revokeObjectURL(url));
    }, []);

    function updatePhotos(next: Photo[], nextFeaturedKey: string | null) {
        const transfer = new DataTransfer();
        next.forEach((photo) => transfer.items.add(photo.file));

        if (input.current) {
            input.current.files = transfer.files;
        }

        previewUrls.current = next.map((photo) => photo.previewUrl);
        setPhotos(next);
        // The featured photo is only kept while it is still in the list.
        const keepsFeatured = next.some(
            (photo) => photo.key === nextFeaturedKey,
        );
        setFeaturedKey(keepsFeatured ? nextFeaturedKey : null);
        onChange({
            hasFeatured: keepsFeatured,
            totalSize: next.reduce(
                (total, photo) => total + photo.file.size,
                0,
            ),
        });
    }

    function chooseFeatured(photo: Photo) {
        setFeaturedKey(photo.key);
        onChange({
            hasFeatured: true,
            totalSize: photos.reduce(
                (total, item) => total + item.file.size,
                0,
            ),
        });
    }

    async function handleFilesChange(selected: FileList | null) {
        const added: Photo[] = [];
        const messages: string[] = [];
        const maxFileSizeMb = fileSize.format(maxFileSize / 1024 / 1024);

        setProcessing(true);

        for (const original of Array.from(selected ?? [])) {
            const key = `${original.name}-${original.size}-${original.lastModified}`;

            if (!acceptedTypes.includes(original.type)) {
                messages.push(
                    `${original.name}: envie imagens JPG, PNG ou WebP.`,
                );
                continue;
            }

            if (original.size > maxOriginalSizeMb * 1024 * 1024) {
                messages.push(
                    `${original.name}: a imagem passa de ${maxOriginalSizeMb} MB.`,
                );
                continue;
            }

            if (
                photos.some((photo) => photo.key === key) ||
                added.some((photo) => photo.key === key)
            ) {
                continue;
            }

            const file = await shrinkPhoto(original);

            if (file.size > maxFileSize) {
                messages.push(
                    `${original.name}: mesmo reduzida, a imagem passa do limite de ${maxFileSizeMb} MB do servidor.`,
                );
                continue;
            }

            added.push({ key, file, previewUrl: URL.createObjectURL(file) });
        }

        setProcessing(false);
        setRejected(messages);
        updatePhotos([...photos, ...added], featuredKey);
    }

    function removePhoto(photo: Photo) {
        URL.revokeObjectURL(photo.previewUrl);
        updatePhotos(
            photos.filter((item) => item.key !== photo.key),
            featuredKey,
        );
    }

    const featuredIndex = photos.findIndex(
        (photo) => photo.key === featuredKey,
    );

    return (
        <div>
            <label
                aria-disabled={processing || undefined}
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[#e3e3e0] bg-[#FDFDFC] px-4 py-8 text-center text-sm focus-within:border-[#1b1b18] focus-within:ring-1 focus-within:ring-[#1b1b18] hover:border-[#1b1b18] aria-disabled:cursor-wait aria-disabled:opacity-60 dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:focus-within:border-[#EDEDEC] dark:focus-within:ring-[#EDEDEC] dark:hover:border-[#EDEDEC]"
            >
                <span className="font-medium" aria-live="polite">
                    {processing
                        ? 'Preparando as fotos...'
                        : 'Clique para adicionar fotos'}
                </span>
                <span className="text-[#706f6c] dark:text-[#A1A09A]">
                    JPG, PNG ou WebP. As fotos são reduzidas automaticamente
                    antes do envio.
                </span>
                <input
                    ref={input}
                    name="photos[]"
                    type="file"
                    accept={acceptedTypes.join(',')}
                    multiple
                    disabled={processing}
                    onChange={(event) =>
                        void handleFilesChange(event.target.files)
                    }
                    className="sr-only"
                />
            </label>

            {featuredIndex >= 0 && (
                <input
                    type="hidden"
                    name="featured_photo"
                    value={featuredIndex}
                />
            )}

            {rejected.length > 0 && (
                <ul
                    role="alert"
                    className="mt-3 flex flex-col gap-1 text-sm text-[#f53003] dark:text-[#FF4433]"
                >
                    {rejected.map((message) => (
                        <li key={message}>{message}</li>
                    ))}
                </ul>
            )}

            {photos.length > 0 && (
                <fieldset className="mt-4">
                    <legend className="text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Clique na foto que será o destaque. Ela é a imagem
                        principal do anúncio nos resultados da pesquisa.
                    </legend>

                    <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {photos.map((photo, index) => {
                            const isFeatured = photo.key === featuredKey;

                            return (
                                <li
                                    key={photo.key}
                                    className={cn(
                                        'overflow-hidden rounded-md border-2 focus-within:ring-2 focus-within:ring-[#1b1b18] dark:focus-within:ring-[#EDEDEC]',
                                        isFeatured
                                            ? 'border-[#f53003] dark:border-[#FF4433]'
                                            : 'border-transparent',
                                    )}
                                >
                                    <label className="relative block cursor-pointer">
                                        <img
                                            src={photo.previewUrl}
                                            alt={photo.file.name}
                                            className="aspect-4/3 w-full object-cover"
                                        />
                                        {isFeatured && (
                                            <span className="absolute top-2 left-2 rounded-sm bg-[#f53003] px-2 py-0.5 text-xs font-medium text-white dark:bg-[#FF4433]">
                                                Destaque
                                            </span>
                                        )}
                                        <input
                                            type="radio"
                                            name="featured_photo_choice"
                                            checked={isFeatured}
                                            onChange={() =>
                                                chooseFeatured(photo)
                                            }
                                            aria-label={`Usar ${photo.file.name} como destaque`}
                                            className="sr-only"
                                        />
                                    </label>
                                    <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs">
                                        <span className="min-w-0 truncate text-[#706f6c] dark:text-[#A1A09A]">
                                            {photo.file.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(photo)}
                                            aria-label={`Remover ${photo.file.name}`}
                                            className="shrink-0 font-medium text-[#f53003] hover:underline dark:text-[#FF4433]"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                    <div className="px-2 pb-2">
                                        <label
                                            htmlFor={`photo-room-${index}`}
                                            className="sr-only"
                                        >
                                            Cômodo da foto {photo.file.name}
                                        </label>
                                        <select
                                            id={`photo-room-${index}`}
                                            name="photo_rooms[]"
                                            defaultValue=""
                                            className="w-full rounded-md border border-[#e3e3e0] bg-[#FDFDFC] px-2 py-1.5 text-xs outline-none focus:border-[#1b1b18] focus:ring-1 focus:ring-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:focus:border-[#EDEDEC] dark:focus:ring-[#EDEDEC]"
                                        >
                                            <option value="">
                                                Selecione o cômodo
                                            </option>
                                            {photoRooms.map((room) => (
                                                <option
                                                    key={room.value}
                                                    value={room.value}
                                                >
                                                    {room.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </fieldset>
            )}
        </div>
    );
}
