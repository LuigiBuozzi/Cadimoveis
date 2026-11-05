import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const backgroundImages = [
    '/images/imoveis/imovel-1.jpg',
    '/images/imoveis/imovel-2.jpg',
    '/images/imoveis/imovel-3.jpg',
    '/images/imoveis/imovel-4.jpg',
    '/images/imoveis/imovel-5.jpg',
    '/images/imoveis/imovel-6.jpg',
];

const slideIntervalMs = 6000;

type AuthLayoutProps = {
    title: string;
    description: string;
    children: ReactNode;
};

export default function AuthLayout({
    title,
    description,
    children,
}: AuthLayoutProps) {
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveImage(
                (current) => (current + 1) % backgroundImages.length,
            );
        }, slideIntervalMs);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] p-6 text-[#1b1b18] dark:text-[#EDEDEC]">
            <div aria-hidden="true" className="absolute inset-0">
                {backgroundImages.map((image, index) => (
                    <img
                        key={image}
                        src={image}
                        alt=""
                        className={cn(
                            'absolute inset-0 size-full scale-105 object-cover transition-opacity duration-1500 ease-in-out motion-reduce:transition-none',
                            index === activeImage ? 'opacity-100' : 'opacity-0',
                        )}
                    />
                ))}
                <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/70" />
            </div>

            <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
                <p className="mb-6 text-4xl font-semibold tracking-tight text-white drop-shadow-lg">
                    Cadimoveis
                </p>

                <main className="w-full rounded-lg bg-white/95 p-8 shadow-2xl backdrop-blur-sm dark:bg-[#161615]/95">
                    <h1 className="text-xl font-semibold">{title}</h1>
                    <p className="mt-1 mb-6 text-sm text-[#706f6c] dark:text-[#A1A09A]">
                        {description}
                    </p>
                    {children}
                </main>
            </div>
        </div>
    );
}
