'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  stockMinimo: number;
  categoriaId: string;
  categoria: {
    id: string;
    nombre: string;
  };
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProductos: 0,
    productosStockBajo: 0,
    ventasHoy: 0,
    ingresosTotales: 0
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchStats();
    }
  }, [user]);

  const fetchProducts = async () => {
    const response = await fetch('/api/productos');
    const data = await response.json();
    setProducts(data);
  };

  const fetchStats = async () => {
    const productsRes = await fetch('/api/productos');
    const products = await productsRes.json();
    
    const ventasRes = await fetch('/api/ventas');
    const ventas = await ventasRes.json();
    
    const serviciosRes = await fetch('/api/servicios');
    const servicios = await serviciosRes.json();

    const today = new Date().toISOString().split('T')[0];
    const ventasHoy = ventas.filter((v: any) => v.fecha === today);
    const serviciosHoy = servicios.filter((s: any) => s.fecha === today);

    const ingresoVentas = ventas.reduce((sum: number, v: any) => sum + v.total, 0);
    const ingresoServicios = servicios.reduce((sum: number, s: any) => sum + s.monto, 0);

    setStats({
      totalProductos: products.length,
      productosStockBajo: products.filter((p: Product) => p.stock <= p.stockMinimo).length,
      ventasHoy: ventasHoy.length + serviciosHoy.length,
      ingresosTotales: ingresoVentas + ingresoServicios
    });
  };

  if (isLoading || !user) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Cargando...</div>;
  }

  const productosStockBajo = products.filter(p => p.stock <= p.stockMinimo);
  const productosMasVendidos = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Control completo de inventario, ventas y administración</p>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Productos en Stock</h3>
              <Package className="text-black" size={20} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">{stats.totalProductos}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{stats.productosStockBajo} con stock bajo</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Ventas Hoy</h3>
              <TrendingUp className="text-black" size={20} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">{stats.ventasHoy}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Transacciones</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Ingresos Totales</h3>
              <DollarSign className="text-black" size={20} />
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">${stats.ingresosTotales.toLocaleString('es-CO')} COP</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Acumulado</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Alertas</h3>
              <AlertTriangle className="text-black" size={20} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-black">{stats.productosStockBajo}</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Requieren reabastecimiento</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Productos con Stock Bajo */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 flex items-center">
              <AlertTriangle className="mr-2" size={18} />
              <span className="text-base sm:text-xl">Productos con Stock Bajo</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Los siguientes productos necesitan reabastecimiento
            </p>
            
            {productosStockBajo.length === 0 ? (
              <p className="text-gray-500">No hay productos con stock bajo</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {productosStockBajo.map(producto => (
                  <div key={producto.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <p className="font-medium text-black">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">{producto.categoria.nombre}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">Stock: {producto.stock}</p>
                      <p className="text-sm text-gray-500">Mínimo: {producto.stockMinimo}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Productos Más Vendidos */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-black mb-3 sm:mb-4 flex items-center">
              <TrendingUp className="mr-2" size={18} />
              <span className="text-base sm:text-xl">Productos Más Vendidos</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Los productos más populares
            </p>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {productosMasVendidos.map((producto, index) => (
                <div key={producto.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <div className="flex items-center">
                    <span className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-black">{producto.nombre}</p>
                      <p className="text-sm text-gray-500">{producto.categoria.nombre}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">${producto.precio.toLocaleString('es-CO')} COP</p>
                    <p className="text-sm text-gray-500">Stock: {producto.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
