'use client';

import { useTheme } from '@/context/ThemeContext';
import { SunIcon, MoonIcon } from './Icons';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div style={{ width: '40px', height: '40px' }} />;

    return (
        <button
            onClick={toggleTheme}
            style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                transition: 'all var(--transition-base)',
                cursor: 'pointer'
            }}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
        </button>
    );
}
