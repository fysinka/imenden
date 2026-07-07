export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id?: string;
  category?: Category;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  is_customizable: boolean;
  available_sizes: string[];
  available_colors: ProductColor[];
  product_type: string;
  tags: string[];
  rating: number;
  review_count: number;
  sold_count: number;
  images?: ProductImage[];
  created_at: string;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductReview {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment?: string;
  is_approved: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: ProductColor;
  customization?: TshirtCustomization;
}

export interface TshirtCustomization {
  size: string;
  color: ProductColor;
  printPosition: 'front' | 'back' | 'sleeve';
  uploadedImageUrl?: string;
  customText?: string;
  fontFamily?: string;
  textColor?: string;
  note?: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  city?: string;
  note?: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: string;
  tracking_number?: string;
  admin_notes?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customization?: Record<string, unknown>;
}

export interface Publication {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  category: string;
  tags: string[];
  is_published: boolean;
  published_at?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface NameDay {
  id: string;
  date_key: string;
  names: string[];
  description?: string;
}

export interface Holiday {
  id: string;
  date_key: string;
  name: string;
  type: 'national' | 'international' | 'observance';
  description?: string;
}

export interface ChurchHoliday {
  id: string;
  date_key: string;
  name: string;
  type: string;
  description?: string;
  is_great_feast: boolean;
}

export interface HistoricalEvent {
  id: string;
  date_key: string;
  year?: number;
  title: string;
  description?: string;
  category: string;
}

export interface FamousPerson {
  id: string;
  date_key: string;
  event_type: 'born' | 'died';
  year?: number;
  name: string;
  description?: string;
  nationality?: string;
  profession?: string;
}

export interface FolkTradition {
  id: string;
  date_key?: string;
  month?: number;
  title: string;
  content?: string;
  proverb?: string;
  category: string;
}

export interface DayData {
  nameDay?: NameDay;
  holidays: Holiday[];
  churchHolidays: ChurchHoliday[];
  historicalEvents: HistoricalEvent[];
  famousPeople: FamousPerson[];
  folkTraditions: FolkTradition[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  value_json?: unknown;
  description?: string;
}
