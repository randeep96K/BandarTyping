import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import type { Language } from '../types';

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const languages: { id: Language; label: string; sublabel: string }[] = [
    { id: 'hindi', label: 'हिन्दी', sublabel: 'मानक शब्दावली (Standard)' },
    { id: 'hindi-easy', label: 'हिन्दी (सरल)', sublabel: 'दैनिक एवं सरल शब्द (Easy)' },
    { id: 'hindi-hard', label: 'हिन्दी (कठिन)', sublabel: 'संयुक्त अक्षर एवं तकनीकी (Complex)' },
  ];

  const currentLang = languages.find((l) => l.id === language) || languages[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="language-selector-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`language-pill-btn ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Globe size={15} className="globe-icon" />
        <span className="lang-name">{currentLang.label}</span>
        <ChevronDown size={14} className={`chevron-icon ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="language-dropdown-menu">
          <div className="dropdown-header">टाइपिंग भाषा चुनें</div>
          {languages.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dropdown-item ${language === item.id ? 'active' : ''}`}
              onClick={() => {
                onLanguageChange(item.id);
                setIsOpen(false);
              }}
            >
              <div className="item-text">
                <span className="item-title">{item.label}</span>
                <span className="item-subtitle">{item.sublabel}</span>
              </div>
              {language === item.id && <Check size={16} className="item-check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
