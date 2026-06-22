import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Sparkles, CheckCircle, ShieldCheck, Zap, DownloadCloud, ChevronRight, BookOpen } from 'lucide-react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';

interface HomeProps {
  products: Product[];
  setView: (view: string) => void;
  setSelectedProductId: (id: string) => void;
  isLoading: boolean;
}

export default function Home({ products, setView, setSelectedProductId, isLoading }: HomeProps) {
  // Display up to 3 featured products
  const featuredProducts = products.slice(0, 3);

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setView('detail');
  };

  return (
    <div id="home-view" className="space-y-16 py-6 pb-12 overflow-hidden">
      {/* 1. Hero Section */}
      <section className="relative rounded-3xl overflow-hidden py-16 px-6 sm:px-12 md:py-24 bg-gradient-to-b from-[#0F0F11] to-[#0A0A0B] text-white border border-zinc-900 relative">
        {/* Animated fluid abstract ambient orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-zinc-400/5 blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-emerald-500/[0.02] blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="max-w-3xl mx-auto text-center space-y-7 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 text-zinc-100 border border-zinc-800 text-[10px] font-semibold tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
            <span>Digital Assets Store</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="font-serif font-medium text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight text-white"
          >
            Hafiz Digital Products
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="font-sans text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed font-normal"
          >
            Premium Digital Products at Affordable Prices. Instant Lifetime Access of Figma templates, Lightroom filers, Notion organizers, and fully optimized developer starter files.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <button
              onClick={() => setView('shop')}
              className="w-full sm:w-auto px-7 py-3 font-semibold text-xs uppercase tracking-wider rounded text-black bg-white hover:bg-zinc-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Browse Digital Catalog</span>
            </button>
            <button
              onClick={() => setView('admin')}
              className="w-full sm:w-auto px-7 py-3 font-semibold text-xs uppercase tracking-wider rounded text-zinc-300 border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Seller Control Center</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </motion.div>
        </div>

        {/* Feature stats micro layout */}
        <div className="mt-16 border-t border-zinc-900 pt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="block font-serif font-medium text-2xl text-white">100%</span>
            <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-widest block mt-1">Digital Delivery</span>
          </div>
          <div>
            <span className="block font-serif font-medium text-2xl text-white">0s</span>
            <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-widest block mt-1">Instant Access</span>
          </div>
          <div>
            <span className="block font-serif font-medium text-2xl text-white">Secure Cloud</span>
            <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-widest block mt-1">Drive & Mediafire</span>
          </div>
          <div>
            <span className="block font-serif font-medium text-2xl text-white">Lifetime</span>
            <span className="text-[9px] uppercase font-semibold text-zinc-500 tracking-widest block mt-1">Free Upgrades</span>
          </div>
        </div>
      </section>

      {/* 2. Selling Virtues Column */}
      <section className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-serif font-medium text-xl sm:text-2xl text-white tracking-tight">
            How It Works
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            Downloading digital templates on Hafiz Store takes less than three simple steps. No physical delivery required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-[#0F0F11] border border-zinc-900 rounded flex flex-col space-y-4">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-zinc-900 border border-zinc-800">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-medium text-sm text-white">1. Select Asset</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Find Lightroom presets, Notion checklists, vector SVG packs, custom designs, or SaaS setups curated carefully.
            </p>
          </div>

          <div className="p-6 bg-[#0F0F11] border border-zinc-900 rounded flex flex-col space-y-4">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-zinc-900 border border-zinc-800">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-medium text-sm text-white">2. Complete Checkout</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Use a fast automated simulated payment flow. Tap order and secure confirmation instantly in one motion.
            </p>
          </div>

          <div className="p-6 bg-[#0F0F11] border border-zinc-900 rounded flex flex-col space-y-4">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-zinc-900 border border-zinc-800">
              <DownloadCloud className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-serif font-medium text-sm text-white">3. Download Instant</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Instantly unlock direct secure Google Drive or MediaFire link locations directly after purchase is completed.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Premium Products Grid */}
      <section className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-medium text-lg sm:text-xl text-white tracking-tight">
              Featured Premium Assets
            </h2>
            <p className="text-xs text-zinc-400">
              Ready to construct higher-end solutions in photography or development.
            </p>
          </div>
          <button
            onClick={() => setView('shop')}
            className="flex items-center gap-1 hover:gap-2 transition-all font-semibold text-xs text-zinc-300 hover:text-white cursor-pointer"
          >
            <span>View Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
            No products available yet. Go to <button onClick={() => setView('admin')} className="text-emerald-500 underline font-medium">Admin</button> to add your first product!
          </div>
        )}
      </section>
    </div>
  );
}
