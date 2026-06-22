import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Product } from './types';
import { seedProductsIfNeeded } from './utils/seeder';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import CheckoutModal from './components/CheckoutModal';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';

import { RefreshCw, DatabaseBackup, ShieldAlert } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<string>('home'); // 'home', 'shop', 'detail', 'admin'
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Shopping Cart & Checkout States (with persistent localStorage hydration)
  const [cart, setCart] = useState<Product[]>(() => {
    try {
      const cached = localStorage.getItem('hafiz_digital_cart');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Synchronize cart changes to local storage
  useEffect(() => {
    localStorage.setItem('hafiz_digital_cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev; // Digital items are singular purchases
      }
      return [...prev, product];
    });
    // Open the premium Checkout Modal instantly upon select to present the summary & process animation
    setIsCheckoutOpen(true);
  };

  const handleRemoveFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Initialize and load products
  const loadAndSeedProducts = async () => {
    setIsLoading(true);
    setDbError(null);
    try {
      // 1. Seed assets if DB collection is empty
      await seedProductsIfNeeded();

      // 2. Query products using realtime snapshot listener
      const productsCol = collection(db, 'products');
      const q = query(productsCol, orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Product[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              fullDescription: data.fullDescription || '',
              price: Number(data.price || 0),
              category: data.category || 'Template',
              image: data.image || '',
              downloadLink: data.downloadLink || '',
              fileSize: data.fileSize || '',
              fileType: data.fileType || '',
              createdAt: data.createdAt
            });
          });
          setProducts(list);
          setIsLoading(false);
        },
        (error) => {
          console.error('Firestore snapshot selection error:', error);
          setDbError('Unable to sync credentials with Cloud Firestore. Check security rules or try again.');
          setIsLoading(false);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      console.error('Initialization error inside App:', err);
      setDbError(err?.message || 'Database initialization failure. Please reload the applet.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let unsubscribePromise = loadAndSeedProducts();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  const handleSelectedProduct = (id: string | null) => {
    setSelectedProductId(id);
  };

  const getSelectedProductObject = (): Product | null => {
    if (!selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) || null;
  };

  const forceReloadDb = () => {
    loadAndSeedProducts();
  };

  const renderActiveView = () => {
    // Render admin view regardless of initial database connection error so admins can log in and initialize
    if (view === 'admin') {
      return (
        <Admin
          products={products}
          refreshProducts={async () => {
            forceReloadDb();
          }}
          isLoading={isLoading}
        />
      );
    }

    if (dbError) {
      return (
        <div className="py-16 text-center max-w-md mx-auto space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900 text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-md text-zinc-900 dark:text-zinc-50">
              Database Connection Blocked
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              We encountered a permission or configuration obstacle while attempting to fetch your store items. Make sure your Firestore database is created.
            </p>
          </div>
          <button
            onClick={forceReloadDb}
            className="px-5 py-2.5 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      );
    }

    switch (view) {
      case 'home':
        return (
          <Home
            products={products}
            setView={setView}
            setSelectedProductId={handleSelectedProduct}
            isLoading={isLoading}
          />
        );
      case 'shop':
        return (
          <Shop
            products={products}
            setView={setView}
            setSelectedProductId={handleSelectedProduct}
            isLoading={isLoading}
          />
        );
      case 'detail':
        const selectedProd = getSelectedProductObject();
        return (
          <ProductDetail
            product={selectedProd}
            onBack={() => setView('shop')}
            setView={setView}
            onAddToCart={handleAddToCart}
            isInCart={selectedProd ? cart.some((item) => item.id === selectedProd.id) : false}
          />
        );
      case 'admin':
        return (
          <Admin
            products={products}
            refreshProducts={async () => {
              forceReloadDb();
            }}
            isLoading={isLoading}
          />
        );
      default:
        return (
          <Home
            products={products}
            setView={setView}
            setSelectedProductId={handleSelectedProduct}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header
        currentView={view}
        setView={setView}
        onGoBack={() => setView('shop')}
        setSelectedProductId={handleSelectedProduct}
        cartCount={cart.length}
        onCartClick={() => setIsCheckoutOpen(true)}
      />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
        {renderActiveView()}
      </main>

      <Footer setView={setView} />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
