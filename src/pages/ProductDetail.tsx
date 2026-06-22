import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Tag, Lock, Sparkles, CheckCircle, ShieldCheck, HelpCircle, DownloadCloud, ChevronRight, FileText, Smartphone, Mail, CreditCard, ExternalLink, ShoppingBag, MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { db, auth } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestore-helpers';

interface ProductDetailProps {
  product: Product | null;
  onBack: () => void;
  setView: (view: string) => void;
  onAddToCart: (product: Product) => void;
  isInCart: boolean;
}

export default function ProductDetail({ 
  product, 
  onBack, 
  setView, 
  onAddToCart, 
  isInCart 
}: ProductDetailProps) {
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'paying' | 'unlocked'>('details');
  const [email, setEmail] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      setEmail(auth.currentUser.email || '');
      setCardName(auth.currentUser.displayName || '');
    } else {
      setEmail('');
      setCardName('');
    }
  }, [product]);

  if (!product) {
    return (
      <div className="py-12 text-center text-zinc-550 space-y-4">
        <p>No active product selected. Return to catalogue to choose digital items.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-semibold cursor-pointer"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const handleSimulatedCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    if (!email.trim() || !email.includes('@')) {
      return setPaymentError('Please enter a valid email address for delivery confirmation');
    }

    setCheckoutStep('paying');
    setIsProcessing(true);

    if (auth.currentUser) {
      try {
        const purchaseRef = collection(db, 'purchases');
        await addDoc(purchaseRef, {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email || email,
          productId: product.id,
          productTitle: product.title,
          productImage: product.image,
          productCategory: product.category,
          downloadLink: product.downloadLink,
          pricePaid: Number(product.price),
          purchasedAt: serverTimestamp()
        });
      } catch (err: any) {
        console.error('Failed to log purchase: ', err);
        handleFirestoreError(err, OperationType.CREATE, 'purchases');
      }
    }

    // Simulate 1.5 seconds payment gateway hook
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep('unlocked');
    }, 1600);
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'Preset':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-900/30';
      case 'Template':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-900/30';
      case 'Software':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30';
      case 'Icon Pack':
        return 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20 border-pink-200/50 dark:border-pink-900/30';
      default:
        return 'text-zinc-650 dark:text-zinc-350 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/50 dark:border-zinc-800/30';
    }
  };

  return (
    <div className="space-y-8 py-6 pb-12">
      {/* Back breadcrumb */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 font-semibold cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Assets Catalog</span>
      </button>

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Product Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cover Display */}
          <div className="relative aspect-video rounded overflow-hidden border bg-zinc-950 border-zinc-900">
            <img
              src={product.image}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Tag badge overlay */}
            <div className="absolute top-4 left-4">
              <span className="text-[9px] font-semibold tracking-widest uppercase px-2 py-1 rounded bg-zinc-950/80 text-zinc-300 border border-zinc-800 backdrop-blur-md">
                {product.category}
              </span>
            </div>
          </div>

          {/* Titles & Descriptions */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h1 className="font-serif font-medium text-2xl tracking-tight text-white">
                {product.title}
              </h1>
              <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                ${Number(product.price).toFixed(2)} USD (One-Time Lifetime Fee)
              </p>
            </div>

            <div className="border-t border-b border-zinc-900 py-4 flex flex-wrap gap-6 text-xs text-zinc-400">
              {product.fileSize && (
                <div>
                  <span className="font-semibold block text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">FILE SIZE</span>
                  <span className="font-bold text-white">{product.fileSize}</span>
                </div>
              )}
              {product.fileType && (
                <div>
                  <span className="font-semibold block text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">FORMAT</span>
                  <span className="font-bold text-white">{product.fileType}</span>
                </div>
              )}
              <div>
                <span className="font-semibold block text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">DELIVERY</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <span>Instant Access</span>
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Product Overview</h3>
              <p className="text-xs text-zinc-450 leading-relaxed text-justify font-light">
                {product.description}
              </p>
              <div className="text-xs text-zinc-400 leading-relaxed text-justify whitespace-pre-wrap font-light">
                {product.fullDescription}
              </div>
            </div>
          </div>

          {/* Extra product features list details */}
          <div className="p-5 border bg-[#0F0F11] border-zinc-900 rounded space-y-4">
            <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">
              WHAT'S SECURED IN THIS ORDER
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-200 shrink-0" />
                <span>Permanent lifetime download path</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-200 shrink-0" />
                <span>Compatible with phone or desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-200 shrink-0" />
                <span>Free updates & minor patch fixes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-zinc-200 shrink-0" />
                <span>Secure storage mirrors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Simulated Payment / Download Console */}
        <div className="lg:col-span-5 sticky top-24">
          <AnimatePresence mode="wait">
            {checkoutStep === 'details' && (
              <motion.div
                id="checkout-details-panel"
                key="details"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0F0F11] border border-zinc-900 rounded shadow-xl overflow-hidden animate-fadeIn"
              >
                <div className="p-5 bg-zinc-950/80 border-b border-zinc-900 flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Instant Secure Checkout
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-350">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>SSL Secured</span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Summary receipt line */}
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-450 uppercase tracking-wider text-[9px] font-semibold">Digital Asset</span>
                      <span className="font-semibold text-white max-w-[200px] truncate">{product.title}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-900">
                      <span className="text-zinc-450 uppercase tracking-wider text-[9px] font-semibold">Total Price</span>
                      <span className="font-serif font-medium text-sm text-white">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleSimulatedCheckout} className="space-y-4">
                    {paymentError && (
                      <div className="p-3 bg-red-950/30 border border-red-900/30 rounded text-[11px] text-red-400">
                        {paymentError}
                      </div>
                    )}

                    {/* Email for Delivery */}
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-0.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g., alex@creative.com"
                        className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        We'll simulate delivery instructions to this email.
                      </span>
                    </div>

                    {/* Card info Mock */}
                    <div className="space-y-3.5 pt-1.5 border-t border-zinc-900">
                      <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                        SIMULATED PAYMENT METHODS (AUTO-COMPLETE)
                      </span>
                      
                      <div>
                        <label className="block text-[9px] text-zinc-400 uppercase tracking-wide mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="e.g., Alex Carter"
                          className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[9px] text-zinc-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-zinc-500" />
                            <span>Card Code *</span>
                          </label>
                          <input
                            type="text"
                            required
                            disabled
                            value={cardNumber}
                            className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950/40 border border-zinc-900 text-zinc-500 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-zinc-400 uppercase tracking-wide mb-1">
                            CVC
                          </label>
                          <input
                            type="text"
                            required
                            disabled
                            value="938"
                            className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950/40 border border-zinc-900 text-zinc-500 text-center cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action buy button stack */}
                    <div className="flex flex-col gap-2">
                      <button
                        type="submit"
                        className="w-full py-3.5 rounded font-bold text-xs uppercase tracking-wider bg-white text-black hover:bg-zinc-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Buy Instantly</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart(product)}
                        className={`w-full py-3 rounded font-bold text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isInCart
                            ? 'bg-[#141416]/45 border-emerald-900/30 text-emerald-400 cursor-default'
                            : 'bg-zinc-900 hover:bg-zinc-850 hover:text-white border-zinc-800 text-zinc-300'
                        }`}
                      >
                        {isInCart ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span>In Your Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      {/* Line Separator */}
                      <div className="relative flex items-center justify-center py-2">
                        <div className="absolute inset-x-0 h-px bg-zinc-900" />
                        <span className="relative px-2 bg-[#0F0F11] text-[9px] font-mono tracking-widest text-[#52525B] uppercase">
                          or Buy Directly
                        </span>
                      </div>

                      {/* WhatsApp Direct Option */}
                      <a
                        href={`https://wa.me/923218379127?text=${encodeURIComponent(`I want to buy something: ${product.title}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Order via WhatsApp</span>
                      </a>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {checkoutStep === 'paying' && (
              <motion.div
                id="checkout-paying-panel"
                key="paying"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#0F0F11] border border-zinc-900 rounded shadow-xl p-8 text-center space-y-4"
              >
                <div className="flex justify-center py-4">
                  <div className="relative h-10 w-10 rounded-full border-2 border-zinc-800 border-t-white animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-medium text-sm text-white">
                    Routing Premium Gateway
                  </h4>
                  <p className="text-[11px] text-zinc-450 max-w-xs mx-auto font-light leading-relaxed">
                    Securely connecting with our simulated payment servers. Validating lifetime key allocation details...
                  </p>
                </div>
              </motion.div>
            )}

            {checkoutStep === 'unlocked' && (
              <motion.div
                id="checkout-unlocked-panel"
                key="unlocked"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0F0F11] border border-zinc-900 rounded shadow-xl overflow-hidden"
              >
                {/* Success Banner */}
                <div className="p-6 bg-zinc-950 border-b border-zinc-900 flex flex-col items-center text-center space-y-2">
                  <div className="flex items-center justify-center h-10 w-10 rounded bg-zinc-900 border border-zinc-800">
                    <CheckCircle className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <h4 className="font-serif font-medium text-sm text-white uppercase tracking-wider">
                    Order Unlocked Successfully!
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                    Delivery variables simulated to {email}
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="p-4 bg-zinc-950 rounded border border-zinc-900 space-y-3">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">
                      YOUR LIFETIME DOWNLOAD ACCESS:
                    </span>
                    
                    <a
                      href={product.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-3.5 bg-zinc-900 hover:bg-zinc-805 border border-zinc-800 hover:border-zinc-700 text-white rounded font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <DownloadCloud className="w-5 h-5 shrink-0" />
                        <span className="truncate">Open Cloud Folder (Drive/MediaFire)</span>
                      </div>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>

                    <div className="text-[10px] text-zinc-400 leading-relaxed space-y-1.5 pt-2 border-t border-zinc-900 font-light">
                      <span className="font-semibold block text-white uppercase tracking-wider text-[8px]">Instructions:</span>
                      <p>
                        1. Click the button above to launch Drive or MediaFire link location in a new tab.
                      </p>
                      <p>
                        2. If prompted, click download in the cloud provider panel. All folders are packaged/zipped securely.
                      </p>
                    </div>
                  </div>

                  {/* Reset view back buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={onBack}
                      className="w-1/2 py-2.5 rounded border border-zinc-900 text-xs font-semibold hover:bg-zinc-900 text-zinc-300 transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
                    >
                      Back to Shop
                    </button>
                    <button
                      onClick={() => setCheckoutStep('details')}
                      className="w-1/2 py-2.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors cursor-pointer uppercase tracking-wider text-[10px]"
                    >
                      Buy Again / Reset
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
