import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import FormField from '@/components/form-field';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    const [isBroker, setIsBroker] = useState(false);

    return (
        <AuthLayout
            title="Criar conta"
            description="Cadastre-se com seu e-mail e uma senha."
        >
            <Head title="Criar conta" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                className="flex flex-col gap-4"
            >
                {({ errors, processing }) => (
                    <>
                        <FormField
                            label="E-mail"
                            name="email"
                            type="email"
                            autoComplete="email"
                            autoFocus
                            required
                            error={errors.email}
                        />
                        <FormField
                            label="Senha"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                            error={errors.password}
                        />
                        <FormField
                            label="Confirmar senha"
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            required
                            error={errors.password_confirmation}
                        />

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="is_broker"
                                value="1"
                                checked={isBroker}
                                onChange={(event) =>
                                    setIsBroker(event.target.checked)
                                }
                                className="size-4 accent-[#1b1b18] dark:accent-[#EDEDEC]"
                            />
                            Sou corretor de imóveis
                        </label>

                        {isBroker && (
                            <FormField
                                label="CRECI"
                                name="creci"
                                type="text"
                                placeholder="Ex.: 12345-F"
                                maxLength={20}
                                required
                                error={errors.creci}
                            />
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 rounded-md bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                        >
                            {processing ? 'Criando conta...' : 'Criar conta'}
                        </button>
                    </>
                )}
            </Form>

            <p className="mt-6 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                Já tem uma conta?{' '}
                <Link
                    href={login()}
                    className="font-medium text-[#f53003] underline underline-offset-4 dark:text-[#FF4433]"
                >
                    Entrar
                </Link>
            </p>
        </AuthLayout>
    );
}
