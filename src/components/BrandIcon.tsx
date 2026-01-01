import React from 'react';

export default function BrandIcon({ size = 24, color = 'currentColor' }: { size?: number, color?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {/* Fork */}
            <path d="M7 6v6m-2-6v4c0 1.1.9 2 2 2s2-.9 2-2V6" />
            <path d="M7 12v6" />

            {/* Knife */}
            <path d="M15 6v12" />
            <path d="M15 6c0 0-2 0.5-2 3v3c0 1 1 2 2 2" />
        </svg>
    );
}
