import { Form, Head, Link } from '@inertiajs/react';
import FormField from '@/components/form-field';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';

export default function Login() {
    return (
        <AuthLayout
            title="Entrar"
            description="Acesse sua conta com e-mail e senha."
        >
            <Head title="Entrar" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
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
                            autoComplete="current-password"
                            required
                            error={errors.password}
                        />

                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                name="remember"
                                className="size-4 accent-[#1b1b18] dark:accent-[#EDEDEC]"
                            />
                            Lembrar de mim
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-2 rounded-md bg-[#1b1b18] px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50 dark:bg-[#eeeeec] dark:text-[#1C1C1A] dark:hover:bg-white"
                        >
                            {processing ? 'Entrando...' : 'Entrar'}
                        </button>
                    </>
                )}
            </Form>

            <p className="mt-6 text-center text-sm text-[#706f6c] dark:text-[#A1A09A]">
                Não tem uma conta?{' '}
                <Link
                    href={register()}
                    className="font-medium text-[#f53003] underline underline-offset-4 dark:text-[#FF4433]"
                >
                    Cadastre-se
                </Link>
            </p>
        </AuthLayout>
    );
}
