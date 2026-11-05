<?php

namespace App\Http\Requests\Listings;

use App\Models\ListingPhoto;
use App\Support\UploadLimits;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreListingRequest extends UpdateListingRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $maxFileSize = UploadLimits::maxFileSizeInKilobytes();

        return [
            ...parent::rules(),
            'photos' => ['required', 'array', 'min:1', 'max:30'],
            'photos.*' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', "max:{$maxFileSize}"],
            'photo_rooms' => ['nullable', 'array'],
            'photo_rooms.*' => ['nullable', Rule::in(ListingPhoto::ROOMS)],
            'featured_photo' => ['required', 'integer', 'min:0'],
            'documents' => ['nullable', 'array', 'max:20'],
            'documents.*' => ['required', 'file', 'mimes:pdf', "max:{$maxFileSize}"],
        ];
    }

    /**
     * Get the "after" validation callables for the request.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $photos = $this->file('photos');
                $photoCount = is_array($photos) ? count($photos) : 0;

                if ($photoCount > 0 && $this->integer('featured_photo') >= $photoCount) {
                    $validator->errors()->add('featured_photo', 'Escolha uma foto de destaque.');
                }
            },
        ];
    }

    /**
     * Get the custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $maxFileSizeMb = round(UploadLimits::maxFileSize() / 1024 / 1024, 1);

        return [
            ...parent::messages(),
            'photos.required' => 'Adicione pelo menos uma foto do imóvel.',
            'photos.min' => 'Adicione pelo menos uma foto do imóvel.',
            'photos.max' => 'Envie no máximo 30 fotos.',
            'photos.*.file' => 'Não foi possível enviar uma das fotos.',
            'photos.*.mimes' => 'As fotos devem ser JPG, PNG ou WebP.',
            'photos.*.max' => "Cada foto pode ter no máximo {$maxFileSizeMb} MB.",
            'photos.*.uploaded' => "Não foi possível enviar uma das fotos. Cada foto pode ter no máximo {$maxFileSizeMb} MB.",
            'photo_rooms.*.in' => 'Selecione um cômodo válido para as fotos.',
            'featured_photo.required' => 'Escolha uma foto de destaque.',
            'featured_photo.integer' => 'Escolha uma foto de destaque.',
            'featured_photo.min' => 'Escolha uma foto de destaque.',
            'documents.max' => 'Envie no máximo 20 documentos.',
            'documents.*.file' => 'Não foi possível enviar um dos documentos.',
            'documents.*.mimes' => 'Os documentos devem estar em PDF.',
            'documents.*.max' => "Cada documento pode ter no máximo {$maxFileSizeMb} MB.",
            'documents.*.uploaded' => "Não foi possível enviar um dos documentos. Cada documento pode ter no máximo {$maxFileSizeMb} MB.",
        ];
    }
}
