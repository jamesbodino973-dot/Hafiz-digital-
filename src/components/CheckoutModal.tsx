import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, ShieldCheck, CreditCard, ChevronRight, CheckCircle2, 
  DownloadCloud, Trash2, Sparkles, Building2, Terminal, RefreshCcw, ExternalLink, MessageCircle
} from 'lucide-react';
import { Product } from '../types';
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore-helpers';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: Product[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

type CheckoutStep = 'details' | 'processing' | 'success';

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  onClearCart 
}: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('details');
  const [email, setEmail] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 9382');
  const [cvc, setCvc] = useState('983');
  const [expiry, setExpiry] = useState('08 / 29');
  
  // Custom states for steps during simulated gateway routing
  const [processPercentage, setProcessPercentage] = useState(0);
  const [processStatus, setProcessStatus] = useState('Connecting to premium payment API...');
  
  // Keep track of order total
  const orderTotal = cartItems.reduce((acc, item) => acc + Number(item.price || 0), 0);

  // Restart modal state when reopened
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setProcessPercentage(0);
      if (auth.currentUser) {
        setEmail(auth.currentUser.email || '');
        setCardholderName(auth.currentUser.displayName || '');
      } else {
        setEmail('');
        setCardholderName('');
      }
    }
  }, [isOpen]);

  // Handle Simulated checkout trigger
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    // Switch to simulated payment processing animation
    setStep('processing');
    setProcessPercentage(0);
    setProcessStatus('Establishing 256-bit secure SSL Handshake...');

    // Save purchase record to Firestore if user is authenticated
    if (auth.currentUser) {
      try {
        const purchaseRef = collection(db, 'purchases');
        for (const item of cartItems) {
          await addDoc(purchaseRef, {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email || email,
            productId: item.id,
            productTitle: item.title,
            productImage: item.image,
            productCategory: item.category,
            downloadLink: item.downloadLink,
            pricePaid: Number(item.price),
            purchasedAt: serverTimestamp()
          });
        }
      } catch (err: any) {
        console.error('Failed to write purchases to Firestore:', err);
        handleFirestoreError(err, OperationType.CREATE, 'purchases');
      }
    }

    // Progress updates to give it a rich cinematic feel
    const intervals = [
      { percentage: 20, text: 'Resolving destination payment cluster hooks...' },
      { percentage: 45, text: 'Authorizing card credits via Stripe authorization server...' },
      { percentage: 70, text: 'Securing permanent server license allocations...' },
      { percentage: 90, text: 'Minting authenticated digital keys...' },
      { percentage: 100, text: 'Transaction authorized successfully.' }
    ];

    intervals.forEach((stepItem, idx) => {
      setTimeout(() => {
        setProcessPercentage(stepItem.percentage);
        setProcessStatus(stepItem.text);
        if (stepItem.percentage === 100) {
          setTimeout(() => {
            setStep('success');
          }, 600);
        }
      }, (idx + 1) * 900);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Blur Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* Full Modal Box Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative bg-[#0F0F11] border border-zinc-900 rounded shadow-2xl max-w-2xl w-full overflow-hidden text-zinc-300 font-sans flex flex-col max-h-[90vh] z-10"
      >
        
        {/* Header Ribbon bar */}
        <div className="p-4 bg-zinc-950/80 border-b border-zinc-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-white font-mono">
              {step === 'details' && 'Digital Cart Checkout'}
              {step === 'processing' && 'Processing Transaction'}
              {step === 'success' && 'Transaction Authorized'}
            </span>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-all cursor-pointer"
            title="Cancel and close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-grow">
          
          <AnimatePresence mode="wait">
            {/* Step 1: Details & Setup Form */}
            {step === 'details' && (
              <motion.div 
                key="step-details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {cartItems.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <p className="text-sm text-zinc-500">Your digital shopping cart is currently empty.</p>
                    <button 
                      onClick={onClose}
                      className="px-4 py-2 rounded bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      Browse Digital Assets
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    
                    {/* Left Column: Cart items recap block */}
                    <div className="md:col-span-6 space-y-4">
                      <div className="flex items-center justify-between pl-0.5">
                        <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase font-mono">
                          Review Items ({cartItems.length})
                        </span>
                        <button 
                          onClick={onClearCart}
                          className="text-[9px] text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest font-bold"
                        >
                          Clear Cart
                        </button>
                      </div>

                      <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                        {cartItems.map((item) => (
                          <div 
                            key={item.id}
                            className="p-3 bg-zinc-950 border border-zinc-905 rounded group flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 object-cover rounded bg-zinc-900 border border-zinc-800 flex-shrink-0" 
                              />
                              <div className="truncate text-left">
                                <h4 className="text-xs font-semibold text-white truncate leading-tight">
                                  {item.title}
                                </h4>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mt-0.5">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-mono font-medium text-white">
                                ${Number(item.price).toFixed(2)}
                              </span>
                              <button 
                                onClick={() => onRemoveItem(item.id)}
                                className="p-1 rounded hover:bg-zinc-900 text-zinc-650 hover:text-red-400 transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary prices calculation */}
                      <div className="p-4 bg-[#141416] border border-zinc-900 rounded space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 font-medium">Subtotal</span>
                          <span className="text-zinc-300 font-mono">${orderTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 font-medium">Transaction VAT / Fees</span>
                          <span className="text-zinc-500 font-mono">+$0.00</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-900">
                          <span className="text-white font-bold uppercase tracking-wider text-[9px]">Grand Total</span>
                          <span className="text-white font-serif font-bold text-base">
                            ${orderTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Premium Checkout Form */}
                    <div className="md:col-span-6">
                      <form onSubmit={handlePaymentSubmit} className="space-y-4 text-left">
                        <span className="block text-[10px] font-bold text-zinc-500 tracking-wider uppercase font-mono pl-0.5">
                          Billing & Delivery
                        </span>

                        {/* Customer Email */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                            Email address *
                          </label>
                          <input 
                            type="email"
                            required
                            placeholder="e.g. creative@designer.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2.5 rounded bg-zinc-950 border border-zinc-900 focus:border-zinc-700 text-xs text-white placeholder-zinc-700 focus:outline-none transition-all"
                          />
                          <p className="text-[10px] text-zinc-500 leading-normal font-light">
                            All download mirror links and permanent cloud licenses will be delivered immediately to this inbox.
                          </p>
                        </div>

                        {/* Card Details Block */}
                        <div className="p-4 bg-zinc-950 border border-zinc-900 rounded space-y-3.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black tracking-widest uppercase text-zinc-400 flex items-center gap-1.5 font-mono">
                              <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                              <span>Card Billing Method</span>
                            </span>
                            <span className="text-[8px] font-mono font-bold bg-zinc-900 px-1.5 py-0.5 rounded text-emerald-400 border border-zinc-800">
                              SIMULATED CODES
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[8px] tracking-widest font-bold uppercase text-zinc-500 mb-1">
                                CARDHOLDER NAME
                              </label>
                              <input 
                                type="text"
                                required
                                value={cardholderName}
                                onChange={(e) => setCardholderName(e.target.value)}
                                placeholder="e.g. Alex Carter"
                                className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 focus:border-zinc-700 text-xs text-white placeholder-zinc-700 focus:outline-none transition-all"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[8px] tracking-widest font-bold uppercase text-zinc-500 mb-1">
                                  CARD NUMBER
                                </label>
                                <input 
                                  type="text"
                                  disabled
                                  value={cardNumber}
                                  className="w-full px-3 py-2 rounded bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-500 cursor-not-allowed text-center"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <label className="block text-[8px] tracking-widest font-bold uppercase text-zinc-500 mb-1 text-center">
                                    EXPIRY
                                  </label>
                                  <input 
                                    type="text"
                                    disabled
                                    value={expiry}
                                    className="w-full py-2 rounded bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-500 cursor-not-allowed text-center"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[8px] tracking-widest font-bold uppercase text-zinc-500 mb-1 text-center">
                                    CVC
                                  </label>
                                  <input 
                                    type="text"
                                    disabled
                                    value={cvc}
                                    className="w-full py-2 rounded bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-505 cursor-not-allowed text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Complete purchase submit button */}
                        <button
                          type="submit"
                          className="w-full py-3 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer font-sans mt-2"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Authorize Payment (${orderTotal.toFixed(2)})</span>
                        </button>

                        <div className="relative flex items-center justify-center py-2">
                          <div className="absolute inset-x-0 h-px bg-zinc-900" />
                          <span className="relative px-2 bg-[#0F0F11] text-[9px] font-mono tracking-widest text-[#52525B] uppercase">
                            or Checkout via Support
                          </span>
                        </div>

                        <a
                          href={`https://wa.me/923218379127?text=${encodeURIComponent(`I want to buy something. Items in cart: ${cartItems.map(item => item.title).join(', ')}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Buy via WhatsApp</span>
                        </a>

                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simulated Sandbox Gateway protection active.</span>
                        </div>
                      </form>
                    </div>

                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Animated Premium Payment Gate */}
            {step === 'processing' && (
              <motion.div 
                key="step-processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-6"
              >
                {/* Glowing Premium Outer Ring */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-zinc-800/60 animate-ping opacity-35" />
                  <div className="absolute h-20 w-20 rounded-full border border-dashed border-zinc-800 animate-spin" style={{ animationDuration: '6s' }} />
                  <div className="absolute h-16 w-16 rounded-full border-2 border-zinc-900 border-t-white animate-spin" />
                  <Lock className="w-6 h-6 text-white animate-pulse" />
                </div>

                <div className="space-y-2 max-w-sm mx-auto">
                  <h3 className="font-serif font-medium text-white text-lg tracking-tight">
                    Securing Transaction Stream
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono tracking-wider">
                    {processPercentage}% - {processStatus}
                  </p>
                </div>

                {/* Progress bar line */}
                <div className="w-full max-w-xs mx-auto h-1.5 bg-zinc-950 border border-zinc-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: `${processPercentage}%` }}
                    transition={{ ease: 'easeOut', duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-white"
                  />
                </div>

                {/* Simulated payment payload log details */}
                <div className="p-3.5 bg-zinc-950 border border-zinc-905 rounded w-full max-w-md mx-auto text-left space-y-1.5">
                  <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-mono">
                    <span className="text-zinc-650">[SECURE PORT]</span>
                    <span>3000 {"->"} SSL ROUTE</span>
                  </div>
                  <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-mono">
                    <span className="text-zinc-650">[CHARGE LOG]</span>
                    <span className="text-white font-medium">${orderTotal.toFixed(2)} USD Allocation</span>
                  </div>
                  <div className="flex gap-2 items-center text-[10px] text-zinc-500 font-mono truncate">
                    <span className="text-zinc-650">[CONFIRM TO]</span>
                    <span className="truncate text-zinc-450">{email || 'anonymous@sandbox.com'}</span>
                  </div>
                </div>

              </motion.div>
            )}

            {/* Step 3: Success & Download access Links */}
            {step === 'success' && (
              <motion.div 
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                {/* Majestic success checkmark icon */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="font-serif font-medium text-lg text-white">
                    Order Completed!
                  </h3>
                  <p className="text-xs text-zinc-400 font-light max-w-md">
                    Thank you for your purchase. We have authenticated your digital delivery codes to <strong className="text-white font-medium">{email}</strong>.
                  </p>
                </div>

                {/* Purchased items downloads wrapper */}
                <div className="space-y-2 text-left">
                  <span className="block text-[10px] font-bold text-zinc-500 tracking-wider uppercase font-mono pl-0.5">
                    Your Authenticated Downloads ({cartItems.length})
                  </span>

                  <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                    {cartItems.map((item) => (
                      <div 
                        key={item.id}
                        className="p-4 bg-zinc-950 border border-zinc-905 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="space-y-1 truncate text-left">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] font-bold text-zinc-400 rounded uppercase font-mono">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              ID: {item.id.slice(0, 8)}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">
                            {item.title}
                          </h4>
                        </div>

                        <a 
                          href={item.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" />
                          <span>Get Cloud Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom guidance box */}
                <div className="p-4 bg-[#141416] border border-zinc-900 rounded text-left space-y-1">
                  <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                    Lifetime Support Guarantee
                  </span>
                  <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                    Check your email inbox shortly for the credentials block and receipts. All files are hosted on high-speed servers with permanent update configurations.
                  </p>
                </div>

                <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      onClearCart();
                      onClose();
                    }}
                    className="px-5 py-2.5 rounded bg-zinc-900 hover:bg-zinc-805 text-white font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Close & Start New Shopping
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </motion.div>
    </div>
  );
}
