import React from 'react';
import { X, Bell, CheckCircle2 } from 'lucide-react';
import type { NotificationItem } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog notif-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Bell size={18} className="title-icon" />
            <span>सूचनाएँ एवं अपडेट (Notifications)</span>
          </div>
          <div className="header-actions">
            <button className="mark-read-btn" onClick={onMarkAllRead} title="सभी को पढ़ा हुआ चिह्नित करें">
              <CheckCircle2 size={16} />
              <span>सभी पढ़ें</span>
            </button>
            <button className="modal-close-btn" onClick={onClose} aria-label="बंद करें">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body notif-body">
          {notifications.length === 0 ? (
            <div className="empty-notif">कोई नई सूचना नहीं है।</div>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className={`notif-card ${item.read ? 'read' : 'unread'}`}>
                <div className="notif-card-header">
                  <span className="notif-card-title">{item.title}</span>
                  <span className="notif-card-time">{item.timestamp}</span>
                </div>
                <div className="notif-card-desc">{item.description}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
