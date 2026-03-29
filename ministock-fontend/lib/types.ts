export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: 'STAFF' | 'DEPARTMENT_MANAGER' | 'STORE_MANAGER' | 'ADMIN';
  department: string;
  password?: string;
}

export interface AuthSession {
  token: string;
  user: SessionUser;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number | null;
  image: string | null;
  qrCode: string | null;
  minStock: number;
  status: string | null;
  requests?: StockRequest[];
}

export interface Approval {
  id: string;
  stage: number;
  role: string;
  status: string;
  comment: string | null;
  actedAt: string;
  approver: SessionUser;
}

export interface StockRequest {
  id: string;
  quantity: number;
  type: 'STOCK_OUT' | 'BORROW';
  status: 'PENDING' | 'WAITING_STORE_APPROVAL' | 'REJECTED' | 'COMPLETED';
  reason: string | null;
  createdAt: string;
  completedAt: string | null;
  requester: SessionUser;
  product: Product;
  approvals: Approval[];
}

export interface LogEntry {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  balanceAfter: number;
  createdAt: string;
  createdBy: SessionUser;
  product: Product;
}

export interface LogResponse {
  logs: LogEntry[];
  stockMovements: StockMovement[];
}
