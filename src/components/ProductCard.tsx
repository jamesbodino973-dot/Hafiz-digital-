import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowRight, Tag, DownloadCloud } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  key?: any;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  // Return tailored color tokens for each category
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
    <motion.div
      id={`product-card-${product.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative flex flex-col justify-between h-full overflow-hidden rounded bg-[#0F0F11] border border-zinc-900 hover:border-zinc-800 p-4 transition-all"
    >
      <div>
        {/* Product Image Section */}
        <div className="relative aspect-video w-full overflow-hidden rounded bg-zinc-950 border border-zinc-900/60">
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-500 ease-out"
          />
          {/* Subtle hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80" />
          
          {/* Tag Category overlay */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
            <span className="text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded bg-zinc-950/80 text-zinc-300 border border-zinc-800 backdrop-blur-md">
              {product.category}
            </span>
          </div>

          <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
            <div className="flex items-center justify-center h-8 w-8 rounded bg-zinc-950/90 border border-zinc-800 text-white shadow">
              <DownloadCloud className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Info Layout */}
        <div className="mt-4 space-y-1.5">
          <h3 className="font-serif font-medium text-sm line-clamp-1 tracking-tight text-white group-hover:text-zinc-300 transition-colors">
            {product.title}
          </h3>
          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-light min-h-[2.5rem]">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing and Action row */}
      <div className="mt-4 pt-3.5 border-t border-zinc-900 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-sans text-zinc-500 block tracking-wider uppercase font-medium">Lifetime Access</span>
          <span className="font-serif font-medium text-sm text-white">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>

        <button
          onClick={onClick}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 font-medium text-xs tracking-wider uppercase rounded bg-zinc-900 hover:bg-white hover:text-black border border-zinc-800 hover:border-white transition-all duration-300 cursor-pointer text-white"
        >
          <span>Get Asset</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
