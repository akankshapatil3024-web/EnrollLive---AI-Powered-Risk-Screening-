import React, { useState } from 'react';
import { Settings, Shield, Bell, Moon, Smartphone, CheckCircle2, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggleIcon } from '../common/ThemeToggleIcon';
import { DisclaimerBanner } from '../common/DisclaimerBanner';

export const PatientSettings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [phoneAlerts, setPhoneAlerts] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <DisclaimerBanner />

      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-700" />
            Patient Portal Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your recovery notification preferences, appearance, and security settings
          </p>
        </div>

        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Preferences updated successfully.</span>
          </div>
        )}

        {/* Display Theme Mode Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Display Appearance & Theme
          </h3>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">
                  {theme === 'dark' ? 'Night Duty Theme (Dark Mode)' : 'Clinical Daylight Theme (Light Mode)'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {theme === 'dark' ? 'Reduced glare for nighttime viewing & lower eye strain' : 'High-clarity daylight clinical interface'}
                </div>
              </div>
            </div>

            <ThemeToggleIcon showLabel={true} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Clinical Outreach Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">SMS / Telephone Reminders</div>
                  <div className="text-[11px] text-slate-500">Receive reminders for scheduled post-discharge check-ins</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={phoneAlerts}
                onChange={(e) => setPhoneAlerts(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Email Discharge Summary Updates</div>
                  <div className="text-[11px] text-slate-500">Receive notifications when your physician uploads new care reports</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
