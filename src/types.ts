export interface Company {
  name: string;
  activitySector?: string; // Ex: 'Hortifruti', 'Padaria', etc.
  cnpj?: string;
  address?: string;
}

export interface Product {
  id: string;
  name: string;
  emoji: string;
  defaultPrice: number;
  costPrice: number;
  totalStock: number;
  availableStock: number;
  ncm?: string; // New field for tax NCM
}

export type OrderStatus = 'pendente' | 'em_separacao' | 'entregue';
export type PaymentStatus = 'fiado' | 'pago';

export interface OrderItem {
  productId: string;
  quantity: number;
  originalQuantity?: number; // Added to track changes during separation
  priceAtOrder: number;
  collected?: boolean; // Added for checklist
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone?: string; // New field: WhatsApp phone
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment: PaymentStatus;
  time: string; // ISO string or simple time string
  date?: string; // To track daily orders
}

export interface CollectionItem {
  id: string;
  productId: string;
  requestedQuantity: number; // Qtd_Solicitada
  deliveredQuantity?: number; // Qtd_Entregue
  status: 'pending' | 'collected';
  costPrice?: number; // preco_custo_dia
  date?: string;
}

export interface DivergenceLog {
  id: string;
  productId: string;
  productName: string;
  requestedQuantity: number;
  deliveredQuantity: number;
  diff: number;
  costPrice: number;
  date: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO Date string
}

export interface DailyHistory {
  date: string;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  ordersCount: number;
}

export interface AppContextType {
  isLoaded: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  company: Company | null;
  setCompany: (company: Company) => void;
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  collectionList: CollectionItem[];
  addCollectionItem: (productId: string, requestedQuantity: number) => void;
  removeCollectionItem: (id: string) => void;
  toggleCollectionStatus: (id: string, deliveredQuantity?: number, costPrice?: number) => void;
  divergenceLogs: DivergenceLog[];
  expenses: Expense[];
  addExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  dailyHistory: DailyHistory[];
  closeDay: () => void;
}
