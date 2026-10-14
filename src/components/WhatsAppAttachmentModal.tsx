import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Download,
  Copy,
  Check,
  X,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  WhatsAppAttachmentItem,
  createWhatsAppUrl,
  openExternalLink,
  downloadAllAttachments,
  downloadOrderAsZip,
  copyImageToClipboard,
  DISPLAY_WHATSAPP_NUMBER,
  BUSINESS_WHATSAPP_NUMBER,
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
  title = 'Order Enquiry Prepared',
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusNote, setStatusNote] = useState<string>('');

  useEffect(() => {
    if (isOpen && attachments && attachments.length > 0 && attachments[0].url) {
      // Auto-copy primary artwork image to clipboard instantly on modal mount
      copyImageToClipboard(attachments[0].url)
        .then((success) => {
          if (success) {
            setCopiedIndex(0);
            setStatusNote('Artwork image copied to clipboard! Just press Ctrl + V in WhatsApp to attach photo.');
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenWhatsAppChat = () => {
    const url = createWhatsAppUrl(messageText, BUSINESS_WHATSAPP_NUMBER);
    openExternalLink(url);
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    await downloadAllAttachments(attachments);
    setTimeout(() => setIsDownloading(false), 1200);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    await downloadOrderAsZip(attachments, 'DotAndArt_Order_Artworks.zip');
    setTimeout(() => setIsDownloading(false), 1200);
  };

  const handleCopyImage = async (url: string, index: number) => {
    const success = await copyImageToClipboard(url);
    if (success) {
      setCopiedIndex(index);
      setStatusNote(`Photo #${index + 1} copied! Press Ctrl+V in WhatsApp chat.`);
      setTimeout(() => setCopiedIndex(null), 3000);
    } else {
      await downloadAllAttachments([attachments[index]]);
      setStatusNote(`Downloaded photo #${index + 1}.`);
    }
  };

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
                Direct WhatsApp Order
              </span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-theme-primary">
              {title}
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Order messaging directly connected to artist Shital Thosar ({DISPLAY_WHATSAPP_NUMBER}).
            </p>
          </div>

          {/* How to Send Instructions */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-theme-primary space-y-2">
            <div className="font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Direct WhatsApp Order:</span>
            </div>
            <p className="text-theme-primary text-xs leading-relaxed">
              Your order details will be sent directly as a text message on WhatsApp. <strong>Order Suggestion:</strong> After placing order please download the images from the catalog and send to Shital once your communication channel is established.
            </p>
          </div>

          {/* Attachments gallery strip */}
          {attachments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-theme-primary flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-theme-accent" />
                  Order Artworks ({attachments.length} {attachments.length === 1 ? 'photo' : 'photos'}):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadZip}
                    disabled={isDownloading}
                    className="text-[11px] bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 px-2 py-0.5 rounded-md flex items-center gap-1 font-medium cursor-pointer border border-theme-glass transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download ZIP (.zip)</span>
                  </button>
                  <button
                    onClick={handleDownloadAll}
                    disabled={isDownloading}
                    className="text-[11px] text-theme-accent hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>{isDownloading ? 'Downloading...' : 'Download JPGs'}</span>
                  </button>
                </div>
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

                    {/* Copy button */}
                    <button
                      onClick={() => handleCopyImage(item.url, idx)}
                      className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/75 hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition-transform active:scale-95 shadow cursor-pointer"
                      title="Copy image to paste into WhatsApp (Ctrl+V)"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy (Ctrl+V)</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statusNote && (
            <p className="text-xs text-center font-semibold text-emerald-600 dark:text-emerald-400">
              {statusNote}
            </p>
          )}

          {/* Primary Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleOpenWhatsAppChat}
              className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Open WhatsApp Chat ({DISPLAY_WHATSAPP_NUMBER})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            {attachments.length > 0 && (
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className="w-full py-2.5 px-4 rounded-full glass-button text-theme-primary text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:border-theme-accent transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-theme-accent" />
                <span>
                  {isDownloading
                    ? 'Downloading artwork files...'
                    : `Download ${attachments.length} Artwork File${attachments.length > 1 ? 's' : ''}`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
