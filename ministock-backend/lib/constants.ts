export const ROLES = {
  STAFF: 'STAFF',
  DEPARTMENT_MANAGER: 'DEPARTMENT_MANAGER',
  STORE_MANAGER: 'STORE_MANAGER',
  ADMIN: 'ADMIN'
} as const;

export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  WAITING_STORE_APPROVAL: 'WAITING_STORE_APPROVAL',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED'
} as const;

export const REQUEST_TYPE = {
  STOCK_OUT: 'STOCK_OUT',
  BORROW: 'BORROW'
} as const;

export const APPROVAL_STATUS = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
} as const;

export const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'Testname Admin',
    username: 'admin',
    password: 'demo1234',
    role: ROLES.ADMIN,
    department: 'Operations'
  },
  {
    id: 'user-store',
    name: 'Testname Store Manager',
    username: 'store.manager',
    password: 'demo1234',
    role: ROLES.STORE_MANAGER,
    department: 'Warehouse'
  },
  {
    id: 'user-manager-it',
    name: 'Testname Department Manager',
    username: 'dept.manager',
    password: 'demo1234',
    role: ROLES.DEPARTMENT_MANAGER,
    department: 'IT'
  },
  {
    id: 'user-staff-it',
    name: 'Testname Staff',
    username: 'staff.it',
    password: 'demo1234',
    role: ROLES.STAFF,
    department: 'IT'
  }
] as const;

export const DEFAULT_PRODUCTS = [
  {
    id: 'product-laptop-001',
    sku: 'NB-001',
    name: 'Office Notebook',
    category: 'Electronics',
    quantity: 14,
    unit: 'pcs',
    price: 780,
    minStock: 5,
    qrCode: 'MINISTOCK:NB-001'
  },
  {
    id: 'product-mouse-001',
    sku: 'MS-001',
    name: 'Wireless Mouse',
    category: 'Accessories',
    quantity: 24,
    unit: 'pcs',
    price: 25,
    minStock: 10,
    qrCode: 'MINISTOCK:MS-001'
  },
  {
    id: 'product-paper-001',
    sku: 'OF-001',
    name: 'A4 Paper Box',
    category: 'Office Supplies',
    quantity: 7,
    unit: 'box',
    price: 12,
    minStock: 8,
    qrCode: 'MINISTOCK:OF-001'
  }
] as const;
