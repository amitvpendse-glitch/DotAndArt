import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  FileText,
  Loader2,
} from 'lucide-react';
import {
  WhatsAppAttachmentItem,
  createWhatsAppUrl,
  openExternalLink,
  copyImageToClipboard,
} from '../utils/whatsapp';

import { SafeProductImage } from './SafeProductImage';

interface WhatsAppAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageText: string;
  attachments: WhatsAppAttachmentItem[];
  title?: string;
  onImageCopied?: () => void;
}

export const WhatsAppAttachmentModal: React.FC<WhatsAppAttachmentModalProps> = ({
  isOpen,
  onClose,
  messageText,
  attachments,
  title = 'Enquire Artwork',
  onImageCopied,
}) => {
  const [isCopyingImage, setIsCopyingImage] = useState<boolean>(false);
  const [isCopiedImage, setIsCopiedImage] = useState<boolean>(false);
  const [isCopiedText, setIsCopiedText] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string>('');

  useEffect(() => {
    if (isOpen && attachments && attachments.length > 0 && attachments[0]?.url) {
      setIsCopyingImage(true);
      setIsCopiedImage(false);
      setIsCopiedText(false);
      setStatusNote('Preparing lightweight artwork image for clipboard...');

      copyImageToClipboard(attachments[0].url)
        .then((success) => {
          setIsCopyingImage(false);
          setIsCopiedImage(true);
          onImageCopied?.();
          setStatusNote('Artwork image copied to clipboard! Click below to open WhatsApp and press Ctrl + V to attach.');
        })
        .catch(() => {
          setIsCopyingImage(false);
          setIsCopiedImage(true);
          onImageCopied?.();
          setStatusNote('Artwork image ready. Click Open WhatsApp and press Ctrl + V to paste.');
        });
    }
  }, [isOpen, attachments]);

  if (!isOpen) return null;

  const primaryItem = attachments && attachments.length > 0 ? attachments[0] : null;

  const handleCopySingleImage = async () => {
    if (!primaryItem || !primaryItem.url) return;
    const success = await copyImageToClipboard(primaryItem.url);
    if (success) {
      setIsCopiedImage(true);
      onImageCopied?.();
      setStatusNote('Artwork image copied! Now open WhatsApp and press Ctrl + V (or Paste) in chat.');
    } else {
      setIsCopiedImage(false);
      setStatusNote('Tip: Right-click or long-press the artwork image below & select "Copy Image", then paste in WhatsApp!');
    }
  };

  const handleCopyMessageText = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setIsCopiedText(true);
      setTimeout(() => setIsCopiedText(false), 3000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = messageText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopiedText(true);
      setTimeout(() => setIsCopiedText(false), 3000);
    }
  };

  const handleOpenWhatsAppChat = async () => {
    if (primaryItem && primaryItem.url && !isCopiedImage) {
      await copyImageToClipboard(primaryItem.url).catch(() => {});
      setIsCopiedImage(true);
      onImageCopied?.();
    }
    const url = createWhatsAppUrl(messageText);
    openExternalLink(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#12100E]/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg bg-theme-card text-theme-primary rounded-3xl border border-theme-glass craft-shadow p-6 sm:p-8 text-left space-y-5 shadow-2xl overflow-hidden my-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-theme-muted hover:bg-theme-glass hover:text-theme-primary transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="space-y-1 pr-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center shrink-0">
                <MessageCircle className="w-4.5 h-4.5 fill-[#128C7E] text-white" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-theme-accent">
                Single Artwork WhatsApp Enquiry
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-theme-primary">
              {title}
            </h3>
          </div>

          {/* Single Artwork Preview & Copy Box */}
          {primaryItem && (
            <div className="space-y-3 pt-1">
              <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden border-2 border-theme-accent/40 bg-theme-page shadow-md flex items-center justify-center p-2 group">
                <SafeProductImage
                  src={primaryItem.url}
                  sku={primaryItem.sku || ''}
                  name={primaryItem.title || 'Artwork'}
                  alt={primaryItem.title || 'Artwork'}
                  size="lg"
                  fit="contain"
                  className="w-full h-full object-contain rounded-xl cursor-pointer"
                />
                {primaryItem.sku && (
                  <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/80 text-white font-mono text-[11px] font-bold shadow-xs border border-white/20">
                    Code: {primaryItem.sku}
                  </span>
                )}
              </div>

              {/* Copy Artwork Image Button */}
              <button
                type="button"
                onClick={handleCopySingleImage}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isCopiedImage
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/50'
                    : 'bg-theme-accent hover:opacity-90 text-white active:scale-98'
                }`}
              >
                {isCopiedImage ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Artwork Image Copied! (Ready to Paste)</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Artwork Image (Ctrl + C / Tap to Copy)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Easy Instructions Notice Box */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-theme-primary space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>How to send photo in WhatsApp:</span>
            </div>
            <ol className="list-decimal list-inside text-[11px] leading-relaxed text-theme-primary space-y-1 font-medium">
              <li>Click <strong>Copy Artwork Image</strong> above (or right-click image &gt; Copy Image).</li>
              <li>Click <strong>Open WhatsApp Chat</strong> below.</li>
              <li>In WhatsApp, press <strong>Ctrl + V</strong> (or long-press <strong>Paste</strong> on mobile) inside the chat box to attach photo!</li>
            </ol>
          </div>

          {statusNote && (
            <p className="text-[11px] text-center font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
              {statusNote}
            </p>
          )}

          {/* Clean Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-theme-muted">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                <span>Pre-formatted WhatsApp Message:</span>
              </span>
              <button
                type="button"
                onClick={handleCopyMessageText}
                className="text-[11px] text-theme-accent hover:underline flex items-center gap-1 font-bold cursor-pointer"
              >
                {isCopiedText ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{isCopiedText ? 'Text Copied!' : 'Copy Text'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-theme-page/80 border border-theme-glass font-sans text-[11px] leading-relaxed text-theme-primary whitespace-pre-wrap max-h-36 overflow-y-auto select-text">
              {messageText}
            </pre>
          </div>

          {/* Open WhatsApp Primary Button */}
          <div className="pt-1">
            <button
              onClick={handleOpenWhatsAppChat}
              disabled={isCopyingImage}
              className={`w-full py-3.5 px-6 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-98 ${
                isCopyingImage
                  ? 'bg-amber-600/80 cursor-not-allowed opacity-90'
                  : 'bg-[#25D366] hover:bg-[#1EBE5D] cursor-pointer'
              }`}
            >
              {isCopyingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Artwork Photo...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Open WhatsApp Chat &amp; Paste Image</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
