import React from 'react';

// --- ATOMS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  loading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-bold tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none";
  
  // Medical/Cyber Aesthetic: Sharp borders, no rounded corners
  const variants = {
    primary: "text-slate-800 hover:bg-slate-200 border-x-2 border-slate-800 px-6 py-2",
    secondary: "text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-dashed border-slate-400 px-4 py-1 text-sm",
    danger: "text-red-700 hover:bg-red-50 border border-red-300 px-4 py-1"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {loading ? (
        <span className="animate-pulse">PROCESSING...</span>
      ) : (
        <>
          <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="mr-2 opacity-50">[</span>
          {children}
          <span className="ml-2 opacity-50">]</span>
          <span className="absolute right-0 top-0 bottom-0 w-[2px] bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
        </>
      )}
    </button>
  );
};

export const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6 border-b border-slate-300 pb-2 relative">
    <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tighter flex items-center gap-2">
      <span className="w-2 h-2 bg-slate-800 inline-block"></span>
      {title}
    </h2>
    {subtitle && <p className="text-xs text-slate-500 font-mono mt-1 ml-4">// {subtitle}</p>}
    <div className="absolute bottom-[-1px] right-0 w-1/3 h-[1px] bg-slate-800"></div>
  </div>
);

export const DataLabel: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="flex justify-between items-baseline border-b border-dashed border-slate-200 py-1">
    <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
    <span className="text-sm font-mono text-slate-700">{value}</span>
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1 w-full">
    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</label>
    <div className="relative">
      <select 
        className="w-full appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 px-3 pr-8 font-mono text-xs focus:border-slate-800 focus:ring-0 rounded-none cursor-pointer"
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 text-xs">
        ▼
      </div>
    </div>
  </div>
);

export const Slider: React.FC<{ label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }> = ({ 
  label, value, onChange, min, max, step = 1 
}) => (
  <div className="flex flex-col gap-1 w-full">
    <div className="flex justify-between">
      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{label}</label>
      <span className="text-[10px] font-mono text-slate-600">{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-slate-200 rounded-none appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-slate-800"
    />
  </div>
);
