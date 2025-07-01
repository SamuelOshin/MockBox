import React from "react";

// A segmented/gear-like spinner (engine style)
export function EngineSpinner({ size = 48, color = "#6366f1" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
      style={{ display: "block", margin: "auto" }}
    >
      <g>
        {/* 8 gear-like segments */}
        {[...Array(8)].map((_, i) => (
          <rect
            key={i}
            x="22"
            y="4"
            width="4"
            height="12"
            rx="2"
            fill={color}
            opacity={0.2 + 0.8 * (i === 0 ? 1 : 0)}
            transform={`rotate(${i * 45} 24 24)`}
          />
        ))}
      </g>
    </svg>
  );
}
