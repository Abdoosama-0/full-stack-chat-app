"use client";

import React from "react";
import { createPortal } from "react-dom";

type Props = {
  imageUrl: string | null;
  onClose: () => void;
};

const ImagePreview = ({ imageUrl, onClose }: Props) => {
  if (!imageUrl) return null;

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl transition-transform duration-200 scale-100 hover:scale-[1.01]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute -top-12 right-0 flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white hover:bg-black/80 hover:scale-105 transition"
          aria-label="Close image preview"
        >
          ✕
        </button>

        {/* Image Container */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          <img
            src={imageUrl}
            alt="preview"
            className="max-h-[88vh] w-full object-contain"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImagePreview;