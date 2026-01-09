'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { DollarSign, Plus, Trash2, TrendingDown, Tag, Settings } from 'lucide-react';

interface Expense {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  categoria: string;
  expenseCategoryId: string;
}

interface ExpenseCategory {
  id: string;
  nombre: string;
}

export default function EgresosPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [newExpense, setNewExpense] = useState({
    descripcion: '',
    monto: '',
    expenseCategoryId: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchCategories();
    }
  }, [user]);

  const fetchExpenses = async () => {
    const response = await fetch('/api/egresos');
    const data = await response.json();
    setExpenses(data);
  };

  const fetchCategories = async () => {
    const response = await fetch('/api/expense-categories');
    const data = await response.json();
    setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/egresos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          monto: parseFloat(newExpense.monto)
        })
      });
      
      if (response.ok) {
        showToast('Gasto registrado exitosamente', 'success');
        setShowModal(false);
        setNewExpense({
          descripcion: '',
          monto: '',
          expenseCategoryId: '',
          fecha: new Date().toISOString().split('T')[0]
        });
        fetchExpenses();
      } else {
        const error = await response.json();
        showToast(error.error || 'Error al registrar gasto', 'error');
      }
    } catch (error) {
      showToast('Error al registrar el gasto', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const response = await fetch('/api/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newCategory })
      });

      if (response.ok) {
        showToast('Categoría agregada exitosamente', 'success');
        setNewCategory('');
        fetchCategories();
      } else {
        const error = await response.json();
        showToast(error.error || 'Error al agregar categoría', 'error');
      }
    } catch (error) {
      showToast('Error al agregar categoría', 'error');
    }
  };

  const handleDeleteCategory = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
      try {
        const response = await fetch(`/api/expense-categories?id=${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          showToast('Categoría eliminada exitosamente', 'success');
          fetchCategories();
        } else {
          const error = await response.json();
          showToast(error.error || 'Error al eliminar categoría', 'error');
        }
      } catch (error) {
        showToast('Error al eliminar categoría', 'error');
      }
    }
  };

  const handleDeleteExpense = async (id: string, descripcion: string) => {
    if (confirm(`¿Estás seguro de eliminar "${descripcion}"?`)) {
      try {
        await fetch(`/api/egresos?id=${id}`, { method: 'DELETE' });
        showToast('Gasto eliminado exitosamente', 'success');
        fetchExpenses();
      } catch (error) {
        showToast('Error al eliminar el gasto', 'error');
      }
    }
  };

  const getTotalGastos = () => {
    return expenses.reduce((sum, expense) => sum + expense.monto, 0);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = expenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(expenses.length / itemsPerPage);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Gestión de Egresos</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Registra los gastos externos del negocio</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <button
              onClick={() => setShowCategoriesModal(true)}
              className="flex items-center justify-center space-x-2 border-2 border-black text-black px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-black hover:text-white transition-colors"
            >
              <Settings size={20} />
              <span>Gestionar Categorías</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center space-x-2 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} />
              <span>Registrar Gasto</span>
            </button>
          </div>
        </div>

        {/* Tarjeta de resumen */}
        <div className="mb-4 sm:mb-6 bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Gastos Registrados</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600">
                ${getTotalGastos().toLocaleString('es-CO')} COP
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{expenses.length} gasto(s) registrado(s)</p>
            </div>
            <TrendingDown className="text-red-600" size={36} />
          </div>
        </div>

        {/* Información explicativa */}
        <div className="mb-4 sm:mb-6 bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
          <div className="flex">
            <div className="shrink-0">
              <DollarSign className="text-blue-500" size={20} />
            </div>
            <div className="ml-2 sm:ml-3">
              <h3 className="text-xs sm:text-sm font-medium text-blue-800">¿Qué registrar en egresos?</h3>
              <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-blue-700">
                <p>Registra aquí cualquier gasto externo realizado con el dinero del negocio:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Compra de suministros o inventario</li>
                  <li>Pagos de servicios (luz, agua, internet)</li>
                  <li>Gastos de transporte</li>
                  <li>Pago a proveedores</li>
                  <li>Cualquier otro gasto del negocio</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de gastos */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-black">Gastos Registrados</h2>
          </div>

          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {expense.fecha}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {expense.categoria}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    {expense.descripcion}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-red-600">
                    -${expense.monto.toLocaleString('es-CO')}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <button 
                      onClick={() => handleDeleteExpense(expense.id, expense.descripcion)}
                      className="text-white bg-black hover:bg-gray-800 inline-flex items-center px-2 sm:px-3 py-1 rounded"
                    >
                      <Trash2 size={14} className="sm:mr-1" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {expenses.length === 0 && (
            <div className="text-center py-12">
              <TrendingDown size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay gastos registrados aún</p>
              <p className="text-gray-400 text-sm mt-2">
                Comienza registrando los gastos externos del negocio
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, expenses.length)} de {expenses.length} items
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

      {/* Modal para registrar gasto */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-full sm:max-w-md w-full border-4 border-black shadow-2xl">
            <h2 className="text-2xl font-bold text-black mb-6">
              Registrar Nuevo Gasto
            </h2>
            <p className="text-gray-600 mb-6">
              Ingresa la información del gasto realizado
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newExpense.fecha}
                  onChange={(e) => setNewExpense({ ...newExpense, fecha: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={newExpense.expenseCategoryId}
                  onChange={(e) => setNewExpense({ ...newExpense, expenseCategoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newExpense.descripcion}
                  onChange={(e) => setNewExpense({ ...newExpense, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  rows={3}
                  placeholder="Ej: Pago de factura de luz del mes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto (COP)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newExpense.monto}
                  onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewExpense({
                      descripcion: '',
                      monto: '',
                      expenseCategoryId: '',
                      fecha: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Registrar Gasto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para gestionar categorías */}
      {showCategoriesModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-full sm:max-w-2xl w-full border-4 border-black shadow-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-black mb-6 flex items-center">
              <Tag className="mr-2" />
              Gestionar Categorías de Egresos
            </h2>
            
            {/* Formulario para agregar categoría */}
            <form onSubmit={handleAddCategory} className="mb-6">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nueva categoría (ej: Servicios públicos)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus size={18} />
                  <span>Agregar</span>
                </button>
              </div>
            </form>

            {/* Lista de categorías */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700 mb-3">Categorías Existentes:</h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay categorías creadas. Agrega la primera.</p>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <span className="font-medium text-black flex items-center">
                        <Tag size={16} className="mr-2 text-gray-600" />
                        {category.nombre}
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.nombre)}
                        className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
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
