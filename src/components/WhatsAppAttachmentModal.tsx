import React, { useState } from 'react';
import {
  MessageCircle,
  Download,
  Copy,
  Check,
  X,
  Share2,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  WhatsAppAttachmentItem,
  createWhatsAppUrl,
  openExternalLink,
  downloadAllAttachments,
  copyImageToClipboard,
  sendNativeWhatsAppShare,
} from '../utils/whatsapp';

interface WhatsAppAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
  attachments: WhatsAppAttachmentItem[];
  title?: string;
}

export const WhatsAppAttachmentModal: React.FC<WhatsAppAttachmentModalProps> = ({
  isOpen,
  onClose,
  messageText,
  attachments,
  title = 'Enquiry & Attached Artwork',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [shareStatus, setShareStatus] = useState<string>('');

  if (!isOpen) return null;

  const handleOpenWhatsAppChat = () => {
    const url = createWhatsAppUrl(messageText);
    openExternalLink(url);
  };

  const handleNativeShare = async () => {
    setShareStatus('Preparing attachments...');
    const result = await sendNativeWhatsAppShare(messageText, attachments);
    if (result === 'shared') {
      setShareStatus('Opened in WhatsApp with attachments!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else if (result === 'cancelled') {
      setShareStatus('');
    } else {
      setShareStatus('Opening WhatsApp Web...');
      handleOpenWhatsAppChat();
    }
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    await downloadAllAttachments(attachments);
    setTimeout(() => setIsDownloading(false), 1200);
  };

  const handleCopyImage = async (url: string, index: number) => {
    const success = await copyImageToClipboard(url);
    if (success) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2500);
    } else {
      // Fallback: download that image
      await downloadAllAttachments([attachments[index]]);
    }
  };

  const hasNativeShare =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#12100E]/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg bg-theme-card text-theme-primary rounded-3xl border border-theme-glass craft-shadow p-6 sm:p-8 text-left space-y-6 shadow-2xl overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-theme-muted hover:bg-theme-glass hover:text-theme-primary transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-1.5 pr-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center">
                <MessageCircle className="w-4 h-4 fill-[#128C7E] text-white" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-theme-accent">
                WhatsApp Attachment Dispatch
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-theme-primary">
              {title}
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Images will go as direct attachments to the artist (+91 86521 62647) instead of links.
            </p>
          </div>

          {/* Attachments gallery strip */}
          {attachments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-theme-primary flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-theme-accent" />
                  Attached Artwork ({attachments.length} {attachments.length === 1 ? 'image' : 'images'}):
                </span>
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="text-[11px] text-theme-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>{isDownloading ? 'Downloading...' : 'Download all files'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-52 overflow-y-auto p-1">
                {attachments.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-theme-glass bg-theme-page aspect-square flex items-center justify-center shadow-xs"
                  >
                    <img
                      src={item.url}
                      alt={item.title || item.filename}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Badge */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-xs text-[9px] font-mono font-bold text-white">
                      #{idx + 1}
                    </div>

                    {/* Hover copy overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-2 text-center">
                      <button
                        onClick={() => handleCopyImage(item.url, idx)}
                        className="p-1.5 rounded-full bg-white text-black hover:bg-slate-100 transition-transform active:scale-95 shadow cursor-pointer"
                        title="Copy image to paste into WhatsApp Web"
                      >
                        {copiedIndex === idx ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-[10px] text-white font-medium">
                        {copiedIndex === idx ? 'Copied to clipboard!' : 'Copy image (Ctrl+V)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Step Guide */}
          <div className="p-3.5 rounded-2xl bg-theme-accent/10 border border-theme-accent/20 text-xs text-theme-primary space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-theme-accent">
              <Sparkles className="w-3.5 h-3.5" />
              <span>How your images are attached:</span>
            </div>
            <ul className="text-[11px] text-theme-muted space-y-1 list-disc list-inside">
              <li>
                <strong>Mobile devices:</strong> Tap the green button to attach images directly in WhatsApp.
              </li>
              <li>
                <strong>Desktop / WhatsApp Web:</strong> Download images or click Copy, then press <code className="bg-white/60 dark:bg-black/40 px-1 py-0.5 rounded text-[10px] font-mono">Ctrl+V</code> in the chat to paste the photos as attachments!
              </li>
            </ul>
          </div>

          {shareStatus && (
            <p className="text-xs text-center font-medium text-emerald-600 animate-pulse">
              {shareStatus}
            </p>
          )}

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            {hasNativeShare ? (
              <button
                onClick={handleNativeShare}
                className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4 fill-white" />
                <span>Send with Attachments to WhatsApp</span>
              </button>
            ) : null}

            <button
              onClick={handleOpenWhatsAppChat}
              className={`w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                hasNativeShare
                  ? 'bg-theme-card border border-theme-glass hover:bg-theme-page text-theme-primary'
                  : 'bg-[#25D366] hover:bg-[#1EBE5D] text-white'
              }`}
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Open WhatsApp Chat (+91 86521 62647)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {attachments.length > 0 && (
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="w-full py-2.5 px-4 rounded-full glass-button text-theme-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:border-theme-accent transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-theme-accent" />
                <span>{isDownloading ? 'Downloading artwork files...' : `Download ${attachments.length} Artwork Attachment${attachments.length > 1 ? 's' : ''}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
