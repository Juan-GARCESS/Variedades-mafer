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

interface ProductoMasVendido {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: {
    id: string;
    nombre: string;
  };
  totalVendido: number;
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState<ProductoMasVendido[]>([]);
  const [ventasStats, setVentasStats] = useState({
    diario: { ingresos: 0, egresos: 0, balance: 0, cantidadVentas: 0 },
    mensual: { ingresos: 0, egresos: 0, balance: 0, cantidadVentas: 0 },
    anual: { ingresos: 0, egresos: 0, balance: 0, cantidadVentas: 0 }
  });
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
      fetchProductosMasVendidos();
      fetchVentasStats();
    }
  }, [user]);

  const fetchProducts = async () => {
    const response = await fetch('/api/productos');
    const data = await response.json();
    setProducts(data);
  };

  const fetchProductosMasVendidos = async () => {
    const response = await fetch('/api/dashboard/productos-mas-vendidos');
    const data = await response.json();
    setProductosMasVendidos(data);
  };

  const fetchVentasStats = async () => {
    const response = await fetch('/api/dashboard/ventas-stats');
    const data = await response.json();
    setVentasStats(data);
  };

  const fetchStats = async () => {
    try {
      const productsRes = await fetch('/api/productos');
      const products = await productsRes.json();
      
      const ventasRes = await fetch('/api/ventas', {
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      const ventas = ventasRes.ok ? await ventasRes.json() : [];
      
      const serviciosRes = await fetch('/api/servicios');
      const servicios = await serviciosRes.json();

      const today = new Date().toISOString().split('T')[0];
      const ventasArray = Array.isArray(ventas) ? ventas : [];
      const serviciosArray = Array.isArray(servicios) ? servicios : [];
      
      const ventasHoy = ventasArray.filter((v: any) => v.fecha === today);
      const serviciosHoy = serviciosArray.filter((s: any) => s.fecha === today);

      const ingresoVentas = ventasArray.reduce((sum: number, v: any) => sum + v.total, 0);
      const ingresoServicios = serviciosArray.reduce((sum: number, s: any) => sum + s.monto, 0);

      setStats({
        totalProductos: products.length,
        productosStockBajo: products.filter((p: Product) => p.stock <= p.stockMinimo).length,
        ventasHoy: ventasHoy.length + serviciosHoy.length,
        ingresosTotales: ingresoVentas + ingresoServicios
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Cargando...</div>;
  }

  const productosStockBajo = products.filter(p => p.stock <= p.stockMinimo);

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

        {/* Nueva sección: Resumen de Ventas */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-4 flex items-center">
            <TrendingUp className="mr-2" size={18} />
            <span>Resumen de Ventas</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Ventas Diarias */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">HOY</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-700">Ingresos:</span>
                  <span className="text-sm font-bold text-green-600">${ventasStats.diario.ingresos.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-blue-700">Egresos:</span>
                  <span className="text-sm font-bold text-red-600">${ventasStats.diario.egresos.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-300">
                  <span className="text-xs font-semibold text-blue-900">Balance:</span>
                  <span className={`text-sm font-bold ${ventasStats.diario.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${ventasStats.diario.balance.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="text-xs text-blue-600 mt-2">
                  {ventasStats.diario.cantidadVentas} transacciones
                </div>
              </div>
            </div>

            {/* Ventas Mensuales */}
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
              <h3 className="text-sm font-semibold text-purple-900 mb-3">ESTE MES</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-purple-700">Ingresos:</span>
                  <span className="text-sm font-bold text-green-600">${ventasStats.mensual.ingresos.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-purple-700">Egresos:</span>
                  <span className="text-sm font-bold text-red-600">${ventasStats.mensual.egresos.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-purple-300">
                  <span className="text-xs font-semibold text-purple-900">Balance:</span>
                  <span className={`text-sm font-bold ${ventasStats.mensual.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${ventasStats.mensual.balance.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="text-xs text-purple-600 mt-2">
                  {ventasStats.mensual.cantidadVentas} transacciones
                </div>
              </div>
            </div>

            {/* Ventas Anuales */}
            <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
              <h3 className="text-sm font-semibold text-amber-900 mb-3">ESTE AÑO</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-amber-700">Ingresos:</span>
                  <span className="text-sm font-bold text-green-600">${ventasStats.anual.ingresos.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-amber-700">Egresos:</span>
                  <span className="text-sm font-bold text-red-600">${ventasStats.anual.egresos.toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-amber-300">
                  <span className="text-xs font-semibold text-amber-900">Balance:</span>
                  <span className={`text-sm font-bold ${ventasStats.anual.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${ventasStats.anual.balance.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="text-xs text-amber-600 mt-2">
                  {ventasStats.anual.cantidadVentas} transacciones
                </div>
              </div>
            </div>
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
            
            {productosMasVendidos.length === 0 ? (
              <p className="text-gray-500">No hay ventas registradas aún</p>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
