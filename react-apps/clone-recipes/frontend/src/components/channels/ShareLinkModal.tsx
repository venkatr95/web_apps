import { Copy, Share, X } from 'lucide-react';
import React from 'react';
import '../../styles/ShareLinkModal.css';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
  channelLink: string;
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({
  isOpen,
  onClose,
  channelName,
  channelLink,
}) => {
  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(channelLink);
      // TODO: Show success toast
    } catch (err) {
      // TODO: Show error toast
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(channelLink)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="share-modal-overlay">
      <div className="share-modal">
        <div className="share-modal-header">
          <h2 className="share-modal-title">Channel link</h2>
          <button className="share-modal-close" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="share-modal-content">
          <div className="share-modal-channel">
            <div className="share-modal-channel-icon">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {channelName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="share-modal-channel-info">
              <h3 className="share-modal-channel-name">{channelName}</h3>
              <p className="share-modal-channel-link">{channelLink}</p>
            </div>
          </div>

          <p className="share-modal-description">
            People with this link can view and follow your channel.
          </p>

          <div className="share-modal-actions">
            <button className="share-modal-action-button" onClick={handleWhatsAppShare}>
              <Share className="w-5 h-5" />
              <span>Send link via WhatsApp</span>
            </button>

            <button className="share-modal-action-button" onClick={handleCopyLink}>
              <Copy className="w-5 h-5" />
              <span>Copy link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;
