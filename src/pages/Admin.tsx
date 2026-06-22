import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  User
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { Product, Category } from '../types';
import AdminProductForm from '../components/AdminProductForm';
import { 
  Lock, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Database, 
  KeyRound, 
  Check, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  LayoutDashboard, 
  ShoppingBag, 
  Sparkles, 
  FileText, 
  Tag, 
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  DownloadCloud
} from 'lucide-react';

interface AdminProps {
  products: Product[];
  refreshProducts: () => Promise<void>;
  isLoading: boolean;
}

const ALLOWED_ADMINS = [
  'areedaqueen9@gmail.com',
  'naveedali@hafiz.com',
  'naveedali@gmail.com'
];

interface AdminSession {
  email: string;
  isSimulated?: boolean;
}

type AdminTab = 'overview' | 'catalog' | 'add' | 'preview';

export default function Admin({ products, refreshProducts, isLoading }: AdminProps) {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<AdminSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Login input states
  const [username, setUsername] = useState('Naveedali'); // Pre-fill username field as requested
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [operationNotAllowed, setOperationNotAllowed] = useState(false);

  // Bootstrap support for uninitialized accounts
  const [uninitializedAdmin, setUninitializedAdmin] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submittingChange, setSubmittingChange] = useState(false);

  // Sidebar tab control
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Preview state
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState<Product | null>(null);

  // Subscribe to Firebase Authentication actions and state
  useEffect(() => {
    // Check local storage for persistent sandbox simulation session
    const cached = localStorage.getItem('hafiz_admin_sandbox');
    if (cached) {
      try {
        setCurrentUser(JSON.parse(cached));
        setAuthLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('hafiz_admin_sandbox');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Enforce admin email allowlist
        if (user.email && ALLOWED_ADMINS.includes(user.email.toLowerCase())) {
          setCurrentUser({ email: user.email.toLowerCase() });
        } else {
          // Signout unauthorized users
          signOut(auth);
          setCurrentUser(null);
          setLoginError('Access Denied: This account is not listed in the administrators database.');
        }
      } else {
        // Clear only if current isn't simulated
        setCurrentUser((prev) => (prev?.isSimulated ? prev : null));
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update preview product when products collection or selection changes
  useEffect(() => {
    if (products.length > 0 && !selectedPreviewProduct) {
      setSelectedPreviewProduct(products[0]);
    }
  }, [products, selectedPreviewProduct]);

  // Normalize mapping input "Naveedali" to final email addresses
  const getNormalizedEmail = (input: string): string => {
    let email = input.trim();
    if (!email.includes('@')) {
      if (email.toLowerCase() === 'naveedali') {
        return 'naveedali@hafiz.com';
      }
      return `${email.toLowerCase()}@hafiz.com`;
    }
    return email.toLowerCase();
  };

  // Sandbox bypass access
  const handleSandboxBypass = () => {
    const targetEmail = getNormalizedEmail(username);
    if (!ALLOWED_ADMINS.includes(targetEmail)) {
      setLoginError('Sandbox Bypass Denied: Only authorized admin emails or accounts on the allowlist can initiate bypass.');
      return;
    }
    const simSession: AdminSession = { email: targetEmail, isSimulated: true };
    localStorage.setItem('hafiz_admin_sandbox', JSON.stringify(simSession));
    setCurrentUser(simSession);
    setSuccessMessage('Sandbox Bypass Session Authorized. Welcome!');
    setLoginError(null);
  };

  // Login action execution
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setSuccessMessage(null);
    setUninitializedAdmin(null);
    setOperationNotAllowed(false);
    setVerifying(true);

    const targetEmail = getNormalizedEmail(username);

    // Initial boundary check: must be in allowed list
    if (!ALLOWED_ADMINS.includes(targetEmail)) {
      setLoginError('Error: Your credentials do not match normalized admin protocols. Authorized emails only.');
      setVerifying(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, targetEmail, password);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setOperationNotAllowed(true);
        setLoginError('Firebase Auth Email/Password login is currently deactivated in the default Firebase project console. Please enable it in the console, or click "sandbox simulation" below to bypass.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        // Since Firebase V9+ maps both to invalid-credential, we check if we can offer manual self-seeding for authorized emails!
        setUninitializedAdmin(targetEmail);
        setLoginError('User credentials not matching. If this is your first session, you can securely initialize this admin with your entered password below.');
      } else {
        setLoginError(err.message || 'Authentication failed. Please verify database connectivity.');
      }
    } finally {
      setVerifying(false);
    }
  };

  // Create real admin account if listed on allowlist (Bootstrap)
  const bootstrapAdminAccount = async () => {
    if (!uninitializedAdmin || !password || password.length < 6) {
      setLoginError('Password is too weak or empty. Admin access key must be at least 6 characters.');
      return;
    }

    setBootstrapping(true);
    setLoginError(null);
    setOperationNotAllowed(false);
    try {
      await createUserWithEmailAndPassword(auth, uninitializedAdmin, password);
      setSuccessMessage(`Success! Initialized Admin account for ${uninitializedAdmin}. Logged in.`);
      setUninitializedAdmin(null);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setOperationNotAllowed(true);
        setLoginError('Firebase Auth account instantiation is currently deactivated on your project console. Please enable Email/Password provider, or click the "sandbox simulation" below to continue.');
      } else {
        setLoginError(err.message || 'Initialization failed. Ensure credentials conform to guidelines.');
      }
    } finally {
      setBootstrapping(false);
    }
  };

  // Real password reset dispatcher
  const handleForgotPassword = async () => {
    setLoginError(null);
    setSuccessMessage(null);
    const targetEmail = getNormalizedEmail(username);

    if (!username.trim()) {
      setLoginError('Please enter your Admin username or email above first to generate a dynamic recovery link.');
      return;
    }

    if (!ALLOWED_ADMINS.includes(targetEmail)) {
      setLoginError('Error: Recovery links can only be issued for authorized admin accounts on the allowlist.');
      return;
    }

    setIsResetting(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setSuccessMessage(`A secure Firebase password reset email was dispatched to ${targetEmail}. Please check your inbox.`);
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || 'Failed to dispatch reset email. Ensure SMTP setup is active on Firebase console.');
    } finally {
      setIsResetting(false);
    }
  };

  // Logout action
  const handleLogout = async () => {
    try {
      localStorage.removeItem('hafiz_admin_sandbox');
      await signOut(auth);
      setCurrentUser(null);
      setSuccessMessage('Logged out securely from Administrator panel.');
    } catch (err) {
      console.error(err);
    }
  };

  // Save product (Add or Edit)
  const handleSaveProduct = async (productData: Omit<Product, 'id'> & { id?: string }) => {
    setSubmittingChange(true);
    try {
      if (productData.id) {
        // Edit flow
        const { id, ...dataToUpload } = productData;
        const targetRef = doc(db, 'products', id);
        await updateDoc(targetRef, dataToUpload);
      } else {
        // Add flow
        const productsCol = collection(db, 'products');
        await addDoc(productsCol, {
          ...productData,
          createdAt: serverTimestamp()
        });
      }

      await refreshProducts();
      setShowForm(false);
      setEditingProduct(null);
      // Automatically switch to catalog tab
      setActiveTab('catalog');
    } catch (error) {
      console.error('Error saving product details:', error);
      throw error;
    } finally {
      setSubmittingChange(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your catalog store?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', id));
      await refreshProducts();
    } catch (error) {
      console.error('Failed to delete product doc:', error);
      alert('Error deleting digital document. Check Firestore rules or permissions.');
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
    setActiveTab('add'); // form tab
  };

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setShowForm(true);
    setActiveTab('add'); // form tab
  };

  // Total Catalog value metrics
  const totalPricingAccumulated = products.reduce((acc, p) => acc + Number(p.price || 0), 0);

  // Render Authentication state loader
  if (authLoading) {
    return (
      <div className="py-24 text-center max-w-sm mx-auto space-y-4">
        <div className="relative h-8 w-8 rounded-full border-2 border-zinc-800 border-t-white animate-spin mx-auto" />
        <p className="text-xs text-zinc-400 font-light uppercase tracking-widest">
          Authenticating Admin Gateway...
        </p>
      </div>
    );
  }

  // 1. Render SIGN IN view if nobody is authenticated
  if (!currentUser) {
    return (
      <div id="admin-login-view" className="py-12 max-w-md mx-auto space-y-6">
        {/* Top Logo and Tagline */}
        <div className="text-center space-y-3">
          <div className="inline-flex flex-col items-center gap-1.5">
            <span className="font-serif italic text-white tracking-tight text-xl font-medium">Hafiz</span>
            <span className="text-[9px] tracking-[0.3em] font-sans font-bold text-zinc-500 uppercase">DIGITAL PRODUCTS</span>
          </div>
          
          <h2 className="font-serif font-medium text-lg text-white tracking-tight mt-1">
            Administrator Station
          </h2>
          <p className="text-xs text-zinc-450 font-light max-w-xs mx-auto leading-relaxed">
            Please log in with secure Firebase Auth to manage instant delivery download assets, descriptions, and catalog items.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#0F0F11] p-7 border border-zinc-900 rounded shadow-2xl space-y-5">
          {loginError && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded text-[11px] text-red-400 flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Authentication Issue</span>
                <span>{loginError}</span>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-zinc-900 border border-zinc-850 rounded text-[11px] text-white flex items-start gap-2 leading-relaxed">
              <CheckCircle className="w-4 h-4 shrink-0 text-white mt-0.5 animate-pulse" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4.5">
            {/* Email/Username field */}
            <div>
              <label htmlFor="admin-username-input" className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 px-0.5">
                Admin Username or Email *
              </label>
              <input
                id="admin-username-input"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Naveedali or areedaqueen9@gmail.com"
                className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                autoComplete="email"
              />
              <p className="text-[10px] text-zinc-550 mt-1 px-0.5 font-light">
                Supports human identifier <span className="font-semibold text-zinc-400">"Naveedali"</span> or your registered Firebase email.
              </p>
            </div>

            {/* Password input */}
            <div>
              <div className="flex justify-between items-center mb-1.5 px-0.5">
                <label htmlFor="admin-password-input" className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                  Secure Password *
                </label>
                <button
                  type="button"
                  onClick={() => handleForgotPassword()}
                  className="text-[9px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (Preset or Custom min 6 chars)"
                  className="w-full pl-3 pr-10 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-colors"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password value' : 'Show password value'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Access action buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={verifying || bootstrapping}
                className="w-full py-3.5 rounded bg-white text-black text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-250 transition-all cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                {verifying ? (
                  <div className="h-4 w-4 rounded-full border border-zinc-805 border-t-black animate-spin" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
                <span>Login to Admin</span>
              </button>

              {/* Sandbox Bypass Option */}
              <button
                type="button"
                onClick={handleSandboxBypass}
                className="w-full py-3 rounded bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 hover:text-white transition-all text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                title="Bypass direct cloud check when Authentication is not configured or disabled in Firebase"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Sandbox Bypass (Testing Mode)</span>
              </button>

              {/* Bootstrap creation block */}
              {uninitializedAdmin && (
                <button
                  type="button"
                  onClick={bootstrapAdminAccount}
                  disabled={bootstrapping}
                  className="w-full py-3 rounded border border-dashed border-zinc-800 bg-zinc-950/40 hover:bg-zinc-950 hover:border-zinc-500 text-white text-[10px] font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {bootstrapping ? (
                    <div className="h-3.5 w-3.5 rounded-full border border-zinc-600 border-t-white animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Bootstrap Admin Account ({uninitializedAdmin})</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Static system credentials memo */}
        <div className="p-4 bg-zinc-950/40 border border-zinc-900 rounded space-y-1">
          <span className="text-[8px] font-bold tracking-widest text-zinc-500 uppercase block mb-1">SECURED INFORMATION DEPLOYMENT</span>
          <p className="text-[10px] text-zinc-450 leading-relaxed font-light">
            🔑 Default email allowlist includes: <span className="text-white font-medium">areedaqueen9@gmail.com</span> and <span className="text-white font-medium">naveedali@hafiz.com</span> (prefulfilled by inputting "Naveedali"). If an admin user does not exist in your live Firebase Authentication yet, sign in with your chosen password and hit <strong className="text-zinc-300">"Bootstrap Admin Account"</strong> to instantiate it instantly!
          </p>
        </div>
      </div>
    );
  }

  // 2. Render MAIN ADMINISTRATOR PANEL DASHBOARD
  return (
    <div id="admin-dashboard-view" className="space-y-8 py-6 pb-12">
      {/* Dynamic top bar with status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-widest">
              SECURED SELLER CONSOLE
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Secure active login session" />
          </div>
          <h1 className="font-serif font-medium text-2xl tracking-tight text-white">
            Hafiz Storefront Console
          </h1>
          <p className="text-xs text-zinc-450 font-light mt-0.5">
            Active session: <span className="font-semibold text-zinc-300">{currentUser.email}</span>
          </p>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-3">
          <button
            onClick={refreshProducts}
            disabled={isLoading}
            className="p-2.5 rounded bg-zinc-950 hover:bg-zinc-90 w-10 h-10 border border-zinc-900 text-white cursor-pointer transition-colors flex items-center justify-center shrink-0"
            title="Force refresh database products catalog mirror"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 border border-zinc-800 hover:text-white hover:border-zinc-700 text-xs font-semibold rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer h-10"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Grid containing Left Sidebar & Right Content panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-5">
          <div className="bg-[#0F0F11] border border-zinc-900 rounded p-4 space-y-2">
            <span className="text-[8px] tracking-wider uppercase font-bold text-zinc-550 block mb-2 px-2">Navigation Links</span>
            
            {/* Overview link */}
            <button
              onClick={() => { setActiveTab('overview'); setShowForm(false); }}
              className={`w-full px-3 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                activeTab === 'overview' && !showForm
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-950/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Home</span>
            </button>

            {/* Catalog inventory link */}
            <button
              onClick={() => { setActiveTab('catalog'); setShowForm(false); }}
              className={`w-full px-3 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                activeTab === 'catalog' && !showForm
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-950/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Products Management</span>
            </button>

            {/* Easy Add Form Selector */}
            <button
              onClick={handleAddNewClick}
              className={`w-full px-3 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                showForm && !editingProduct
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-950/50'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            {/* Frontend Look Preview Simulator */}
            <button
              onClick={() => { setActiveTab('preview'); setShowForm(false); }}
              className={`w-full px-3 py-2.5 rounded text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                activeTab === 'preview' && !showForm
                  ? 'bg-white text-black'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-950/50'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Store Live Preview</span>
            </button>
          </div>

          {/* Quick Stats overview panel */}
          <div className="bg-[#0F0F11] border border-zinc-900 rounded p-4.5 space-y-4">
            <h4 className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider px-1">QUICK INVENTORY TRACE</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs px-1">
                <span className="text-zinc-500">Total Catalogued</span>
                <span className="font-semibold text-white">{products.length} Items</span>
              </div>
              <div className="flex justify-between items-center text-xs px-1 pt-2 border-t border-zinc-950">
                <span className="text-zinc-500">Asset Valuation</span>
                <span className="font-semibold text-white">${totalPricingAccumulated.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center text-xs px-1 pt-2 border-t border-zinc-950">
                <span className="text-zinc-500">Gateway Status</span>
                <span className="font-semibold text-emerald-400">Read / Write Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Active View Panel */}
        <div className="lg:col-span-9 space-y-6">

          {/* Render Active Product Editor Form Block */}
          {showForm ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  {editingProduct ? 'Modifying Existing Document' : 'Compose Digital Release Item'}
                </h3>
                <button
                  onClick={() => { setShowForm(false); setEditingProduct(null); setActiveTab('catalog'); }}
                  className="text-xs text-zinc-405 hover:text-white underline cursor-pointer"
                >
                  Back to inventory
                </button>
              </div>

              <AdminProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  setActiveTab('catalog');
                }}
              />
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW PANEL WITH BIG STATS */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    
                    <div className="p-5 bg-[#0F0F11] border border-zinc-900 rounded flex items-center gap-4 shadow">
                      <div className="flex items-center justify-center w-11 h-11 rounded bg-zinc-950 border border-zinc-800 text-white shrink-0">
                        <ShoppingBag className="w-5 h-5 text-white animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-550 block uppercase tracking-widest font-bold">Catalogued items</span>
                        <span className="font-serif font-medium text-lg text-white block mt-0.5">{products.length} Products</span>
                      </div>
                    </div>

                    <div className="p-5 bg-[#0F0F11] border border-zinc-900 rounded flex items-center gap-4 shadow">
                      <div className="flex items-center justify-center w-11 h-11 rounded bg-zinc-950 border border-zinc-800 text-white shrink-0">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-550 block uppercase tracking-widest font-bold">Accumulated Value</span>
                        <span className="font-serif font-medium text-lg text-white block mt-0.5">${totalPricingAccumulated.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="p-5 bg-[#0F0F11] border border-zinc-900 rounded flex items-center gap-4 shadow">
                      <div className="flex items-center justify-center w-11 h-11 rounded bg-zinc-950 border border-zinc-800 text-white shrink-0">
                        <KeyRound className="w-5 h-5 text-zinc-350" />
                      </div>
                      <div>
                        <span className="text-[9px] text-zinc-550 block uppercase tracking-widest font-bold">Authorization Level</span>
                        <span className="font-medium text-white text-xs block mt-0.5 break-all max-w-[150px] truncate" title={currentUser.email || ''}>
                          Admin Verified
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Introductory welcome box */}
                  <div className="p-6 bg-zinc-950 border border-zinc-900 rounded flex flex-col md:flex-row items-start gap-4 shadow-sm">
                    <div className="p-2.5 rounded bg-[#0F0F11] border border-zinc-900 shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-serif font-medium text-sm text-white">
                        Hafiz Digital Products Administration
                      </h4>
                      <p className="text-xs text-zinc-400 font-light leading-relaxed">
                        Welcome, logged in safely as administrator. Use the dashboard navigation to manage digital releases, modify live files stored in Google Drive or MediaFire, edit prices, upload covers, and test client layouts seamlessly. Any updates take effect for storefront visitors in real-time.
                      </p>
                    </div>
                  </div>

                  {/* Showcase short guide */}
                  <div className="bg-[#0F0F11] border border-zinc-900 rounded overflow-hidden">
                    <div className="py-3.5 px-5 bg-zinc-950 border-b border-zinc-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-zinc-400" />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">How instant downloads are secured</span>
                    </div>
                    <div className="p-5 text-xs text-zinc-400 leading-relaxed space-y-3 font-light">
                      <p>
                        🔒 <strong className="text-white font-medium">Restricted Firestore writing:</strong> Only your authenticated email can invoke writes, deletes, or updates. Your customers view read-only lists safely.
                      </p>
                      <p>
                        🔗 <strong className="text-white font-medium">Secured Download Delivery:</strong> Inside "Products Management", specify full valid destination links (e.g. Mediafire file directories or Google Drive URLs). The link remains cloaked behind a payment overlay until checkout is simulating success.
                      </p>
                      <p>
                        🎨 <strong className="text-white font-medium">Instant Dynamic Previews:</strong> Navigate to the <strong className="text-zinc-200">Store Live Preview</strong> tab to inspect styling and layout proportions on desktop-sized devices of any catalog item inside your database before release!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CATALOG INVENTORY */}
              {activeTab === 'catalog' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Inventory Catalog Directory
                    </h3>
                    <button
                      onClick={handleAddNewClick}
                      className="px-4.5 py-2.5 bg-white hover:bg-zinc-250 text-black text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create New Product Asset</span>
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="p-16 text-center bg-[#0F0F11] border border-zinc-905 rounded animate-pulse space-y-3">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-zinc-400" />
                      <span className="text-xs text-zinc-450 block font-light">Syncing cloud inventory dataset...</span>
                    </div>
                  ) : products.length > 0 ? (
                    <div className="bg-[#0F0F11] border border-zinc-900 rounded overflow-hidden shadow-xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-450 font-bold uppercase tracking-wider text-[9px]">
                              <th className="py-3 px-4">Asset Cover</th>
                              <th className="py-3 px-4">Title & Category</th>
                              <th className="py-3 px-4">Price</th>
                              <th className="py-3 px-4">Download Location</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900">
                            {products.map((p) => (
                              <tr key={p.id} className="hover:bg-zinc-950/40 transition-colors">
                                <td className="py-3.5 px-4 shrink-0">
                                  <img
                                    src={p.image}
                                    alt={p.title}
                                    referrerPolicy="no-referrer"
                                    className="w-14 h-9 object-cover rounded bg-zinc-950 border border-zinc-900"
                                  />
                                </td>
                                <td className="py-3.5 px-4 space-y-1">
                                  <div className="font-serif font-medium text-white text-xs truncate max-w-[180px]" title={p.title}>
                                    {p.title}
                                  </div>
                                  <span className="inline-block text-[8px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900 font-sans">
                                    {p.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-serif font-medium text-white">
                                  ${Number(p.price).toFixed(2)}
                                </td>
                                <td className="py-3.5 px-4 text-zinc-450 font-mono text-[9px] truncate max-w-[170px]" title={p.downloadLink}>
                                  <a href={p.downloadLink} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                                    <span>{p.downloadLink}</span>
                                    <ExternalLink className="w-2.5 h-2.5 text-zinc-650" />
                                  </a>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => handleEditClick(p)}
                                      className="p-1.5 px-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-850 text-[10px] font-bold uppercase tracking-wider rounded text-zinc-350 hover:text-white transition-colors cursor-pointer"
                                      title="Edit details"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(p.id, p.title)}
                                      className="p-1.5 px-2.5 bg-zinc-950 hover:bg-red-950/20 border border-zinc-900 hover:border-red-900 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                                      title="Delete permanently"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="p-12 text-center rounded border border-dashed border-zinc-900 bg-[#0F0F11] text-zinc-500 text-xs">
                      Your store has no products yet. Click "Create New Product Asset" to upload your first digital item in real-time!
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: STORE LIVE PREVIEW (HOW PRODUCT WILL LOOK ON FRONTEND) */}
              {activeTab === 'preview' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Selection headers */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F0F11] border border-zinc-900 p-4 rounded shadow-sm">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-0.5">
                        Frontend Look Simulator
                      </h3>
                      <p className="text-[10px] text-zinc-400 font-light">
                        Select a file from your database list to simulate how visitors view the product layout!
                      </p>
                    </div>

                    {products.length > 0 && (
                      <select
                        value={selectedPreviewProduct?.id || ''}
                        onChange={(e) => {
                          const matched = products.find(p => p.id === e.target.value);
                          if (matched) setSelectedPreviewProduct(matched);
                        }}
                        className="px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-750"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.title} (${Number(p.price).toFixed(2)})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Embedded product view mock-up */}
                  <div className="border border-zinc-900 rounded bg-[#070708] overflow-hidden p-6 relative">
                    
                    {/* Live store banner header decoration mock */}
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6 text-[10px] tracking-wider uppercase text-zinc-500 font-mono">
                      <span>MOCK ACTIVE DEVICE VIEW: CLIENT PORTAL</span>
                      <span className="text-emerald-400">● SIMULATION COMPATIBLE</span>
                    </div>

                    {selectedPreviewProduct ? (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start text-zinc-300">
                        
                        {/* Title and Descriptions mockup */}
                        <div className="md:col-span-7 space-y-6">
                          
                          {/* Image tile representation */}
                          <div className="relative aspect-video rounded overflow-hidden border bg-zinc-950 border-zinc-900 shadow-xl">
                            <img
                              src={selectedPreviewProduct.image}
                              alt={selectedPreviewProduct.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {/* Tag badge */}
                            <div className="absolute top-4 left-4">
                              <span className="text-[8px] font-bold tracking-widest uppercase px-2 py-1 bg-black/80 text-white border border-zinc-800 backdrop-blur">
                                {selectedPreviewProduct.category}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1">
                              <h1 className="font-serif font-medium text-2xl tracking-tight text-white">
                                {selectedPreviewProduct.title}
                              </h1>
                              <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                                ${Number(selectedPreviewProduct.price).toFixed(2)} USD (One-Time Lifetime Fee)
                              </p>
                            </div>

                            <div className="border-t border-b border-zinc-900 py-3.5 flex flex-wrap gap-6 text-xs text-zinc-400">
                              <div>
                                <span className="font-semibold block text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">FILE SIZE</span>
                                <span className="font-bold text-white">{selectedPreviewProduct.fileSize || '12.4 MB'}</span>
                              </div>
                              <div>
                                <span className="font-semibold block text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">FORMAT</span>
                                <span className="font-bold text-white">{selectedPreviewProduct.fileType || 'Universal Access'}</span>
                              </div>
                              <div>
                                <span className="font-semibold block text-[9px] text-zinc-500 uppercase tracking-widest mb-0.5">DELIVERY</span>
                                <span className="font-semibold text-white flex items-center gap-1 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-805 text-[10px]">
                                  <span>Instant cloud link</span>
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Product Overview</h3>
                              <p className="text-xs text-zinc-400 leading-relaxed text-justify font-light">
                                {selectedPreviewProduct.description}
                              </p>
                              <div className="text-xs text-zinc-405 leading-relaxed text-justify whitespace-pre-wrap font-light">
                                {selectedPreviewProduct.fullDescription}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Checkout panel simulation mockup */}
                        <div className="md:col-span-5 bg-[#0F0F11] border border-zinc-900 rounded p-5 space-y-4 shadow-2xl">
                          <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Instant Secure Checkout</span>
                            <span className="text-[8px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                              🔒 SSL Secured
                            </span>
                          </div>

                          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded text-xs space-y-2">
                            <div className="flex justify-between text-zinc-450">
                              <span>Premium Asset</span>
                              <span className="font-semibold text-white truncate max-w-[140px]">{selectedPreviewProduct.title}</span>
                            </div>
                            <div className="flex justify-between pt-1.5 border-t border-zinc-900 font-serif font-medium text-sm text-white">
                              <span>Total Price</span>
                              <span>${Number(selectedPreviewProduct.price).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Dummy checkout trigger input */}
                          <div className="space-y-3 pt-1">
                            <div>
                              <span className="block text-[8px] uppercase tracking-wider font-bold text-zinc-500 mb-1">Email Address *</span>
                              <input
                                type="text"
                                disabled
                                value="customer@example.com"
                                className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-900 text-zinc-500 cursor-not-allowed"
                              />
                            </div>
                            <div className="p-3 bg-zinc-950 rounded border border-zinc-950 text-[10px] text-zinc-405 font-light text-center leading-normal">
                              This sidebar card simulates the active premium SSL payment workflow. Once completed, download keys map instantly.
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled
                            className="w-full py-3 bg-white text-black text-[10px] font-bold uppercase tracking-wider rounded cursor-not-allowed flex items-center justify-center gap-1 opacity-70"
                          >
                            <span>Proceed to simulation</span>
                          </button>
                        </div>

                      </div>
                    ) : (
                      <div className="p-12 text-center text-zinc-550 text-xs font-light">
                        Upload some products into Hafiz Catalog first to unlock interactive previews!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
