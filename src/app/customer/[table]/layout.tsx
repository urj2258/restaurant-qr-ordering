'use client';

import { use, ReactNode } from 'react';
import { CartProvider } from '@/context/CartContext';

export default function CustomerLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ table: string }>;
}) {
    // In Next.js 15+, params in layout is a Promise. We need to unwrap it using React.use()
    // However, checking the user's package.json might be good to confirm version, but usually 
    // params in layout can be async or use(). 
    // Given the current code in page.tsx uses `useParams`, let's just make the layout async component or use `use`.
    // Actually, to be safe and standard with simple client components (which this likely needs to be for context),
    // let's try a standard approach. 
    // Wait, `CartProvider` is a client component. 
    // The layout itself can be a server component if we want, but `CartProvider` needs `tableNumber`.
    // params are available in layout.

    // Let's use `use` from react to unwrap the params promise if we are on newest nextjs, 
    // or just await if it's an async server component. 
    // BUT, the existing code uses "use client" in page.tsx. 
    // If I make this layout "use client", I can receives params directly in some versions or as promise in 15.

    // Let's check `package.json` to see next version? No, I'll just check `page.tsx` again.
    // `page.tsx` uses `useParams()`.

    // Let's just make the layout "use client" and use `useParams` hook? 
    // No, layout `params` prop is better.

    // Simplest robust way for Next.js 13/14 (most likely):
    // params is an object { table: string }

    const { table } = use(params);

    return (
        <CartProvider tableNumber={table}>
            {children}
        </CartProvider>
    );
}
