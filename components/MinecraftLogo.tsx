'use client';

import React from 'react';

export default function MinecraftLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      width="120"
      height="40"
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Credit Alt Submit Logo"
    >
      {/* C - Green blocks */}
      <rect x="2" y="8" width="6" height="6" fill="#4ade80" />
      <rect x="8" y="8" width="6" height="6" fill="#22c55e" />
      <rect x="14" y="8" width="6" height="6" fill="#16a34a" />
      <rect x="2" y="14" width="6" height="6" fill="#22c55e" />
      <rect x="2" y="20" width="6" height="6" fill="#16a34a" />
      <rect x="2" y="26" width="6" height="6" fill="#15803d" />
      <rect x="8" y="26" width="6" height="6" fill="#16a34a" />
      <rect x="14" y="26" width="6" height="6" fill="#22c55e" />

      {/* A - Blue blocks */}
      <rect x="26" y="8" width="6" height="6" fill="#3b82f6" />
      <rect x="32" y="8" width="6" height="6" fill="#2563eb" />
      <rect x="38" y="8" width="6" height="6" fill="#1d4ed8" />
      <rect x="26" y="14" width="6" height="6" fill="#2563eb" />
      <rect x="38" y="14" width="6" height="6" fill="#2563eb" />
      <rect x="26" y="20" width="6" height="6" fill="#1d4ed8" />
      <rect x="32" y="20" width="6" height="6" fill="#2563eb" />
      <rect x="38" y="20" width="6" height="6" fill="#1d4ed8" />
      <rect x="26" y="26" width="6" height="6" fill="#1e40af" />
      <rect x="38" y="26" width="6" height="6" fill="#1e40af" />

      {/* S - Orange blocks */}
      <rect x="50" y="8" width="6" height="6" fill="#f59e0b" />
      <rect x="56" y="8" width="6" height="6" fill="#f97316" />
      <rect x="62" y="8" width="6" height="6" fill="#ea580c" />
      <rect x="50" y="14" width="6" height="6" fill="#f97316" />
      <rect x="50" y="20" width="6" height="6" fill="#ea580c" />
      <rect x="56" y="20" width="6" height="6" fill="#f97316" />
      <rect x="62" y="20" width="6" height="6" fill="#ea580c" />
      <rect x="50" y="26" width="6" height="6" fill="#c2410c" />
      <rect x="56" y="26" width="6" height="6" fill="#ea580c" />
      <rect x="62" y="26" width="6" height="6" fill="#f97316" />

      {/* Shadow/3D effect */}
      <rect x="2" y="32" width="6" height="2" fill="#15803d" fillOpacity="0.5" />
      <rect x="8" y="32" width="6" height="2" fill="#15803d" fillOpacity="0.5" />
      <rect x="14" y="32" width="6" height="2" fill="#15803d" fillOpacity="0.5" />
      <rect x="26" y="32" width="6" height="2" fill="#1e40af" fillOpacity="0.5" />
      <rect x="38" y="32" width="6" height="2" fill="#1e40af" fillOpacity="0.5" />
      <rect x="50" y="32" width="6" height="2" fill="#c2410c" fillOpacity="0.5" />
      <rect x="56" y="32" width="6" height="2" fill="#c2410c" fillOpacity="0.5" />
      <rect x="62" y="32" width="6" height="2" fill="#c2410c" fillOpacity="0.5" />

      {/* Sparkle effects - using CSS classes instead of inline styles */}
      <g className="animate-pulse">
        <circle cx="72" cy="10" r="2" fill="#fbbf24" />
        <circle cx="75" cy="18" r="1.5" fill="#fde047" />
        <circle cx="70" cy="26" r="1.5" fill="#fef08a" />
      </g>
    </svg>
  );
}

