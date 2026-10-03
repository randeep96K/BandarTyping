import React, { useState } from 'react';
import { X, Play, BookOpen } from 'lucide-react';

interface CustomTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export const CustomTextModal: React.FC<CustomTextModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [customText, setCustomText] = useState('');

  const sampleTexts = [
    {
      title: 'भारतीय संस्कृति एवं एकता',
      text: 'भारत की संस्कृति विश्व की सबसे प्राचीन और समृद्ध संस्कृतियों में से एक है। यहाँ विभिन्न धर्मों, जातियों और भाषाओं के लोग मिलकर सौहार्दपूर्वक रहते हैं। विविधता में एकता हमारे देश की सबसे बड़ी विशेषता और शक्ति है।',
    },
    {
      title: 'डिजिटल भारत और प्रौद्योगिकी',
      text: 'वर्तमान युग में डिजिटल क्रांति ने हमारे जीवन को पूरी तरह से बदल दिया है। इंटरनेट, स्मार्टफोन और ऑनलाइन सेवाओं ने दूरियों को मिटाकर ज्ञान और प्रगति के नए अवसर खोले हैं। कंप्यूटर पर हिंदी लिखना अब बहुत आसान हो गया है।',
    },
    {
      title: 'पर्यावरण एवं प्रकृति संरक्षण',
      text: 'प्रकृति हमारा जीवनदाता है। शुद्ध हवा, स्वच्छ जल और हरी-भरी धरती मानव अस्तित्व के लिए अनिवार्य हैं। हमें पेड़ों की रक्षा करनी चाहिए और पर्यावरण प्रदूषण को रोकने के लिए ठोस कदम उठाने चाहिए।',
    },
  ];

  if (!isOpen) return null;

  const wordCount = customText.trim() ? customText.trim().split(/\s+/).length : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim()) return;
    onSubmit(customText.trim());
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BookOpen size={18} className="title-icon" />
            <span>कस्टम हिंदी टेक्स्ट (Custom Hindi Text)</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="बंद करें">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p className="modal-desc">
            यहाँ अपना कोई भी हिंदी गद्यांश या वाक्य लिखें अथवा पेस्ट करें। आप नीचे दिए गए उदाहरणों में से भी चुन सकते हैं।
          </p>

          {/* Quick Preset Buttons */}
          <div className="preset-buttons">
            {sampleTexts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                className="preset-btn"
                onClick={() => setCustomText(sample.text)}
              >
                {sample.title}
              </button>
            ))}
          </div>

          <div className="textarea-wrapper">
            <textarea
              className="custom-textarea"
              rows={6}
              placeholder="यहाँ हिंदी में लिखें या पेस्ट करें... (उदा. भारत एक महान देश है)"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              autoFocus
            />
            <div className="textarea-footer">
              <span className="word-count-badge">कुल शब्द: {wordCount}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={wordCount === 0}
            >
              <Play size={16} />
              <span>प्रैक्टिस शुरू करें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
