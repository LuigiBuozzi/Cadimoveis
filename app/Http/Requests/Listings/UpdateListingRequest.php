<?php

namespace App\Http\Requests\Listings;

use App\Models\Listing;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateListingRequest extends FormRequest
{
    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'cep' => preg_replace('/\D/', '', $this->string('cep')->toString()),
            'state' => $this->string('state')->upper()->toString(),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'type' => ['required', Rule::in(Listing::TYPES)],
            'deal' => ['required', Rule::in(Listing::DEALS)],
            'price' => ['required', 'integer', 'min:1', 'max:999999999999'],
            'cep' => ['required', 'digits:8'],
            'street' => ['required', 'string', 'max:255'],
            'number' => ['required', 'string', 'max:10'],
            'neighborhood' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', Rule::in(Listing::STATES)],
        ];

        foreach (Listing::ROOMS as $room) {
            $rules[$room] = ['nullable', 'integer', 'min:0', 'max:99'];
        }

        foreach ([...Listing::FEATURES, ...Listing::NEARBY_PLACES] as $option) {
            $rules[$option] = ['nullable', 'boolean'];
        }

        return $rules;
    }

    /**
     * Get the custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        $messages = [
            'type.required' => 'Selecione o tipo do imóvel.',
            'type.in' => 'Selecione um tipo de imóvel válido.',
            'deal.required' => 'Selecione se o imóvel é para aluguel ou venda.',
            'deal.in' => 'Selecione se o imóvel é para aluguel ou venda.',
            'price.required' => 'Informe o valor do imóvel.',
            'price.integer' => 'Informe o valor do imóvel em reais, sem centavos.',
            'price.min' => 'Informe o valor do imóvel.',
            'price.max' => 'O valor informado é alto demais.',
            'cep.required' => 'Informe o CEP do imóvel.',
            'cep.digits' => 'O CEP deve ter 8 dígitos.',
            'street.required' => 'Informe o endereço do imóvel.',
            'street.max' => 'O endereço deve ter no máximo 255 caracteres.',
            'number.required' => 'Informe o número do imóvel.',
            'number.max' => 'O número deve ter no máximo 10 caracteres.',
            'city.required' => 'Não foi possível identificar a cidade pelo CEP. Confira o CEP digitado.',
            'state.required' => 'Não foi possível identificar o estado pelo CEP. Confira o CEP digitado.',
            'state.in' => 'O estado do imóvel é inválido.',
        ];

        foreach (Listing::ROOMS as $room) {
            $messages["{$room}.integer"] = 'A quantidade de cômodos deve ser um número inteiro.';
            $messages["{$room}.min"] = 'A quantidade de cômodos não pode ser negativa.';
            $messages["{$room}.max"] = 'A quantidade de cômodos deve ser no máximo 99.';
        }

        return $messages;
    }

    /**
     * The validated listing attributes, ready to be saved.
     *
     * @return array<string, mixed>
     */
    public function listingData(): array
    {
        $data = $this->safe()->only([
            'type', 'deal', 'price', 'cep', 'street', 'number', 'neighborhood', 'city', 'state',
        ]);

        foreach (Listing::ROOMS as $room) {
            $data[$room] = $this->integer($room);
        }

        $data['features'] = array_values(array_filter(
            Listing::FEATURES,
            fn (string $feature) => $this->boolean($feature),
        ));

        $data['nearby_places'] = array_values(array_filter(
            Listing::NEARBY_PLACES,
            fn (string $place) => $this->boolean($place),
        ));

        return $data;
    }
}
