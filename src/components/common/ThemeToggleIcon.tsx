import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Sparkles, Check, Monitor } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface Props {
  showLabel?: boolean;
  className?: string;
}

export const ThemeToggleIcon: React.FC<Props> = ({ showLabel = false, className = '' }) => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDark = theme === 'dark';

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={toggleTheme}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowDropdown(!showDropdown);
        }}
        title={`Current: ${isDark ? 'Dark Theme (Night Shift)' : 'Light Theme (Clinical Daylight)'}. Click to switch theme.`}
        className={`
          relative flex items-center justify-center gap-2 p-2 rounded-xl border transition-all duration-200 cursor-pointer
          ${isDark 
            ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750 hover:border-amber-500/50 shadow-xs' 
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-xs'
          }
        `}
        aria-label="Toggle application theme"
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          {/* Animated Sun Icon */}
          <Sun 
            className={`
              w-4 h-4 transition-all duration-300 transform absolute
              ${isDark 
                ? 'rotate-0 scale-100 opacity-100 text-amber-400' 
                : '-rotate-90 scale-0 opacity-0'
              }
            `} 
          />
          {/* Animated Moon Icon */}
          <Moon 
            className={`
              w-4 h-4 transition-all duration-300 transform absolute
              ${!isDark 
                ? 'rotate-0 scale-100 opacity-100 text-indigo-600' 
                : 'rotate-90 scale-0 opacity-0'
              }
            `} 
          />
        </div>

        {showLabel && (
          <span className="text-xs font-semibold">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
      </button>

      {/* Optional Quick Mode Selector Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 animate-in fade-in">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Theme Mode
          </div>
          
          <button
            onClick={() => { setTheme('light'); setShowDropdown(false); }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition ${
              theme === 'light'
                ? 'bg-blue-50 dark:bg-slate-700/60 text-blue-700 dark:text-blue-400 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Clinical Daylight (Light)</span>
            </div>
            {theme === 'light' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          </button>

          <button
            onClick={() => { setTheme('dark'); setShowDropdown(false); }}
            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition mt-0.5 ${
              theme === 'dark'
                ? 'bg-blue-50 dark:bg-slate-700/60 text-blue-700 dark:text-blue-400 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Night Duty (Dark)</span>
            </div>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          </button>
        </div>
      )}
    </div>
  );
};
