import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  auth, db 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  signInWithPopup, 
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  handleFirestoreError, 
  OperationType 
} from '../utils/firestore-helpers';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  LogOut, 
  DownloadCloud, 
  Calendar, 
  CheckCircle2, 
  ShoppingBag, 
  BadgeAlert, 
  Loader2, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface ProfileProps {
  setView: (view: string) => void;
  setSelectedProductId?: (id: string | null) => void;
}

interface UserPurchase {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productCategory: string;
  downloadLink: string;
  pricePaid: number;
  purchasedAt: any;
}

export default function Profile({ setView, setSelectedProductId }: ProfileProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Tab states for Auth
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Purchases State
  const [purchases, setPurchases] = useState<UserPurchase[]>([]);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

  // Hook up firebase auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      // Clear forms and errors
      setErrorMsg(null);
    });
    return () => unsubscribe();
  }, []);

  // Hook up realtime past purchases listener
  useEffect(() => {
    if (!currentUser) {
      setPurchases([]);
      return;
    }

    setPurchasesLoading(true);
    setPurchasesError(null);
    const path = 'purchases';

    try {
      const q = query(
        collection(db, path),
        where('userId', '==', currentUser.uid),
        orderBy('purchasedAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: UserPurchase[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              productId: data.productId || '',
              productTitle: data.productTitle || '',
              productImage: data.productImage || '',
              productCategory: data.productCategory || '',
              downloadLink: data.downloadLink || '',
              pricePaid: Number(data.pricePaid || 0),
              purchasedAt: data.purchasedAt,
            });
          });
          setPurchases(list);
          setPurchasesLoading(false);
        },
        (error) => {
          console.error('Error fetching past purchases:', error);
          setPurchasesError('Unable to fetch your past purchases securely.');
          setPurchasesLoading(false);
          handleFirestoreError(error, OperationType.LIST, path);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      console.error('Snapshot binding failed:', err);
      setPurchasesError(err.message || 'Firestore connection issue.');
      setPurchasesLoading(false);
    }
  }, [currentUser]);

  // Handle standard login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg(null);
    setActionLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid credentials. Please verify your email and password.');
      } else {
        setErrorMsg(err.message || 'Failed to authenticate.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle standard registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName) {
      setErrorMsg('All fields are required.');
      return;
    }
    setErrorMsg(null);
    setActionLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Wait to populate custom display name
      await updateProfile(credential.user, {
        displayName: displayName
      });
      // Force trigger state refresh inside App
      setCurrentUser({ ...credential.user, displayName });
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account already exists under this email address.');
      } else {
        setErrorMsg(err.message || 'Registration failed.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Google OAuth PopUp
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setActionLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google Auth flow interrupted.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Log out
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Render auth/loading spinner
  if (authLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-zinc-950 dark:text-zinc-50 animate-spin" />
        <p className="text-xs text-zinc-400 font-mono tracking-widest uppercase">
          Verifying secure state...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fadeIn text-zinc-800 dark:text-zinc-100 font-sans">
      
      {!currentUser ? (
        <div className="max-w-md mx-auto space-y-8">
          
          {/* Form Header info */}
          <div className="text-center space-y-2">
            <h2 className="font-serif font-semibold text-2xl text-zinc-900 dark:text-white tracking-tight">
              Aesthetic Customer Portal
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Create an account or sign in to keep track of your digital assets, templates, presets, and high-speed delivery codes.
            </p>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0F0F11] rounded-2xl shadow-xl overflow-hidden">
            {/* Form Mode Selector tabs */}
            <div className="flex border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40">
              <button
                onClick={() => {
                  setAuthTab('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                  authTab === 'login'
                    ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white bg-white dark:bg-[#0F0F11]'
                    : 'border-transparent text-zinc-400 hover:text-zinc-650'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthTab('signup');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-4 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
                  authTab === 'signup'
                    ? 'border-zinc-950 dark:border-white text-zinc-950 dark:text-white bg-white dark:bg-[#0F0F11]'
                    : 'border-transparent text-zinc-400 hover:text-zinc-650'
                }`}
              >
                Register
              </button>
            </div>

            {/* Inner inputs wrapper */}
            <div className="p-6 sm:p-8 space-y-6 text-left">
              
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-250/30 rounded-xl flex items-start gap-2 text-xs text-red-600 dark:text-red-400 leading-relaxed font-light">
                  <BadgeAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {authTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus:border-zinc-350 dark:focus:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-0 transition-all placeholder-zinc-400"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus:border-zinc-350 dark:focus:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-0 transition-all placeholder-zinc-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 mt-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer font-sans"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Sign In To Account'
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Display Name Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input 
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Alex Carter"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus:border-zinc-350 dark:focus:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-0 transition-all placeholder-zinc-400"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input 
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus:border-zinc-350 dark:focus:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-0 transition-all placeholder-zinc-400"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      Secure Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-400" />
                      <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 focus:border-zinc-350 dark:focus:border-zinc-700 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-0 transition-all placeholder-zinc-400"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 mt-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer font-sans"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      'Register New Account'
                    )}
                  </button>
                </form>
              )}

              {/* Seamless Dividers */}
              <div className="relative flex items-center justify-center mt-3 py-1">
                <div className="absolute inset-x-0 h-px bg-zinc-100 dark:bg-zinc-900" />
                <span className="relative px-3 bg-white dark:bg-[#0F0F11] text-[9px] font-bold text-zinc-400 dark:text-zinc-650 uppercase tracking-widest">
                  or authenticate with
                </span>
              </div>

              {/* Google sign in integration */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-semibold tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
              >
                {/* Embedded High Definition Vector Google Logo */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.55 14.98 1 12 1 7.35 1 3.37 3.61 1.48 7.42l3.8 2.95C6.23 7.02 8.9 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.43-4.93 3.43-8.61z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.65c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.48 7.14C.63 8.84.15 10.74.15 12.75s.48 3.91 1.33 5.61l3.8-3.71z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.96-1.07 7.95-2.92l-3.7-2.87c-1.03.69-2.35 1.11-3.92 1.11-3.1 0-5.77-1.98-6.72-4.88l-3.8 2.95C3.37 20.39 7.35 23 12 23z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Logged In Dashboard structure */
        <div className="space-y-8 text-left">
          
          {/* Dashboard Header Profile Details */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-white dark:bg-[#0F0F11] border border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-sm">
            
            <div className="md:col-span-8 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              {/* Profile Avatar Spot */}
              <div className="relative w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white shrink-0 overflow-hidden font-serif text-xl font-bold">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt={currentUser.displayName || ''} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  (currentUser.displayName || currentUser.email || 'A').charAt(0).toUpperCase()
                )}
                {/* Emerald verified node badge */}
                <div className="absolute bottom-0 right-0 w-4.5 h-4.5 bg-emerald-500 border-2 border-[#0F0F11] rounded-full flex items-center justify-center" title="Verified Customer Identity">
                  <CheckCircle2 className="w-2.5 h-2.5 text-zinc-950 font-black" />
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-serif font-bold text-lg text-zinc-900 dark:text-zinc-50">
                  {currentUser.displayName || 'Authorized Customer'}
                </h3>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400 font-light">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{currentUser.email}</span>
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-805">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Registered Customer</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center md:justify-end gap-3 shrink-0">
              <button
                onClick={() => setView('shop')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                Browse Shop
              </button>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-200/50 dark:border-red-900/40 text-red-600 dark:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
            
          </div>

          {/* User's Past Purchases Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pl-1">
              <div>
                <h4 className="font-serif font-semibold text-lg text-zinc-900 dark:text-white tracking-tight">
                  Your Digital Asset Warehouse
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                  Lifetime access token links and mirrors for products compiled in your name.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 block">
                  Asset Count
                </span>
                <span className="font-serif text-lg font-bold text-zinc-950 dark:text-white">
                  {purchases.length}
                </span>
              </div>
            </div>

            {purchasesLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-2.5">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Querying past purchases...</span>
              </div>
            ) : purchasesError ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900 text-xs text-red-600 dark:text-red-400 rounded-xl">
                {purchasesError}
              </div>
            ) : purchases.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-805 rounded-2xl text-center space-y-4 bg-white dark:bg-[#0a0a0c]/25">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto text-zinc-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">No Digital Items Acquired</h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 max-w-sm mx-auto font-light">
                    Your permanent dashboard repository is empty. Once you purchase presets, SaaS files, or templates, they will populate here instantly.
                  </p>
                </div>
                <button
                  onClick={() => setView('shop')}
                  className="px-4 py-2 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-semibold text-xs rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer font-sans"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Purchases list grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {purchases.map((purchase) => (
                  <div 
                    key={purchase.id}
                    className="p-4 border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-[#0F0F11] rounded-2xl space-y-4 flex flex-col justify-between hover:border-zinc-350 dark:hover:border-zinc-800 transition-all shadow-sm shadow-black/5"
                  >
                    <div className="flex gap-3 text-left">
                      <img 
                        src={purchase.productImage} 
                        alt={purchase.productTitle} 
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 shrink-0"
                      />
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-[8px] font-bold text-zinc-500 dark:text-zinc-400 rounded uppercase font-mono">
                            {purchase.productCategory || 'Digital Asset'}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400">
                            ID: {purchase.productId.slice(0, 8)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                          {purchase.productTitle}
                        </h4>
                        <div className="text-[10px] text-zinc-450 font-light flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Paid: ${purchase.pricePaid.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-4">
                      {purchase.purchasedAt ? (
                        <span className="text-[9px] text-zinc-400 font-mono">
                          Purchased: {new Date(purchase.purchasedAt.seconds * 1000).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[9px] text-zinc-400 font-mono">
                          Instant Order Secured
                        </span>
                      )}

                      <a 
                        href={purchase.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="py-1.5 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>Get Mirror Link</span>
                        <ExternalLink className="w-3 h-3 text-zinc-450" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Secure vault notification ribbon */}
          <div className="p-4 bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200/50 dark:border-zinc-900 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-normal font-light">
              <strong className="text-zinc-900 dark:text-white font-medium">Cloud Vault Integration Active</strong>
              <p>Your purchases are registered against your account identifier in Cloud Firestore. Download mirrors do not expire and remain accessible forever as long as your email matches. Ensure security on billing cards.</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
