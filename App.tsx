import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Download, RefreshCw, X, Terminal, AlertCircle, Globe } from 'lucide-react';
import { CharSetType, ColorMode, CHAR_SETS, AppState, Language } from './types';
import { generateAsciiData } from './utils/asciiUtils';
import { Button, SectionHeader, Select, Slider, DataLabel } from './components/Components';
import { PixelBackground } from './components/Background';
import { getTranslation } from './translations';

const App: React.FC = () => {
  // State
  const [state, setState] = useState<AppState>({
    originalImage: null,
    asciiData: null,
    isProcessingAscii: false,
    charSet: CharSetType.DETAILED,
    customChars: '',
    colorMode: ColorMode.MONO,
    resolution: 120,
    contrast: 1.0,
    language: 'en' // Default language
  });

  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = getTranslation(state.language);

  // --- Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("FILE_SIZE_EXCEEDED: LIMIT 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setState(prev => ({
        ...prev,
        originalImage: event.target?.result as string,
        asciiData: null,
      }));
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const renderAscii = useCallback(async () => {
    const source = state.originalImage;
    if (!source) return;

    setState(prev => ({ ...prev, isProcessingAscii: true }));

    try {
      const { rows, width, height } = await generateAsciiData(
        source,
        state.resolution,
        state.charSet,
        state.customChars,
        state.contrast
      );

      drawAsciiToCanvas(rows, width, height, state.colorMode);
      
      setState(prev => ({ ...prev, isProcessingAscii: false }));
    } catch (err: any) {
      setError(`RENDER_ERROR: ${err.message}`);
      setState(prev => ({ ...prev, isProcessingAscii: false }));
    }
  }, [state.originalImage, state.resolution, state.charSet, state.customChars, state.contrast, state.colorMode]);

  const drawAsciiToCanvas = (
    rows: { char: string; color: [number, number, number] }[][], 
    cols: number, 
    rowsCount: number,
    mode: ColorMode
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 12;
    const charWidth = 7;
    const lineHeight = 12;

    canvas.width = cols * charWidth + 20;
    canvas.height = rowsCount * lineHeight + 20;

    // Background color based on mode
    ctx.fillStyle = (mode === ColorMode.CYBER_PINK || mode === ColorMode.VINTAGE_GREEN || mode === ColorMode.MONO) ? '#f8fafc' : '#111';
    if (mode === ColorMode.CYBER_PINK) ctx.fillStyle = '#2a0a18';
    if (mode === ColorMode.VINTAGE_GREEN) ctx.fillStyle = '#051a05';
    if (mode === ColorMode.MONO) ctx.fillStyle = '#ffffff'; 

    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = `${fontSize}px 'Space Mono', monospace`;
    ctx.textBaseline = 'top';

    rows.forEach((row, y) => {
      row.forEach((pixel, x) => {
        const posX = 10 + x * charWidth;
        const posY = 10 + y * lineHeight;

        if (mode === ColorMode.ORIGINAL) {
          ctx.fillStyle = `rgb(${pixel.color[0]}, ${pixel.color[1]}, ${pixel.color[2]})`;
        } else if (mode === ColorMode.VINTAGE_GREEN) {
          ctx.fillStyle = '#00ff41';
        } else if (mode === ColorMode.CYBER_PINK) {
          ctx.fillStyle = '#ff00ff';
        } else {
          ctx.fillStyle = '#334155';
        }

        ctx.fillText(pixel.char, posX, posY);
      });
    });
  };

  useEffect(() => {
    if (state.originalImage) {
      const timer = setTimeout(() => {
        renderAscii();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.originalImage, state.resolution, state.charSet, state.contrast, state.colorMode, state.customChars, renderAscii]);

  const downloadArt = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `DIAGNOSIS_${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'zh' : 'en' }));
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50 text-slate-800 font-mono selection:bg-slate-300">
      
      {/* Background Layer */}
      <PixelBackground />
      
      {/* Scanline Overlay */}
      <div className="fixed inset-0 pointer-events-none scanline z-50"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center py-8 px-6 md:px-12 lg:px-20">
        
        {/* HEADER */}
        <header className="w-full max-w-5xl mb-12 flex justify-between items-end border-b-2 border-slate-800 pb-4 bg-white/80 backdrop-blur-sm px-6 pt-6 shadow-sm">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-slate-800 glitch-text cursor-default">
              {t.title}
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-2 font-mono">
              {t.subtitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-xs font-bold border border-slate-300 px-2 py-1 hover:bg-slate-100 hover:border-slate-800 transition-colors"
            >
              <Globe className="w-3 h-3" />
              {state.language === 'en' ? 'EN' : '中文'}
            </button>
            <div className="text-right hidden md:block mt-1">
              <DataLabel label={t.sessionId} value={Math.random().toString(36).substr(2, 9).toUpperCase()} />
              <DataLabel label={t.sysStatus} value={t.online} />
            </div>
          </div>
        </header>

        {/* ERROR BANNER */}
        {error && (
          <div className="w-full max-w-5xl mb-6 bg-red-50 border border-red-400 p-4 flex items-center text-red-700 font-mono text-sm shadow-md">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="font-bold">{t.error}:</span> {error}
            <button onClick={() => setError(null)} className="ml-auto hover:text-red-900 border-l border-red-200 pl-4"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* MAIN GRID */}
        <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: CONTROLS */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* UPLOAD SECTION */}
            <section className="bg-white/90 backdrop-blur-sm p-6 border border-slate-300 shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] relative transition-transform hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(203,213,225,1)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-yellow-100/80 rotate-1 border-l border-r border-slate-200 z-20 pointer-events-none"></div>

              <SectionHeader title={t.inputSource} />
              
              <div 
                className="border-2 border-dashed border-slate-300 hover:border-slate-800 hover:bg-slate-50 transition-all p-8 text-center cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                <div className="bg-slate-100 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-5 h-5 text-slate-500 group-hover:text-slate-800" />
                </div>
                <p className="text-xs font-bold text-slate-600 group-hover:text-slate-900 uppercase">{t.dragDrop}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">{t.supportParams}</p>
              </div>

              {state.originalImage && (
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="relative group">
                    <img 
                      src={state.originalImage} 
                      alt="Preview" 
                      className="w-full h-48 object-cover border border-slate-800 grayscale opacity-90"
                    />
                  </div>
                  <div className="flex justify-between mt-2 border-t border-dotted border-slate-300 pt-2">
                    <span className="text-[10px] bg-slate-800 text-white px-1">{t.imgLoaded}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{t.original}</span>
                  </div>
                </div>
              )}
            </section>

            {/* ASCII SETTINGS */}
            <section className="bg-white/90 backdrop-blur-sm p-6 border border-slate-300 shadow-[4px_4px_0px_0px_rgba(203,213,225,1)] transition-transform hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(203,213,225,1)]">
              <SectionHeader title={t.renderConfig} />

              <div className="space-y-6">
                <Select 
                  label={t.charSet}
                  value={state.charSet}
                  onChange={(e) => setState(prev => ({ ...prev, charSet: e.target.value as CharSetType }))}
                >
                  {Object.keys(CHAR_SETS).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </Select>

                {state.charSet === CharSetType.CUSTOM && (
                  <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{t.customString}</label>
                    <input 
                      type="text" 
                      value={state.customChars}
                      onChange={(e) => setState(prev => ({ ...prev, customChars: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-300 p-2 font-mono text-xs focus:border-slate-800 outline-none"
                      placeholder={t.enterChars}
                    />
                  </div>
                )}

                <Select 
                  label={t.colorMode}
                  value={state.colorMode}
                  onChange={(e) => setState(prev => ({ ...prev, colorMode: e.target.value as ColorMode }))}
                >
                  <option value={ColorMode.MONO}>{t.modes.MONO}</option>
                  <option value={ColorMode.VINTAGE_GREEN}>{t.modes.VINTAGE_GREEN}</option>
                  <option value={ColorMode.CYBER_PINK}>{t.modes.CYBER_PINK}</option>
                  <option value={ColorMode.ORIGINAL}>{t.modes.ORIGINAL}</option>
                </Select>

                <Slider 
                  label={t.resWidth}
                  min={40} 
                  max={250} 
                  value={state.resolution} 
                  onChange={(v) => setState(prev => ({ ...prev, resolution: v }))} 
                />

                <Slider 
                  label={t.contrast}
                  min={0.1} 
                  max={3.0} 
                  step={0.1}
                  value={state.contrast} 
                  onChange={(v) => setState(prev => ({ ...prev, contrast: v }))} 
                />

              </div>
            </section>

          </aside>

          {/* RIGHT COLUMN: PREVIEW */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            <div className="bg-white border-2 border-slate-800 p-2 shadow-[8px_8px_0px_0px_rgba(30,41,59,0.2)] min-h-[600px] relative flex flex-col transition-all duration-300">
              <div className="absolute top-0 left-0 bg-slate-800 text-white text-[10px] px-2 py-1 font-bold z-10 tracking-wider">
                {t.outputBuffer}
              </div>
              
              <div className="flex-1 overflow-auto bg-slate-100 flex items-center justify-center border border-slate-200 mt-6 p-4 scrollbar-hide relative group">
                {!state.originalImage ? (
                  <div className="text-center opacity-40 space-y-2 animate-pulse">
                    <Terminal className="w-16 h-16 mx-auto text-slate-400" />
                    <p className="font-mono text-sm tracking-widest uppercase">{t.waiting}</p>
                  </div>
                ) : (
                  <>
                    <canvas 
                      ref={canvasRef}
                      className="max-w-full shadow-lg transition-opacity duration-300"
                    />
                    {state.isProcessingAscii && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm z-20">
                         <div className="text-xs font-bold bg-slate-800 text-white px-4 py-2 animate-pulse uppercase">{t.processing}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-4 flex justify-between items-center border-t border-slate-200 pt-2 bg-white px-2">
                <div className="text-[10px] text-slate-400 font-mono uppercase">
                  {t.dimensions}: {state.resolution} cols / {t.scale}: 1.0
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => renderAscii()} disabled={!state.originalImage || state.isProcessingAscii}>
                    {state.isProcessingAscii ? t.rendering : t.refresh}
                  </Button>
                  <Button variant="primary" onClick={downloadArt} disabled={!state.asciiData && !state.originalImage}>
                      <Download className="w-4 h-4 mr-2" />
                      {t.export}
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="text-slate-400 text-xs font-mono border-t border-dashed border-slate-300 pt-4 flex justify-between bg-white/50 p-2 backdrop-blur-sm">
              <p>
                {t.footerAuth}
              </p>
              <p className="hidden md:block">
                {t.footerMem}
              </p>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default App;