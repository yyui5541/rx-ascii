export enum CharSetType {
  SIMPLE = 'SIMPLE',
  DETAILED = 'DETAILED',
  BLOCK = 'BLOCK',
  BINARY = 'BINARY',
  CUSTOM = 'CUSTOM'
}

export enum ColorMode {
  MONO = 'MONO', // Dark gray
  VINTAGE_GREEN = 'VINTAGE_GREEN', // CRT Green
  CYBER_PINK = 'CYBER_PINK', // Glitch Pink
  ORIGINAL = 'ORIGINAL' // Original Image Colors
}

export type Language = 'en' | 'zh';

export interface AppState {
  originalImage: string | null; // Base64
  asciiData: string | null; // The text representation
  isProcessingAscii: boolean;
  charSet: CharSetType;
  customChars: string;
  colorMode: ColorMode;
  resolution: number; // Width in characters
  contrast: number; // 0.5 to 2.0
  language: Language;
}

export const CHAR_SETS: Record<CharSetType, string> = {
  [CharSetType.SIMPLE]: "@%#*+=-:. ",
  [CharSetType.DETAILED]: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
  [CharSetType.BLOCK]: "█▓▒░ ",
  [CharSetType.BINARY]: "01 ",
  [CharSetType.CUSTOM]: "" // Placeholder
};