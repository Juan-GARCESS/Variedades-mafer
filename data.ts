export interface Product {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stockMinimo: number;
}

export interface Sale {
  id: string;
  fecha: string;
  productos: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  total: number;
  estado: 'completada' | 'pendiente';
}

export interface AdditionalService {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: 'servicio' | 'venta-externa';
}

export interface HistoryEntry {
  id: string;
  fecha: string;
  tipo: 'ingreso-producto' | 'venta-producto' | 'servicio-adicional';
  descripcion: string;
  monto: number;
  signo: '+' | '-';
}

// Base de datos simulada
export const products: Product[] = [
  {
    id: '1',
    nombre: 'Cuaderno universitario',
    categoria: 'Cuadernos',
    precio: 25.5,
    stock: 45,
    stockMinimo: 10
  },
  {
    id: '2',
    nombre: 'Bolígrafo azul BIC',
    categoria: 'Escritura',
    precio: 3.75,
    stock: 8,
    stockMinimo: 20
  },
  {
    id: '3',
    nombre: 'Resma papel A4',
    categoria: 'Papel',
    precio: 45,
    stock: 30,
    stockMinimo: 15
  },
  {
    id: '4',
    nombre: 'Goma blanca Pelikan',
    categoria: 'Accesorios',
    precio: 8.5,
    stock: 25,
    stockMinimo: 10
  },
  {
    id: '5',
    nombre: 'Calculadora científica',
    categoria: 'Electrónicos',
    precio: 85,
    stock: 12,
    stockMinimo: 5
  }
];

export const sales: Sale[] = [
  {
    id: '1',
    fecha: '2024-09-26',
    productos: [
      { productoId: '1', cantidad: 3, precioUnitario: 25.5 },
      { productoId: '2', cantidad: 5, precioUnitario: 3.75 },
      { productoId: '3', cantidad: 1, precioUnitario: 45 }
    ],
    total: 125.5,
    estado: 'completada'
  },
  {
    id: '2',
    fecha: '2024-09-25',
    productos: [
      { productoId: '4', cantidad: 2, precioUnitario: 8.5 },
      { productoId: '1', cantidad: 2, precioUnitario: 25.5 }
    ],
    total: 75.25,
    estado: 'completada'
  },
  {
    id: '3',
    fecha: '2024-09-24',
    productos: [
      { productoId: '3', cantidad: 5, precioUnitario: 45 },
      { productoId: '2', cantidad: 10, precioUnitario: 3.75 }
    ],
    total: 285,
    estado: 'pendiente'
  }
];

export const additionalServices: AdditionalService[] = [
  {
    id: '1',
    fecha: '2024-09-26',
    descripcion: 'Fotocopias (50 páginas)',
    monto: 15,
    tipo: 'servicio'
  },
  {
    id: '2',
    fecha: '2024-09-25',
    descripcion: 'Arreglo de hoja de vida',
    monto: 30,
    tipo: 'servicio'
  }
];

// Funciones para Productos
export function addProduct(product: Omit<Product, 'id'>): Product {
  const newProduct: Product = {
    ...product,
    id: Date.now().toString()
  };
  products.push(newProduct);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = { ...products[index], ...updates };
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  products.splice(index, 1);
  return true;
}

// Funciones para Ventas
export function addSale(sale: Omit<Sale, 'id'>): Sale {
  const newSale: Sale = {
    ...sale,
    id: Date.now().toString()
  };
  sales.push(newSale);
  
  // Actualizar stock
  sale.productos.forEach(item => {
    const product = products.find(p => p.id === item.productoId);
    if (product) {
      product.stock -= item.cantidad;
    }
  });
  
  return newSale;
}

export function updateSaleStatus(id: string, estado: 'completada' | 'pendiente'): Sale | null {
  const index = sales.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  sales[index].estado = estado;
  return sales[index];
}

// Funciones para Servicios Adicionales
export function addAdditionalService(service: Omit<AdditionalService, 'id'>): AdditionalService {
  const newService: AdditionalService = {
    ...service,
    id: Date.now().toString()
  };
  additionalServices.push(newService);
  return newService;
}

export function deleteAdditionalService(id: string): boolean {
  const index = additionalServices.findIndex(s => s.id === id);
  if (index === -1) return false;
  
  additionalServices.splice(index, 1);
  return true;
}

// Función para obtener historial general
export function getGeneralHistory(): HistoryEntry[] {
  const history: HistoryEntry[] = [];
  
  // Agregar ventas de productos
  sales.forEach(sale => {
    const productNames = sale.productos.map(item => {
      const product = products.find(p => p.id === item.productoId);
      return product ? `${product.nombre} (${item.cantidad})` : 'Producto desconocido';
    }).join(', ');
    
    history.push({
      id: `sale-${sale.id}`,
      fecha: sale.fecha,
      tipo: 'venta-producto',
      descripcion: `Venta: ${productNames}`,
      monto: sale.total,
      signo: '+'
    });
  });
  
  // Agregar servicios adicionales
  additionalServices.forEach(service => {
    history.push({
      id: `service-${service.id}`,
      fecha: service.fecha,
      tipo: 'servicio-adicional',
      descripcion: service.descripcion,
      monto: service.monto,
      signo: '+'
    });
  });
  
  // Ordenar por fecha (más reciente primero)
  return history.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
}
