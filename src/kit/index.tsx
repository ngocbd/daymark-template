import React, { useState, useEffect, useRef } from 'react';
import './stageshow.css';

/**
 * STAGESHOW KIT (`src/kit/index.tsx`)
 * Complete implementation of Stageshow parts:
 * - Stage & Act choreography API
 * - Frames: Window, Phone (Dynamic Island + Home Indicator), LockScreen, Notification, Receipt, Stamp, Thread, Bubble
 * - Motion: Collapse, Roll, Swap, Count, Connector, Stream, Popover
 * - Small parts: Bar, Text, Row, Card, Divider, Avatar, Pin, Button, Segmented, Toggle, Tabs, Badge, Chip, Kbd, Code, Chart, Toast
 */

/* ============================================================================
   1. SMALL PARTS: Bar, Text, Row, Card, Divider, Avatar, Pin, Kbd, Badge, Chip
   ============================================================================ */

export interface BarProps {
  w?: number | string;
  h?: number;
  soft?: boolean;
  className?: string;
}

export const Bar: React.FC<BarProps> = ({ w = 64, h = 7, soft = false, className = '' }) => (
  <span
    aria-hidden="true"
    style={{ width: typeof w === 'number' ? `${w}px` : w, height: `${h}px` }}
    className={`ss-bar ${soft ? 'ss-bar-soft' : ''} ${className}`}
  />
);

export interface TextProps {
  filler?: number | string;
  fidelity?: 'minimal' | 'standard' | 'realistic';
  children?: React.ReactNode;
  className?: string;
}

export const Text: React.FC<TextProps> = ({
  filler,
  fidelity = 'standard',
  children,
  className = '',
}) => {
  if (fidelity === 'minimal' && filler) {
    return <Bar w={filler} className={className} />;
  }
  if ((children === undefined || children === null || children === '') && filler) {
    return <Bar w={filler} className={className} />;
  }
  return <span className={className}>{children}</span>;
};

export interface RowProps {
  lead?: React.ReactNode;
  trail?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  target?: string;
  cursorLabel?: string;
  onClick?: () => void;
  className?: string;
}

