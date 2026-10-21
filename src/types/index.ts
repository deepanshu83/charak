export type ProductCategory = "Herbal Formulation" | "Therapeutic Oil" | "Wellness" | "Care";

export interface ProductImage {
  id: string;
  productId: string;
  storagePath: string;
  imageUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  displayOrder: number;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  image: string;
  images?: string[];
  storagePaths?: string[];
  productImages?: ProductImage[];
  category: ProductCategory;
  stock: number;
  active: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "MOCK_PAID" | "PAID" | "CANCELLED" | "FAILED" | "REFUNDED";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: OrderItem[];
  subtotal?: number;
  total?: number;
}

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  email: string;
  doctorId: string;
  treatmentId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  slug?: string;
  title: string;
  designation?: string;
  specialization?: string;
  qualifications: string;
  experience: string;
  bio?: string;
  detailedBio?: string;
  availability?: string;
  timings?: string;
  location: string;
  image: string;
  storagePath?: string;
  consultationFee: number;
  displayOrder?: number;
  active?: boolean;
  availableTimes: Record<string, string[]>;
  treatmentIds?: string[];
}

export interface Treatment {
  id: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description: string;
  duration: string;
  price: number;
  image?: string;
  icon: string;
  active?: boolean;
}

export interface BlogFAQ {
  q: string;
  a: string;
}

export interface BlogSource {
  name: string;
  url?: string;
}

export interface BlogInternalLink {
  label: string;
  href: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  body: string[];
  content?: string[];
  featuredImage?: string;
  storagePath?: string;
  published?: boolean;
  publishedAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  faqs?: BlogFAQ[];
  sources?: BlogSource[];
  internalLinks?: BlogInternalLink[];
}

export interface PatientStory {
  id: string;
  name: string;
  location: string;
  treatment: string;
  quote: string;
  rating: number;
  image?: string;
  storagePath?: string;
  published?: boolean;
  displayOrder?: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "therapy" | "clinic" | "herbs" | string;
  caption: string;
  image: string;
  storagePath?: string;
  fileSize?: number;
  displayOrder?: number;
  published?: boolean;
}

export interface VideoTestimonial {
  id: string;
  title: string;
  patientName: string;
  description: string;
  videoUrl: string;
  storagePath?: string;
  thumbnailUrl?: string;
  thumbnailStoragePath?: string;
  fileSize?: number;
  duration?: number;
  published: boolean;
  displayOrder?: number;
  createdAt: string;
  updatedAt?: string;
}

