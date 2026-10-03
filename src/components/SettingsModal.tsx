import React from 'react';
import { X, Settings as SettingsIcon, Palette, Volume2, Type, Sliders, Eye } from 'lucide-react';
import type { TestSettings, ThemeId, CaretStyle, SoundType, Difficulty } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TestSettings;
  onUpdateSettings: (newSettings: Partial<TestSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const themes: { id: ThemeId; name: string; bg: string; accent: string }[] = [
    { id: 'bandar-dark', name: 'Bandar Dark (डार्क चारकोल व स्वर्ण)', bg: '#323437', accent: '#e2b714' },
    { id: 'monokai', name: 'Monokai (मोनोकाई हरा)', bg: '#272822', accent: '#a6e22e' },
    { id: 'midnight', name: 'Midnight (गहरा नीला व आसमानी)', bg: '#0e131f', accent: '#38bdf8' },
    { id: 'maroon', name: 'Maroon (देवनागरी मैरून व बादामी)', bg: '#1f1418', accent: '#f6c177' },
    { id: 'matrix', name: 'Matrix (मैट्रिक्स नियॉन ग्रीन)', bg: '#0b110b', accent: '#10b981' },
    { id: 'nord', name: 'Nord (नॉर्डिक शीत)', bg: '#2e3440', accent: '#88c0d0' },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog settings-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <SettingsIcon size={18} className="title-icon" />
            <span>सेटिंग्स (Settings)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="बंद करें">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body settings-body">
          {/* Theme Section */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">
                <Palette size={16} />
                <span>थीम (Theme)</span>
              </div>
              <div className="setting-desc">वेबसाइट का रंगरूप और स्टाइल चुनें</div>
            </div>
            <div className="theme-options-grid">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-badge ${settings.theme === t.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                >
                  <span className="theme-preview-dot" style={{ backgroundColor: t.accent }} />
                  <span className="theme-name">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sound Section */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">
                <Volume2 size={16} />
                <span>कीबोर्ड साउंड (Sound Effects)</span>
              </div>
              <div className="setting-desc">टाइपिंग करते समय कीस्ट्रोक ध्वनि</div>
            </div>
            <div className="pill-options">
              {(
                [
                  { id: 'off', label: 'बंद (Off)' },
                  { id: 'mechanical', label: 'मैकेनिकल (Mechanical)' },
                  { id: 'modern', label: 'मॉडर्न क्लिक (Click)' },
                  { id: 'typewriter', label: 'टाइपराइटर (Typewriter)' },
                ] as { id: SoundType; label: string }[]
              ).map((snd) => (
                <button
                  key={snd.id}
                  type="button"
                  className={`pill-btn ${settings.sound === snd.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ sound: snd.id })}
                >
                  {snd.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">
                <Type size={16} />
                <span>फ़ॉन्ट आकार (Font Size)</span>
              </div>
              <div className="setting-desc">टाइपिंग क्षेत्र में हिंदी अक्षरों का आकार</div>
            </div>
            <div className="pill-options">
              {[
                { id: 'small', label: 'छोटा (Small)' },
                { id: 'medium', label: 'मध्यम (Medium)' },
                { id: 'large', label: 'बड़ा (Large)' },
                { id: 'xlarge', label: 'विशाल (Extra Large)' },
              ].map((sz) => (
                <button
                  key={sz.id}
                  type="button"
                  className={`pill-btn ${settings.fontSize === sz.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ fontSize: sz.id as any })}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>

          {/* Caret Style & Smoothness */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">
                <Sliders size={16} />
                <span>कर्सर शैली (Caret Style)</span>
              </div>
              <div className="setting-desc">कर्सर का स्वरूप और गति</div>
            </div>
            <div className="pill-options">
              {(
                [
                  { id: 'line', label: 'लाइन (|)' },
                  { id: 'block', label: 'ब्लॉक (█)' },
                  { id: 'underline', label: 'अंडरलाइन (_)' },
                  { id: 'hidden', label: 'छिपा हुआ (Off)' },
                ] as { id: CaretStyle; label: string }[]
              ).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`pill-btn ${settings.caretStyle === c.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ caretStyle: c.id })}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Smooth Caret Toggle */}
          <div className="setting-row toggle-row">
            <div className="setting-info">
              <div className="setting-label">
                <span>स्मूथ कर्सर (Smooth Caret)</span>
              </div>
              <div className="setting-desc">अक्षरों के बीच कर्सर का सुगम संचलन</div>
            </div>
            <button
              type="button"
              className={`toggle-switch ${settings.smoothCaret ? 'on' : 'off'}`}
              onClick={() => onUpdateSettings({ smoothCaret: !settings.smoothCaret })}
            >
              <div className="toggle-slider" />
            </button>
          </div>

          {/* Live Indicators */}
          <div className="setting-row toggle-row">
            <div className="setting-info">
              <div className="setting-label">
                <Eye size={16} />
                <span>लाइव WPM दिखाएँ (Live WPM)</span>
              </div>
              <div className="setting-desc">टाइपिंग करते समय वास्तविक समय में WPM प्रदर्शित करें</div>
            </div>
            <button
              type="button"
              className={`toggle-switch ${settings.showLiveWpm ? 'on' : 'off'}`}
              onClick={() => onUpdateSettings({ showLiveWpm: !settings.showLiveWpm })}
            >
              <div className="toggle-slider" />
            </button>
          </div>

          <div className="setting-row toggle-row">
            <div className="setting-info">
              <div className="setting-label">
                <span>लाइव सटीकता दिखाएँ (Live Accuracy)</span>
              </div>
              <div className="setting-desc">टाइपिंग करते समय सटीकता प्रतिशत प्रदर्शित करें</div>
            </div>
            <button
              type="button"
              className={`toggle-switch ${settings.showLiveAccuracy ? 'on' : 'off'}`}
              onClick={() => onUpdateSettings({ showLiveAccuracy: !settings.showLiveAccuracy })}
            >
              <div className="toggle-slider" />
            </button>
          </div>

          {/* Hindi Difficulty */}
          <div className="setting-row">
            <div className="setting-info">
              <div className="setting-label">
                <span>हिंदी पाठ कठिनाई (Difficulty)</span>
              </div>
              <div className="setting-desc">सरल, सामान्य अथवा कठिन संयुक्त अक्षर शब्दावली</div>
            </div>
            <div className="pill-options">
              {(
                [
                  { id: 'easy', label: 'सरल (Easy)' },
                  { id: 'medium', label: 'सामान्य (Medium)' },
                  { id: 'hard', label: 'कठिन (Hard)' },
                ] as { id: Difficulty; label: string }[]
              ).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`pill-btn ${settings.difficulty === d.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ difficulty: d.id })}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
