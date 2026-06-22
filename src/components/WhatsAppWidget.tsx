import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, CheckSquare, Sparkles } from 'lucide-react';

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '923218379127';
  const message = 'I want to buy something';
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            className="mb-3 w-76 bg-white dark:bg-[#0F0F11] border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl overflow-hidden text-left"
          >
            {/* Header / Brand Spot */}
            <div className="p-4 bg-zinc-950 text-white flex items-center justify-between border-b border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="relative w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse absolute -top-0.5 -right-0.5" />
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-serif font-bold text-white tracking-wide">
                    Hafiz Digital Support
                  </h4>
                  <p className="text-[9px] text-emerald-400 font-medium font-mono uppercase tracking-widest">
                    Direct WhatsApp
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Close chat prompt"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inner Message Bubble Body */}
            <div className="p-4 space-y-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl space-y-1 border border-zinc-150 dark:border-zinc-900">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-zinc-400 dark:text-zinc-600 block">
                  Support Representative
                </span>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Hi there! We are available to answer your questions or process your order directly. Click below to start chatting with us.
                </p>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-emerald-500/10 text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Direct message</span>
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                <CheckSquare className="w-3 h-3 text-emerald-500" />
                <span>Pre-filled: "I want to buy something"</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating launcher action button */}
      <motion.button
        id="whatsapp-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-4 rounded-full bg-emerald-555 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
        title="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black font-semibold text-[8px] rounded-full flex items-center justify-center border border-emerald-500">
          1
        </span>
        <MessageCircle className="w-6 h-6 animate-pulse" />
      </motion.button>
    </div>
  );
}
