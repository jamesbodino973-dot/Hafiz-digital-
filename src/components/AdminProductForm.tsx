import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X, Sparkles, Link as LinkIcon, Edit2, Upload, Image as ImageIcon, FileImage } from 'lucide-react';
import { Product, Category } from '../types';

interface AdminProductFormProps {
  product: Product | null; // null if adding new
  onSave: (productData: Omit<Product, 'id'> & { id?: string }) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: Category[] = ['Template', 'Preset', 'Icon Pack', 'eBook', 'Software'];

// High quality abstract images for design seeding
const COVER_PRESETS = [
  {
    name: 'presets_cover',
    url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600',
    label: 'Warm Camera (Photography Preset)'
  },
  {
    name: 'notion_cover',
    url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600',
    label: 'Modern Notebook (Organization & Notion)'
  },
  {
    name: 'landing_cover',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    label: 'Futuristic Glow (SaaS Coding/Software)'
  },
  {
    name: 'icons_cover',
    url: 'https://images.unsplash.com/photo-1614036417651-efe5912149d8?auto=format&fit=crop&q=80&w=600',
    label: 'Aesthetic Interface Layout (Graphic Kits)'
  },
  {
    name: 'ebook_cover',
    url: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
    label: 'Digital Page Folders (eBooks & Guidelines)'
  }
];

export default function AdminProductForm({ product, onSave, onCancel }: AdminProductFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Category>('Template');
  const [image, setImage] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Populate form if editing
  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setDescription(product.description || '');
      setFullDescription(product.fullDescription || '');
      setPrice(product.price ? product.price.toString() : '');
      setCategory((product.category as Category) || 'Template');
      setImage(product.image || '');
      setDownloadLink(product.downloadLink || '');
      setFileSize(product.fileSize || '');
      setFileType(product.fileType || '');
    } else {
      // Clear form
      setTitle('');
      setDescription('');
      setFullDescription('');
      setPrice('');
      setCategory('Template');
      setImage(COVER_PRESETS[0].url); // default to first cover preset
      setDownloadLink('');
      setFileSize('');
      setFileType('');
    }
  }, [product]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Selected file is not an image. Please upload a JPEG, PNG or WebP cover image.');
      return;
    }
    // Limit to 1MB for Firestore safe storage of base64 preview
    if (file.size > 1048576) {
      setError('Image file is too large (max 1MB). Please upload a smaller compressed image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file correctly.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate inputs
    if (!title.trim()) return setError('Product title is required');
    if (!description.trim()) return setError('Short description is required');
    if (!fullDescription.trim()) return setError('Full description is required');
    if (!price || parseFloat(price) <= 0) return setError('Please input a valid price greater than 0');
    if (!image.trim()) return setError('Please provide a cover image URL (or select a file)');
    if (!downloadLink.trim()) return setError('Please specify Google Drive/MediaFire download link');
    if (!downloadLink.startsWith('http://') && !downloadLink.startsWith('https://')) {
      return setError('Download link must be a valid URL (starting with http:// or https://)');
    }

    setIsSubmitting(true);
    try {
      const parsedPrice = parseFloat(price);
      const productData = {
        title: title.trim(),
        description: description.trim(),
        fullDescription: fullDescription.trim(),
        price: parsedPrice,
        category,
        image: image.trim(),
        downloadLink: downloadLink.trim(),
        fileSize: fileSize.trim() || 'Variable',
        fileType: fileType.trim() || 'Universal Link'
      };

      if (product?.id) {
        await onSave({ ...productData, id: product.id });
      } else {
        await onSave(productData);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyCoverPreset = (url: string) => {
    setImage(url);
    setError(null);
  };

  return (
    <div className="bg-[#0F0F11] border border-zinc-900 rounded overflow-hidden p-6 max-w-3xl mx-auto shadow-xl">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-6">
        <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
          {product ? <Edit2 className="w-4 h-4 text-white" /> : <PlusCircle className="w-4 h-4 text-white" />}
          <span>{product ? 'Edit Campaign Product' : 'Add New Digital Product'}</span>
        </h2>
        <button
          onClick={onCancel}
          className="p-1 px-3 border border-zinc-905 rounded text-[10px] uppercase font-bold tracking-wider hover:bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/20 text-red-400 text-xs border border-red-900/30 rounded leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5">
              Product Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Ultimate Notion Life Dashboard Creator"
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5">
              Selling Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., 14.99"
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-zinc-700"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-950 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Google Drive / MediaFire Link */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span>Drive or MediaFire Download Link *</span>
            </label>
            <input
              type="text"
              value={downloadLink}
              onChange={(e) => setDownloadLink(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/... OR https://www.mediafire.com/file/..."
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Image Link & Local Upload */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5">
              Product Cover Image *
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left 1/3: File Upload box */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`col-span-1 border border-dashed rounded p-4 flex flex-col items-center justify-center text-center transition-colors relative cursor-pointer group min-h-[140px] ${
                  dragOver
                    ? 'border-white bg-zinc-900/50'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-1.5 flex flex-col items-center">
                  <Upload className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors animate-pulse" />
                  <span className="text-[9px] text-zinc-405 font-bold uppercase tracking-wider block">
                    Upload Cover File
                  </span>
                  <span className="text-[8px] text-zinc-500 font-light block leading-normal">
                    Drag-and-drop here or click to choose
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {/* Right 2/3: URL Input and dynamic preview */}
              <div className="col-span-1 md:col-span-2 flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-wider font-bold text-zinc-550 block px-0.5">
                    Or Enter Image URL address:
                  </span>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => {
                      setImage(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g., https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
                  />
                </div>

                {/* Cover preview box */}
                <div className="h-16 rounded border border-zinc-905 bg-zinc-950 overflow-hidden flex items-center justify-between p-2 pl-3">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-10 rounded border border-zinc-900 bg-[#0F0F11] overflow-hidden flex items-center justify-center shrink-0">
                      {image ? (
                        <img
                          src={image}
                          alt="Cover upload preview"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={() => setError('Image link is currently resolving or has expired.')}
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-zinc-700" />
                      )}
                    </div>
                    <div>
                      <span className="text-[9px] text-white font-medium block truncate max-w-[170px]">
                        {image?.startsWith('data:') ? 'Local uploaded file (Base64)' : (image ? 'Remote internet image' : 'No Cover Selected')}
                      </span>
                      <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">
                        Live Preview cover tile
                      </span>
                    </div>
                  </div>
                  {image && (
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="text-[9px] font-bold text-zinc-400 font-sans uppercase tracking-wider hover:text-white px-2 py-1 bg-zinc-900 border border-zinc-800 rounded cursor-pointer transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Elegant presets selector */}
            <div className="mt-2.5 px-0.5">
              <span className="text-[9px] font-bold text-zinc-500 block mb-1.5 tracking-widest uppercase">
                Or pick a premium image layout preset:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {COVER_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applyCoverPreset(preset.url)}
                    className={`p-1.5 rounded border text-left flex flex-col justify-between h-20 overflow-hidden text-[9px] font-medium hover:border-zinc-400 transition-colors relative cursor-pointer group ${
                      image === preset.url
                        ? 'border-white bg-zinc-950'
                        : 'border-zinc-900 bg-zinc-950'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform opacity-30"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-white truncate text-[8px] uppercase tracking-wider text-center">
                      {preset.name.replace('_', ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional file meta metrics */}
          <div>
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5">
              File Size (Optional)
            </label>
            <input
              type="text"
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              placeholder="e.g., 18.5 MB"
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5">
              File Format (Optional)
            </label>
            <input
              type="text"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              placeholder="e.g., ZIP, PDF, Notion Template"
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Short Description */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5">
              Short Description * (Max 120 chars)
            </label>
            <input
              type="text"
              maxLength={120}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Beautiful film Lightroom presets layout for digital photography curation"
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700"
            />
          </div>

          {/* Full description */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase tracking-widest px-0.5">
              Full Description / Bulleted Points *
            </label>
            <textarea
              rows={4}
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              placeholder="Describe what the product is, features included, benefits, how to download and custom usage support instructions."
              className="w-full px-3 py-2.5 text-xs rounded bg-zinc-950 border border-zinc-900 text-white placeholder-zinc-650 focus:outline-none focus:border-zinc-700 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Form controls submit */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-zinc-900">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 border border-zinc-900 hover:border-zinc-800 rounded bg-[#0F0F11] hover:bg-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded bg-white hover:bg-zinc-200 text-black text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving Asset...' : 'Save Product Document'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
