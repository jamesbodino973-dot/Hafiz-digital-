import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

import presetsImg from '../assets/images/presets_cover_1781907583917.jpg';
import notionImg from '../assets/images/notion_cover_1781907602880.jpg';
import landingImg from '../assets/images/landing_cover_1781907623591.jpg';
import iconsImg from '../assets/images/icons_cover_1781907643470.jpg';

const initialProducts: Omit<Product, 'id'>[] = [
  {
    title: 'Warm & Cinematic Lightroom Presets',
    description: 'Elevate your photography with 15+ premium warm cinematic tones for desktop and mobile.',
    fullDescription: 'Unleash professional editing on your photos with one click. This hand-crafted collection focuses on warm skin tones, faded shadows, vibrant autumn colors, and stunning cinematic contrast. Perfect for travel, lifestyle, and portrait photographers looking to establish a cohesive, eye-catching grid. Compatible with Lightroom Mobile (DNG files) and Lightroom Classic CC (XMP files). No premium subscription required for mobile use.',
    price: 19.99,
    category: 'Preset',
    image: presetsImg,
    downloadLink: 'https://drive.google.com/drive/folders/1presetsPlaceholderFolderId',
    fileSize: '45 MB',
    fileType: 'XMP & DNG'
  },
  {
    title: 'Ultimate Personal OS Notion Dashboard',
    description: 'An all-in-one elegant Notion system to optimize your habits, budget, goals, and daily tasks.',
    fullDescription: 'Take back control of your day-to-day life with the complete Personal OS framework. Built with clean minimalism and modular grids, it integrates smart trackers for your workouts, finances, library, project timelines, and mindfulness logs. Includes detailed setup guides, embedded widgets, dynamic progress bars, and custom vector icons. Designed for individuals who demand structure and aesthetic clarity.',
    price: 24.99,
    category: 'Template',
    image: notionImg,
    downloadLink: 'https://drive.google.com/drive/folders/1notionPlaceholderFolderId',
    fileSize: '1.2 MB',
    fileType: 'Notion Template'
  },
  {
    title: 'Saasify Startup Landing Page React/Tailwind',
    description: 'A modern, high-performance responsive landing template crafted in React, Vite, and Tailwind.',
    fullDescription: 'Launch your next software project with a developer-first web template. Saasify comes with high-contrast emerald visual grids, interactive feature components, responsive navigation overlays, dark-mode styling variables, and subtle entrance animations using framer-motion. Highly modular code structured to easily drop in your custom copy and form submissions. Built with 100% Core Web Vitals optimization.',
    price: 39.99,
    category: 'Software',
    image: landingImg,
    downloadLink: 'https://drive.google.com/drive/folders/1landingPlaceholderFolderId',
    fileSize: '15.8 MB',
    fileType: 'ZIP Archive'
  },
  {
    title: 'Modernist Outline Vector Icon Pack',
    description: 'Over 600+ sleek, handcrafted vector outline icons optimized for UI design and web applications.',
    fullDescription: 'An exclusive design resource featuring precise grid-perfect vector SVG icons. Clean geometric outlines matching standard 24px layouts with adjustable stroke-width and unified styling. The pack includes categorized folders for E-commerce, Interface controls, Finance, Social, Devices, and Maps. Perfect for professional UI designers, Figma builders, and developers craving aesthetic consistency. Includes .fig, .svg, and .png exports.',
    price: 14.99,
    category: 'Icon Pack',
    image: iconsImg,
    downloadLink: 'https://www.mediafire.com/file/iconsPlaceholderFileId',
    fileSize: '12.4 MB',
    fileType: 'SVG, FIG & PNG Package'
  }
];

export async function seedProductsIfNeeded() {
  try {
    const productsCol = collection(db, 'products');
    const snapshot = await getDocs(productsCol);
    
    if (snapshot.empty) {
      console.log('Product collection is empty. Seeding default digital products...');
      for (const product of initialProducts) {
        await addDoc(productsCol, {
          ...product,
          createdAt: serverTimestamp()
        });
      }
      console.log('Digital products successfully seeded into Cloud Firestore!');
    } else {
      console.log('Products already exist in Firestore. Skipping seed.');
    }
  } catch (error) {
    console.error('Error checking or seeding database:', error);
  }
}
