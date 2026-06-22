export interface Product {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  price: number;
  category: string;
  image: string; // URL or base64
  downloadLink: string; // Google Drive or MediaFire link
  fileSize?: string;
  fileType?: string;
  createdAt?: any;
}

export type Category = 'Template' | 'Preset' | 'Icon Pack' | 'eBook' | 'Software' | 'All';
