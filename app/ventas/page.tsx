'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ShoppingCart, Plus, Calendar, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Sale {
  id: string;
  fecha: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  productos: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  total: number;
  estado: 'completada' | 'pendiente';
}

interface Product {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
}

export default function VentasPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<{productoId: string, cantidad: number}[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 15;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchSales();
      fetchProducts();
    }
  }, [user]);

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/ventas', {
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      if (!response.ok) {
        setSales([]);
        return;
      }
      const data = await response.json();
      setSales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setSales([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/productos');
      if (!response.ok) {
        setProducts([]);
        return;
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, { productoId: '', cantidad: 1 }]);
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index));
  };

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir doble submit
    if (isSubmitting) {
      return;
    }
    
    if (selectedProducts.length === 0) {
      showToast('Agrega al menos un producto a la venta', 'info');
      return;
    }
    
    // Validar que todos los productos tengan cantidad mayor a 0
    const hasInvalidQuantity = selectedProducts.some(p => p.cantidad <= 0);
    if (hasInvalidQuantity) {
      showToast('Todas las cantidades deben ser mayores a 0', 'error');
      return;
    }
    
    // Validar que todos los productos estén seleccionados
    const hasEmptyProduct = selectedProducts.some(p => !p.productoId);
    if (hasEmptyProduct) {
      showToast('Selecciona todos los productos', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || ''
        },
        body: JSON.stringify({
          productos: selectedProducts,
          estado: 'completada'
        }),
      });
      
      if (response.ok) {
        showToast('Venta registrada exitosamente', 'success');
        setShowModal(false);
        setSelectedProducts([]);
        fetchSales();
        fetchProducts(); // Actualizar stock mostrado
      } else {
        const errorData = await response.json();
        showToast(errorData.error || 'Error al registrar la venta', 'error');
      }
    } catch (error) {
      console.error('Error al registrar venta:', error);
      showToast('Error al registrar la venta', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const handleDeleteSale = async (saleId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta venta? El stock se devolverá automáticamente.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/ventas/${saleId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user?.email || ''
        }
      });
      
      if (response.ok) {
        showToast('Venta eliminada exitosamente', 'success');
        fetchSales();
      } else {
        const data = await response.json();
        showToast(data.error || 'Error al eliminar la venta', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      showToast('Error al eliminar la venta', 'error');
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sales.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sales.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || !user) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Gestión de Ventas</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Registra y administra las ventas de productos</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-2 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors w-full md:w-auto"
          >
            <Plus size={20} />
            <span>Nueva Venta</span>
          </button>
        </div>

        {/* Lista de ventas */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-black">Ventas Registradas</h2>
          </div>

          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                {user?.role === 'admin' && (
                  <th className="hidden xl:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendedor
                  </th>
                )}
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-black">
                    {sale.id}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {sale.fecha}
                  </td>
                  {user?.role === 'admin' && (
                    <td className="hidden xl:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-medium">{sale.user?.name || 'Sin asignar'}</span>
                        <span className="text-xs text-gray-500">{sale.user?.email || '-'}</span>
                      </div>
                    </td>
                  )}
                  <td className="hidden md:table-cell px-6 py-4 text-sm text-gray-900">
                    <div className="space-y-1">
                      {sale.productos.slice(0, 2).map((item, idx) => {
                        const product = products.find(p => p.id === item.productoId);
                        return (
                          <div key={idx} className="text-xs">
                            {product?.nombre || 'Producto'} x{item.cantidad}
                          </div>
                        );
                      })}
                      {sale.productos.length > 2 && (
                        <div className="text-xs text-gray-500">+{sale.productos.length - 2} más...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-black">
                    ${sale.total.toLocaleString('es-CO')}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      sale.estado === 'completada'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {sale.estado === 'completada' ? 'Completada' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(sale)}
                        className="text-black hover:text-gray-600 px-2 sm:px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 text-xs sm:text-sm"
                      >
                        Ver
                      </button>
                      {user?.role === 'admin' && (
                        <button 
                          onClick={() => handleDeleteSale(sale.id)}
                          className="text-red-600 hover:text-red-800 px-2 sm:px-3 py-1 border border-red-300 rounded hover:bg-red-50 text-xs sm:text-sm"
                        >
                          <Trash2 size={14} className="inline" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {sales.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay ventas registradas aún</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, sales.length)} de {sales.length} items
              </div>
              <div className="flex flex-wrap justify-center space-x-1 sm:space-x-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black">
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => handlePageChange(page)} className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${currentPage === page ? 'bg-black text-white' : 'border border-gray-300 text-black hover:bg-gray-50'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para nueva venta */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-full sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-black">
            <h2 className="text-2xl font-bold text-black mb-6">
              Registrar Nueva Venta
            </h2>
            
            <form onSubmit={handleSubmitSale} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-black">Productos</h3>
                  <button
                    type="button"
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
                  >
                    + Agregar Producto
                  </button>
                </div>

                {selectedProducts.map((item, index) => (
                  <div key={index} className="flex space-x-3 mb-3">
                    <select
                      value={item.productoId}
                      onChange={(e) => {
                        const newProducts = [...selectedProducts];
                        newProducts[index].productoId = e.target.value;
                        setSelectedProducts(newProducts);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.nombre} - ${product.precio} (Stock: {product.stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad === 0 ? '' : item.cantidad}
                      onChange={(e) => {
                        const newProducts = [...selectedProducts];
                        const value = e.target.value;
                        newProducts[index].cantidad = value === '' ? 0 : parseInt(value);
                        setSelectedProducts(newProducts);
                      }}
                      onFocus={(e) => e.target.select()}
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                      placeholder="Cant."
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {selectedProducts.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No hay productos agregados. Haz clic en "Agregar Producto"
                  </p>
                )}
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedProducts([]);
                    setIsSubmitting(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={selectedProducts.length === 0 || isSubmitting}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de detalles de venta */}
      {showDetailsModal && selectedSale && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-full sm:max-w-2xl w-full border-4 border-black shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-black mb-6">
              Detalles de la Venta #{selectedSale.id}
            </h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="text-lg font-semibold text-black">{selectedSale.fecha}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedSale.estado === 'completada' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedSale.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-black mb-3">Productos</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {selectedSale.productos.map((item, index) => {
                  const product = products.find(p => p.id === item.productoId);
                  const subtotal = item.cantidad * item.precioUnitario;
                  return (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-black">{product?.nombre || 'Producto'}</p>
                        <p className="text-sm text-gray-600">
                          ${item.precioUnitario.toLocaleString('es-CO')} COP x {item.cantidad} unidad(es)
                        </p>
                      </div>
                      <p className="font-semibold text-black">
                        ${subtotal.toLocaleString('es-CO')} COP
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t-2 border-gray-300 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-black">Total</p>
                <p className="text-2xl font-bold text-black">
                  ${selectedSale.total.toLocaleString('es-CO')} COP
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSale(null);
                }}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
