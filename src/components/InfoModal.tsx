import React from 'react';
import { X, HelpCircle, Keyboard, Globe, Sparkles } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <HelpCircle size={18} className="title-icon" />
            <span>हिंदी टाइपिंग गाइड एवं जानकारी (Hindi Typing Guide)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="बंद करें">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body guide-content">
          {/* Section 1: Introduction */}
          <div className="guide-section">
            <h3 className="section-title">
              <Sparkles size={16} /> बंदरटाइपिंग (BandarTyping) क्या है?
            </h3>
            <p className="section-text">
              BandarTyping एक आधुनिक, न्यूनतम और तीव्र गति वाला हिंदी टाइपिंग अभ्यास प्लेटफॉर्म है।
              यह मानक देवनागरी यूनिकोड और ग्रैफ़ीम क्लस्टर्स (Grapheme Clusters) का पूर्ण समर्थन करता है,
              जिससे संयुक्त अक्षर और मात्राएँ टाइप करते समय कोई त्रुटि नहीं आती।
            </p>
          </div>

          {/* Section 2: Windows me Hindi Keyboard setup */}
          <div className="guide-section">
            <h3 className="section-title">
              <Keyboard size={16} /> विंडोज में हिंदी कीबोर्ड कैसे सक्रिय करें?
            </h3>
            <ol className="guide-list">
              <li>
                <strong>सेटिंग्स खोलें:</strong> <code>Win + I</code> दबाएँ और <em>Time & Language</em> &gt; <em>Language & Region</em> पर जाएँ।
              </li>
              <li>
                <strong>हिंदी जोड़ें:</strong> <em>Add a language</em> पर क्लिक करके <strong>Hindi (हिंदी)</strong> चुनें।
              </li>
              <li>
                <strong>कीबोर्ड चुनें:</strong> भाषा के विकल्प में जाकर <strong>Hindi Phonetic</strong> (ध्वन्यात्मक) अथवा <strong>Hindi InScript</strong> (सरकारी मानक) कीबोर्ड जोड़ें।
              </li>
              <li>
                <strong>भाषा बदलें:</strong> कीबोर्ड पर <code>Win + Space</code> या <code>Alt + Shift</code> दबाकर तुरंत हिंदी इनपुट चालू करें।
              </li>
            </ol>
          </div>

          {/* Section 3: InScript vs Phonetic & Google Tools */}
          <div className="guide-section">
            <h3 className="section-title">
              <Globe size={16} /> समर्थित इनपुट विधियाँ (Input Methods)
            </h3>
            <div className="input-methods-grid">
              <div className="method-card">
                <div className="method-title">1. Hindi Phonetic / Google Tools</div>
                <div className="method-desc">
                  अंग्रेजी अक्षरों से हिंदी टाइप करें। जैसे: <code>bharat</code> टाइप करने पर <code>भारत</code> बन जाता है।
                </div>
              </div>
              <div className="method-card">
                <div className="method-title">2. Windows InScript</div>
                <div className="method-desc">
                  मानक सरकारी कीबोर्ड लेआउट। बाएँ हाथ पर स्वर व मात्राएँ और दाएँ हाथ पर व्यंजन होते हैं। हलन्त (d कुंजी) से संयुक्त अक्षर बनते हैं।
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Devanagari Conjuncts (संयुक्त अक्षर) */}
          <div className="guide-section">
            <h3 className="section-title">
              <span>देवनागरी संयुक्त अक्षर सारणी (Conjuncts Cheat Sheet)</span>
            </h3>
            <div className="table-responsive">
              <table className="conjunct-table">
                <thead>
                  <tr>
                    <th>संयुक्त अक्षर</th>
                    <th>निर्माण सूत्र (Combination)</th>
                    <th>उदाहरण शब्द</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="sym">क्ष</td>
                    <td>क + ् (हलन्त) + ष</td>
                    <td>क्षमा, शिक्षा</td>
                  </tr>
                  <tr>
                    <td className="sym">त्र</td>
                    <td>त + ् + र</td>
                    <td>छात्र, त्रिशूल</td>
                  </tr>
                  <tr>
                    <td className="sym">ज्ञ</td>
                    <td>ज + ् + ञ</td>
                    <td>ज्ञान, विज्ञान</td>
                  </tr>
                  <tr>
                    <td className="sym">श्र</td>
                    <td>श + ् + र</td>
                    <td>श्रम, श्रीमान</td>
                  </tr>
                  <tr>
                    <td className="sym">द्ध</td>
                    <td>द + ् + ध</td>
                    <td>प्रसिद्ध, बुद्धि</td>
                  </tr>
                  <tr>
                    <td className="sym">द्व</td>
                    <td>द + ् + व</td>
                    <td>द्वार, द्वितीय</td>
                  </tr>
                  <tr>
                    <td className="sym">प्र</td>
                    <td>प + ् + र (पदेन)</td>
                    <td>प्रौद्योगिकी, प्रेरणा</td>
                  </tr>
                  <tr>
                    <td className="sym">र्म</td>
                    <td>र + ् + म (रेफ़)</td>
                    <td>धर्म, कर्म</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Keyboard Shortcuts */}
          <div className="guide-section">
            <h3 className="section-title">शॉर्टकट कुंजियाँ (Keyboard Shortcuts)</h3>
            <div className="shortcuts-grid">
              <div className="shortcut-row">
                <kbd>Tab</kbd> + <kbd>Enter</kbd>
                <span>वर्तमान टेस्ट पुनः आरंभ करें (Restart Test)</span>
              </div>
              <div className="shortcut-row">
                <kbd>Esc</kbd>
                <span>टेस्ट रीसेट अथवा बाहर निकलें</span>
              </div>
              <div className="shortcut-row">
                <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>
                <span>त्वरित कमांड पैलेट खोलें (Command Palette)</span>
              </div>
              <div className="shortcut-row">
                <kbd>Space</kbd>
                <span>शब्द विभाजन एवं अगला शब्द (Submit word)</span>
              </div>
              <div className="shortcut-row">
                <kbd>Backspace</kbd>
                <span>गलती सुधारें (पिछले शब्द पर भी जा सकते हैं)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
