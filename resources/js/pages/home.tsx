import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { create, index } from '@/routes/listings';

export default function Home() {
    const { auth } = usePage().props;

    return (
        <AppLayout>
            <Head title="Início" />

            <h1 className="text-2xl font-semibold">Olá, {auth.user?.name}!</h1>
            <p className="mt-1 text-[#706f6c] dark:text-[#A1A09A]">
                O que você deseja fazer hoje?
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Link
                    href={create()}
                    className="rounded-lg border border-[#e3e3e0] bg-white p-6 hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#EDEDEC]"
                >
                    <h2 className="font-semibold">Anunciar um imóvel</h2>
                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Cadastre um imóvel para venda ou aluguel.
                    </p>
                </Link>
                <Link
                    href={index()}
                    className="rounded-lg border border-[#e3e3e0] bg-white p-6 hover:border-[#1b1b18] dark:border-[#3E3E3A] dark:bg-[#161615] dark:hover:border-[#EDEDEC]"
                >
                    <h2 className="font-semibold">Meus anúncios</h2>
                    <p className="mt-1 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        Veja e gerencie os imóveis que você anunciou.
                    </p>
                </Link>
            </div>
        </AppLayout>
    );
}
