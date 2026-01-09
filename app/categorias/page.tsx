'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Tag, Plus, Edit, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  nombre: string;
  descripcion?: string;
}

export default function CategoriasPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    const response = await fetch('/api/categorias');
    const data = await response.json();
    setCategories(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const response = await fetch('/api/categorias', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: editingCategory.id,
            nombre: categoryName,
            descripcion: categoryDesc
          })
        });
        
        if (response.ok) {
          showToast('Categoría actualizada exitosamente', 'success');
        }
      } else {
        const response = await fetch('/api/categorias', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            nombre: categoryName,
            descripcion: categoryDesc
          })
        });
        
        if (response.ok) {
          showToast('Categoría creada exitosamente', 'success');
        }
      }
      
      setShowModal(false);
      setCategoryName('');
      setCategoryDesc('');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      showToast('Error al guardar la categoría', 'error');
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar la categoría "${nombre}"?`)) {
      try {
        const response = await fetch(`/api/categorias?id=${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (response.ok) {
          showToast('Categoría eliminada exitosamente', 'success');
          fetchCategories();
        } else {
          showToast(data.error || 'Error al eliminar la categoría', 'error');
        }
      } catch (error) {
        showToast('Error al eliminar la categoría', 'error');
      }
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Gestión de Categorías</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Administra las categorías de productos</p>
          </div>
          <button
            onClick={() => {
              setEditingCategory(null);
              setCategoryName('');
              setShowModal(true);
            }}
            className="flex items-center justify-center space-x-2 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors w-full md:w-auto"
          >
            <Plus size={20} />
            <span>Nueva Categoría</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {currentItems.map((category) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="bg-black text-white rounded-full p-2">
                    <Tag size={16} className="sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-black">{category.nombre}</h3>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setCategoryName(category.nombre);
                    setCategoryDesc(category.descripcion || '');
                    setShowModal(true);
                  }}
                  className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  <Edit size={14} className="sm:w-4 sm:h-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.nombre)}
                  className="flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
                >
                  <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <Tag size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No hay categorías registradas</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg shadow-sm space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, categories.length)} de {categories.length} items
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
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-black">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-full sm:max-w-md w-full border-4 border-black shadow-2xl">
            <h2 className="text-2xl font-bold text-black mb-6">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="Ej: Cuadernos, Escritura, etc."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setCategoryName('');
                    setCategoryDesc('');
                    setEditingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
