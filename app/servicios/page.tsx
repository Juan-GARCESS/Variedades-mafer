'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Briefcase, Plus, Trash2, DollarSign } from 'lucide-react';

interface AdditionalService {
  id: string;
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: 'servicio' | 'venta-externa';
}

export default function ServiciosPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [newService, setNewService] = useState({
    descripcion: '',
    monto: '',
    tipo: 'servicio' as 'servicio' | 'venta-externa',
    fecha: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchServices();
    }
  }, [user]);

  const fetchServices = async () => {
    const response = await fetch('/api/servicios');
    const data = await response.json();
    setServices(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/servicios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newService,
          monto: parseFloat(newService.monto)
        })
      });
      
      if (response.ok) {
        showToast('Servicio registrado exitosamente', 'success');
        setShowModal(false);
        setNewService({
          descripcion: '',
          monto: '',
          tipo: 'servicio',
          fecha: new Date().toISOString().split('T')[0]
        });
        fetchServices();
      }
    } catch (error) {
      showToast('Error al registrar el servicio', 'error');
    }
  };

  const handleDeleteService = async (id: string, descripcion: string) => {
    if (confirm(`¿Estás seguro de eliminar "${descripcion}"?`)) {
      try {
        await fetch(`/api/servicios?id=${id}`, { method: 'DELETE' });
        showToast('Servicio eliminado exitosamente', 'success');
        fetchServices();
      } catch (error) {
        showToast('Error al eliminar el servicio', 'error');
      }
    }
  };

  const getTotalServicios = () => {
    return services.reduce((sum, service) => sum + service.monto, 0);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = services.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(services.length / itemsPerPage);

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
            <h1 className="text-2xl sm:text-3xl font-bold text-black">Servicios Adicionales</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Registra ventas y servicios no relacionados con el inventario de productos
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center space-x-2 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors w-full md:w-auto"
          >
            <Plus size={20} />
            <span>Nuevo Servicio</span>
          </button>
        </div>

        {/* Información descriptiva */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">¿Qué son los Servicios Adicionales?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
            <div>
              <p className="mb-2"><strong className="text-black">Ejemplos de servicios:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Fotocopias</li>
                <li>Impresiones</li>
                <li>Arreglo de hojas de vida</li>
                <li>Empaste de documentos</li>
                <li>Escaneo de documentos</li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong className="text-black">Ejemplos de ventas externas:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Venta de productos no registrados</li>
                <li>Servicios de mensajería</li>
                <li>Recarga de celular</li>
                <li>Otros servicios ocasionales</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tarjeta de resumen */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Ingresos por Servicios</h3>
              <p className="text-2xl sm:text-3xl font-bold text-black">${getTotalServicios().toLocaleString('es-CO')} COP</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{services.length} servicio(s) registrado(s)</p>
            </div>
            <DollarSign className="text-black" size={36} />
          </div>
        </div>

        {/* Lista de servicios */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-black">Servicios Registrados</h2>
          </div>

          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
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
              {currentItems.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    {service.fecha}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      service.tipo === 'servicio'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {service.tipo === 'servicio' ? 'Servicio' : 'Venta Externa'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    {service.descripcion}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-green-600">
                    ${service.monto.toLocaleString('es-CO')}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <button 
                      onClick={() => handleDeleteService(service.id, service.descripcion)}
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

          {services.length === 0 && (
            <div className="text-center py-12">
              <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay servicios registrados aún</p>
              <p className="text-gray-400 text-sm mt-2">
                Comienza registrando fotocopias, impresiones u otros servicios
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, services.length)} de {services.length} items
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

      {/* Modal para agregar servicio */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-full sm:max-w-md w-full border-4 border-black shadow-2xl">
            <h2 className="text-2xl font-bold text-black mb-6">
              Registrar Nuevo Servicio
            </h2>
            <p className="text-gray-600 mb-6">
              Ingresa la información del servicio o venta externa
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={newService.tipo}
                  onChange={(e) => setNewService({ ...newService, tipo: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="servicio">Servicio</option>
                  <option value="venta-externa">Venta Externa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={newService.descripcion}
                  onChange={(e) => setNewService({ ...newService, descripcion: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="Ej: Fotocopias (50 páginas)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Cobrado
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={newService.monto}
                    onChange={(e) => setNewService({ ...newService, monto: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={newService.fecha}
                  onChange={(e) => setNewService({ ...newService, fecha: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  required
                />
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
