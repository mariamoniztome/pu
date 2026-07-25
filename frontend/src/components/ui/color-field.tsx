import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Input } from './input';
import { Label } from './label';

export function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative" ref={popoverRef}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={label}
            onClick={() => setOpen((v) => !v)}
            className="h-10 w-10 rounded-xl border-2 border-white ring-1 ring-gray-200 shadow-sm cursor-pointer flex-shrink-0 transition-transform hover:scale-105"
            style={{ backgroundColor: value }}
          />
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono uppercase"
            maxLength={7}
          />
        </div>
        {open && (
          <div className="absolute z-50 mt-2 p-3 bg-white rounded-2xl shadow-lg border border-gray-100">
            <HexColorPicker color={value} onChange={onChange} />
          </div>
        )}
      </div>
    </div>
  );
}
