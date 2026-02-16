
import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                {/* Adjusted depth for better contrast in light mode */}
                <radialGradient id="bodyGlow" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#FFF1F2" />
                </radialGradient>
                {/* Premium orange gradient */}
                <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FB923C" />
                    <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
                {/* Enhanced shadow for visibility */}
                <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F97316" floodOpacity="0.15" />
                </filter>
            </defs>

            {/* Tail: Stronger outline for contrast */}
            <path
                d="M35 85 C 15 85, 5 65, 12 45 C 18 25, 40 25, 45 42"
                stroke="url(#brandGradient)"
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
            />

            {/* Main Body: Added a subtle brand-tinted stroke for light mode visibility */}
            <circle cx="58" cy="72" r="24" fill="url(#bodyGlow)" stroke="#FED7AA" strokeWidth="1.5" />

            {/* Ears: Defined strokes */}
            <path d="M44 38 L34 10 L62 26 Z" fill="white" stroke="#FDBA74" strokeWidth="1.5" />
            <path d="M76 38 L86 10 L58 26 Z" fill="url(#brandGradient)" stroke="#EA580C" strokeWidth="0.5" />

            {/* Head: Defined circle with shadow and stroke */}
            <circle cx="60" cy="46" r="32" fill="url(#bodyGlow)" stroke="#FED7AA" strokeWidth="1.5" filter="url(#softShadow)" />

            {/* The 'Identity' Patch */}
            <path d="M78 28 C88 38 95 55 88 68 C80 78 65 78 52 68 L78 28 Z" fill="#FFEDD5" opacity="0.6" />

            {/* The Eyes: High contrast dark navy */}
            <g>
                <circle cx="48" cy="48" r="7" fill="#0F172A" />
                <circle cx="50" cy="45" r="2.5" fill="white" />
                <circle cx="46.5" cy="50.5" r="1" fill="white" opacity="0.4" />
            </g>
            <g>
                <circle cx="72" cy="48" r="7" fill="#0F172A" />
                <circle cx="74" cy="45" r="2.5" fill="white" />
                <circle cx="70.5" cy="50.5" r="1" fill="white" opacity="0.4" />
            </g>

            {/* Expression */}
            <path
                d="M54 62 C56 65, 59 65, 60 65 C61 65, 64 65, 66 62"
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />

            {/* Paws: Defined for all backgrounds */}
            <circle cx="48" cy="94" r="3.5" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
            <circle cx="72" cy="94" r="3.5" fill="white" stroke="#FED7AA" strokeWidth="1.5" />
        </svg>
    );
};