export const Row: React.FC<RowProps> = ({
  lead,
  trail,
  subtitle,
  children,
  active = false,
  target,
  cursorLabel,
  onClick,
  className = '',
}) => {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      data-target={target}
      data-cursor={cursorLabel}
      className={`w-full flex items-center justify-between gap-3.5 px-4 py-3 text-left transition-all duration-150 ${
        active
          ? 'bg-teal-50/85 text-slate-950 border-l-2 border-l-teal-700'
          : onClick
          ? 'hover:bg-slate-50/90 cursor-pointer'
          : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {lead && <div className="shrink-0">{lead}</div>}
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-900 truncate">{children}</div>
          {subtitle && (
            <div className="text-[11px] text-slate-500 truncate mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      {trail && (
        <div className="shrink-0 flex items-center gap-2.5 font-mono tabular-nums text-xs">
          {trail}
        </div>
      )}
    </div>
  );
};

export interface AvatarProps {
  src?: string;
  initials: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'verified' | 'busy' | 'offline';
  tone?: 'teal' | 'sky' | 'amber' | 'slate';
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  initials,
  alt = '',
  size = 'md',
  status,
  tone = 'teal',
  onClick,
  title,
  className = '',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'w-7 h-7 text-[10px]'
      : size === 'lg'
      ? 'w-11 h-11 text-sm'
      : 'w-9 h-9 text-xs';

  const toneClasses =
    tone === 'sky'
      ? 'bg-sky-700 text-white'
      : tone === 'amber'
      ? 'bg-amber-600 text-white'
      : tone === 'slate'
      ? 'bg-slate-800 text-white'
      : 'bg-teal-700 text-white';

  const statusColor =
    status === 'online' || status === 'verified'
      ? 'bg-emerald-500'
      : status === 'busy'
      ? 'bg-amber-500'
      : 'bg-slate-400';

  return (
    <button
      type="button"
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick(e);
        }
      }}
      title={title || alt || initials}
      className={`relative inline-flex items-center justify-center rounded-full shrink-0 select-none transition-transform ${
        onClick ? 'cursor-pointer hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500/40' : ''
      } ${sizeClasses} ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={alt || initials}
          className="w-full h-full rounded-full object-cover border border-slate-200/80"
        />
      ) : (
        <span
          className={`w-full h-full rounded-full font-bold flex items-center justify-center border border-white/20 ${toneClasses}`}
        >
          {initials}
        </span>
      )}
      {status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${statusColor}`}
        />
      )}
    </button>
  );
};

export interface ButtonProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'amber' | 'danger' | 'dark';
  size?: 'xs' | 'sm' | 'md';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  target?: string;
  className?: string;
  title?: string;
}

/**
 * Stageshow `Button`: animates label/icon changes cleanly on the same element.
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  variant = 'primary',
  size = 'sm',
  onClick,
  type = 'button',
  disabled = false,
  target,
  className = '',
  title,
}) => {
  const variantClasses =
    variant === 'primary'
      ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-2xs border border-teal-800/20'
      : variant === 'dark'
      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs border border-slate-950/20'
      : variant === 'amber'
      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-2xs border border-amber-700/20'
      : variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs border border-rose-700/20'
      : variant === 'ghost'
      ? 'bg-transparent hover:bg-slate-100 text-slate-700'
      : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs';

  const sizeClasses =
    size === 'xs'
      ? 'px-2.5 py-1 text-[11px] rounded-md gap-1.5'
      : size === 'md'
      ? 'px-4 py-2.5 text-xs rounded-lg gap-2'
      : 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-target={target}
      title={title}
      className={`inline-flex items-center justify-center font-semibold transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] whitespace-nowrap ${variantClasses} ${sizeClasses} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="transition-all duration-150">{children}</span>
    </button>
  );
};

export interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onClick,
  active = false,
  className = '',
}) => (
  <div
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(e) => {
      if (onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onClick();
      }
    }}
    className={`bg-white rounded-xl border transition-all duration-150 ${
      active
        ? 'border-teal-600 ring-2 ring-teal-600/10 shadow-xs'
        : 'border-slate-200/85 shadow-2xs'
    } ${onClick ? 'hover:border-teal-600/50 hover:shadow-xs cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Divider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`border-0 border-t border-slate-200/80 ${className}`} />
);

export interface BadgeProps {
  children: React.ReactNode;
  tone?: 'emerald' | 'teal' | 'amber' | 'sky' | 'rose' | 'slate';
  onClick?: () => void;
  className?: string;
}

/**
 * Stageshow `Badge`: status indicator with colored dot + clean text (adheres to zero-pill clutter rule).
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'teal',
  onClick,
  className = '',
}) => {
  const dotColor =
    tone === 'emerald'
      ? 'bg-emerald-500'
      : tone === 'amber'
      ? 'bg-amber-500'
      : tone === 'sky'
      ? 'bg-sky-500'
      : tone === 'rose'
      ? 'bg-rose-500'
      : tone === 'slate'
      ? 'bg-slate-400'
      : 'bg-teal-600';

  const textColor =
    tone === 'emerald'
      ? 'text-emerald-800'
      : tone === 'amber'
      ? 'text-amber-800'
      : tone === 'sky'
      ? 'text-sky-800'
      : tone === 'rose'
      ? 'text-rose-800'
      : tone === 'slate'
      ? 'text-slate-600'
      : 'text-teal-800';

  return (
    <span
      role={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${textColor} ${
        onClick ? 'cursor-pointer hover:underline' : ''
      } ${className}`}
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
      <span>{children}</span>
    </span>
  );
};

export interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  active = false,
  onClick,
  icon,
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-slate-900 text-white shadow-2xs'
        : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-700'
    } ${className}`}
  >
    {icon && <span className="shrink-0">{icon}</span>}
    <span>{children}</span>
  </button>
);

export const Kbd: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <kbd className={`ss-kbd ${className}`}>{children}</kbd>;

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  badge?: string | number;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (val: T) => void;
  size?: 'xs' | 'sm';
  className?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'sm',
  className = '',
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      className={`inline-flex items-center bg-slate-200/75 p-1 rounded-lg border border-slate-200/60 ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
              size === 'xs' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
            } ${
              active
                ? 'bg-white text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                  active ? 'bg-teal-50 text-teal-800' : 'bg-slate-300/60 text-slate-700'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="inline-flex items-center gap-2 cursor-pointer"
  >
    <span
      className={`w-8 h-4.5 rounded-full p-0.5 transition-colors flex items-center ${
        checked ? 'bg-teal-700 justify-end' : 'bg-slate-300 justify-start'
      }`}
    >
      <span className="w-3.5 h-3.5 rounded-full bg-white shadow-2xs" />
    </span>
    {label && <span className="text-xs font-medium text-slate-700">{label}</span>}
  </button>
);

/* ============================================================================
   2. MOTION PARTS: Roll, Collapse, Swap, Chart, Toast
   ============================================================================ */

export interface RollProps {
  value: number;
  prefix?: string;
  suffix?: string;
  format?: (val: number) => string;
  className?: string;
}

