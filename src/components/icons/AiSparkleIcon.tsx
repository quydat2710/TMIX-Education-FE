import React from 'react';

interface AiSparkleIconProps {
    size?: number;
    color?: string;
}

/**
 * Custom AI Sparkle Icon — 4-point star + orbiting dots
 * Dùng chung cho Header, Chat Avatar, và Sidebar
 */
const AiSparkleIcon: React.FC<AiSparkleIconProps> = ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2L13.8 8.6L20 12L13.8 15.4L12 22L10.2 15.4L4 12L10.2 8.6L12 2Z"
            fill={color}
            fillOpacity="0.95"
        />
        <circle cx="19" cy="5" r="1.5" fill={color} fillOpacity="0.7" />
        <circle cx="5" cy="19" r="1.2" fill={color} fillOpacity="0.5" />
        <circle cx="20" cy="18" r="1" fill={color} fillOpacity="0.4" />
    </svg>
);

export default AiSparkleIcon;
