import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getBboxPercentages(bbox, imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const dimensions = {
        width: img.naturalWidth,
        height: img.naturalHeight
      };
      resolve({
        x: bbox.x / dimensions.width,
        y: bbox.y / dimensions.height,
        width: bbox.width / dimensions.width, 
        height: bbox.height / dimensions.height
      });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}