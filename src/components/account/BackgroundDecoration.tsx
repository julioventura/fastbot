
import React from "react";

const BackgroundDecoration = () => {
  return (
    <>
      {/* SVG Glow Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="w-full h-full opacity-60" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <g opacity="0.4" filter="url(#filter0_f_101_3)">
            <circle cx="1079" cy="540" r="359" fill="#0063F7" />
          </g>
          <g opacity="0.3" filter="url(#filter1_f_101_3)">
            <circle cx="541" cy="540" r="359" fill="#8B2CF5" />
          </g>
          <defs>
            <filter id="filter0_f_101_3" x="520" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
            </filter>
            <filter id="filter1_f_101_3" x="-18" y="-19" width="1118" height="1118" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
              <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_101_3" />
            </filter>
          </defs>
        </svg>
      </div>
      
      {/* Grid overlay pattern */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div
          className="h-full w-full grid"
          style={{
            gridTemplateRows: 'repeat(20, 1fr)',
            gridTemplateColumns: 'repeat(20, 1fr)',
          }}
        >
          {/* Horizontal lines */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`h-${index}`}
              className="absolute left-0 right-0 border-t border-[#4f9bff]/30"
              style={{ top: `${(index * 100) / 20}%` }}
            />
          ))}

          {/* Vertical lines */}
          {Array.from({ length: 21 }).map((_, index) => (
            <div
              key={`v-${index}`}
              className="absolute top-0 bottom-0 border-l border-[#4f9bff]/30"
              style={{ left: `${(index * 100) / 20}%` }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default BackgroundDecoration;
