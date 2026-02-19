import { CharSetType, ColorMode, CHAR_SETS } from '../types';

/**
 * Calculates brightness of a pixel
 */
const getBrightness = (r: number, g: number, b: number): number => {
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

/**
 * Main function to generate ASCII data from an image.
 * Returns a Render Payload that can be drawn to a canvas.
 */
export const generateAsciiData = async (
  imageSrc: string,
  resolution: number,
  charSetType: CharSetType,
  customChars: string,
  contrast: number
): Promise<{ 
  rows: { char: string; color: [number, number, number] }[][], 
  width: number, 
  height: number 
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const aspectRatio = img.height / img.width;
      // ASCII characters are roughly twice as high as they are wide.
      // To prevent distortion, we adjust the height resolution.
      const cols = resolution;
      const rows = Math.floor(cols * aspectRatio * 0.5);

      const canvas = document.createElement('canvas');
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error("Could not create canvas context"));
        return;
      }

      // Draw downscaled image
      ctx.drawImage(img, 0, 0, cols, rows);
      const imageData = ctx.getImageData(0, 0, cols, rows);
      const pixels = imageData.data;

      let chars = CHAR_SETS[charSetType];
      if (charSetType === CharSetType.CUSTOM) {
        chars = customChars.length > 0 ? customChars : "@# ";
      }
      
      const asciiRows: { char: string; color: [number, number, number] }[][] = [];

      for (let y = 0; y < rows; y++) {
        const rowData: { char: string; color: [number, number, number] }[] = [];
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          
          let brightness = getBrightness(r, g, b);
          
          // Apply contrast
          brightness = (brightness - 128) * contrast + 128;
          brightness = Math.max(0, Math.min(255, brightness));

          // Map brightness to character (darker pixel = denser character usually, 
          // but standard mapping is usually 0=dark, 255=bright. 
          // In standard terminal, ' ' is nothing (black/white bg) and '@' is full.
          // If we assume white background, '@' is dark. If black background, '@' is bright.
          // Let's assume standard mapping: index 0 is darkest/densest.
          const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
          
          // Invert mapping index because most charsets go from Dense -> Sparse or vice versa.
          // CHAR_SETS.SIMPLE is "@%#*+=-:. " -> Dense to Sparse.
          // Low brightness (dark pixel) should map to Dense char (@) if on white paper.
          // But on screen (black bg), low brightness (black) should be ' ' and high brightness (white) is '@'.
          // Let's assume a Light Mode aesthetic (Paper) based on "Medical" theme, 
          // so Dark Pixel = Dense Char.
          
          // Actually, let's reverse the mapping for standard behavior (High brightness = Empty space).
          const mappedChar = chars[chars.length - 1 - charIndex]; 

          rowData.push({
            char: mappedChar,
            color: [r, g, b]
          });
        }
        asciiRows.push(rowData);
      }
      resolve({ rows: asciiRows, width: cols, height: rows });
    };
    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
};
