<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'is_broker' => ['boolean'],
            'creci' => ['required_if_accepted:is_broker', 'nullable', 'string', 'max:20'],
        ];
    }

    /**
     * Get the custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Informe o seu e-mail.',
            'email.lowercase' => 'O e-mail deve estar em letras minúsculas.',
            'email.email' => 'Informe um e-mail válido.',
            'email.max' => 'O e-mail deve ter no máximo 255 caracteres.',
            'email.unique' => 'Já existe uma conta com este e-mail.',
            'password.required' => 'Informe uma senha.',
            'password.confirmed' => 'As senhas não coincidem.',
            'password.min' => 'A senha deve ter pelo menos :min caracteres.',
            'creci.required_if_accepted' => 'Informe o seu CRECI.',
            'creci.max' => 'O CRECI deve ter no máximo 20 caracteres.',
        ];
    }
}