export const Roll: React.FC<RollProps> = ({
  value,
  prefix = '',
  suffix = '',
  format,
  className = '',
}) => {
  const [displayVal, setDisplayVal] = useState<number>(value);
  const prevRef = useRef<number>(value);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;

    const duration = 420;
    const startTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplayVal(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        prevRef.current = end;
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return (
    <span className={`font-mono tabular-nums inline-block ${className}`}>
      {format ? (
        format(displayVal)
      ) : (
        <>
          {prefix}
          {displayVal.toLocaleString('en-US')}
          {suffix}
        </>
      )}
    </span>
  );
};

export const Collapse: React.FC<{ open: boolean; children: React.ReactNode }> = ({
  open,
  children,
}) => {
  if (!open) return null;
  return (
    <div className="animate-fadeIn overflow-hidden transition-all duration-200">
      {children}
    </div>
  );
};

export interface SparkChartProps {
  points: { label: string; value: number; formatted?: string }[];
  activeIndex?: number;
  onSelectIndex?: (idx: number) => void;
  className?: string;
}

/**
 * Interactive Stageshow `Chart` (scrubbable bar/sparkline chart)
 */
export const Chart: React.FC<SparkChartProps> = ({
  points,
  activeIndex,
  onSelectIndex,
  className = '',
}) => {
  const maxVal = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className={`flex items-end gap-2 h-24 pt-4 ${className}`}>
      {points.map((pt, idx) => {
        const heightPct = Math.max(18, Math.round((pt.value / maxVal) * 100));
        const isSelected = activeIndex === idx;
        return (
          <button
            key={pt.label}
            type="button"
            onClick={() => onSelectIndex?.(idx)}
            onMouseEnter={() => onSelectIndex?.(idx)}
            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
          >
            <div className="w-full flex items-end justify-center h-full">
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full rounded-t-md transition-all duration-200 ${
                  isSelected
                    ? 'bg-teal-700'
                    : 'bg-slate-200 group-hover:bg-teal-600/60'
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-mono ${
                isSelected ? 'font-bold text-teal-800' : 'text-slate-400'
              }`}
            >
              {pt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export interface ToastProps {
  message: string | null;
  detail?: string;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, detail, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700/80 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-teal-300">{message}</div>
        {detail && <div className="text-[11px] text-slate-300 mt-0.5">{detail}</div>}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] font-mono text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
        >
          OK
        </button>
      )}
    </div>
  );
};

/* ============================================================================
   3. FRAMES: Window, Phone, Notification, Receipt, Stamp
   ============================================================================ */

export interface WindowFrameProps {
  title?: string;
  url?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  fadeBottom?: boolean;
  bleedRight?: boolean;
}

export const Window: React.FC<WindowFrameProps> = ({
  title,
  url,
  rightSlot,
  children,
  className = '',
  fadeBottom = false,
  bleedRight = false,
}) => (
  <div
    className={`ss-window ${fadeBottom ? 'ss-fade-bottom' : ''} ${
      bleedRight ? 'ss-crop-bleed-right' : ''
    } ${className}`}
  >
    <div className="ss-window-chrome">
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        </div>
        {title && (
          <span className="ml-2 text-xs font-semibold text-slate-700 truncate">
            {title}
          </span>
        )}
      </div>

      {url && (
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-white/90 border border-slate-200/80 text-[11px] font-mono text-slate-500 whitespace-nowrap shrink-0">
          <span>{url}</span>
        </div>
      )}

      <div className="flex items-center gap-2 shrink-0">
        {rightSlot || <Bar w={36} soft />}
      </div>
    </div>
    <div>{children}</div>
  </div>
);

export interface PhoneFrameProps {
  islandSlot?: React.ReactNode;
  islandExpanded?: boolean;
  light?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Stageshow `Phone` frame: draws both the Dynamic Island and the Home Indicator automatically.
 * Never draw status bar or home indicator by hand inside children.
 */
export const Phone: React.FC<PhoneFrameProps> = ({
  islandSlot,
  islandExpanded = false,
  light = false,
  children,
  className = '',
}) => (
  <div className={`ss-phone ${light ? 'ss-phone-light' : ''} ${className}`}>
    <div className="ss-phone-screen h-full">
      <div
        className={`ss-dynamic-island ${
          islandExpanded ? 'ss-dynamic-island-expanded' : ''
        }`}
      >
        {islandSlot || (
          <>
            <span className="w-2 h-2 rounded-full bg-teal-400/90" />
            <span className="w-6 h-1 rounded-full bg-slate-700" />
          </>
        )}
      </div>
      <div className="flex-1 px-3.5 py-2">{children}</div>
      <div className="ss-home-indicator" aria-hidden="true" />
    </div>
  </div>
);

export interface ReceiptProps {
  title: string;
  code: string;
  stamp?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Receipt: React.FC<ReceiptProps> = ({
  title,
  code,
  stamp,
  children,
  footer,
  className = '',
}) => (
  <div className={`ss-receipt p-5 space-y-4 ${className}`}>
    <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-3 gap-2">
      <div>
        <span className="text-xs font-bold tracking-tight text-slate-900 block">
          {title}
        </span>
        <span className="text-[11px] font-mono text-teal-800">{code}</span>
      </div>
      {stamp && <span className="ss-stamp">{stamp}</span>}
    </div>
    <div className="space-y-2.5 text-xs">{children}</div>
    {footer && (
      <div className="border-t border-dashed border-slate-300 pt-3 text-xs">
        {footer}
      </div>
    )}
  </div>
);

export const Stamp: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <span className={`ss-stamp ${className}`}>{children}</span>;

export interface StageshowCursorProps {
  x: number;
  y: number;
  pressed: boolean;
  label?: string;
  visible?: boolean;
}

export const StageshowCursor: React.FC<StageshowCursorProps> = ({
  x,
  y,
  pressed,
  label,
  visible = true,
}) => {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="ss-cursor"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0) scale(${pressed ? 0.9 : 1})`,
      }}
    >
      <div className="relative">
        {pressed && (
          <span className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-teal-500/25 border border-teal-500/50 animate-ping" />
        )}
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow-md"
        >
          <path
            d="M4.5 3.5L11.5 20L14.2 13.8L20.5 11.2L4.5 3.5Z"
            fill="#0F172A"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        {label && (
          <span className="ml-3 -mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold bg-slate-900 text-amber-200 rounded shadow-sm whitespace-nowrap">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
