'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { History, Filter, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface HistoryEntry {
  id: string;
  fecha: string;
  hora: string;
  tipo: 'ingreso-producto' | 'venta-producto' | 'servicio-adicional';
  descripcion: string;
  monto: number;
  signo: '+' | '-';
}

export default function HistorialPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [filteredData, setFilteredData] = useState<HistoryEntry[]>([]);
  const [filterType, setFilterType] = useState<'todos' | 'ingresos' | 'egresos'>('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [historyData, filterType, startDate, endDate]);

  const fetchHistory = async () => {
    const response = await fetch('/api/historial');
    const data = await response.json();
    setHistoryData(data);
  };

  const applyFilters = () => {
    let filtered = [...historyData];

    // Filtrar por tipo
    if (filterType === 'ingresos') {
      filtered = filtered.filter(entry => entry.signo === '+');
    } else if (filterType === 'egresos') {
      filtered = filtered.filter(entry => entry.signo === '-');
    }

    // Filtrar por fechas
    if (startDate) {
      filtered = filtered.filter(entry => entry.fecha >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(entry => entry.fecha <= endDate);
    }

    setFilteredData(filtered);
  };

  const getTotalIngresos = () => {
    return filteredData
      .filter(entry => entry.signo === '+')
      .reduce((sum, entry) => sum + entry.monto, 0);
  };

  const getTotalEgresos = () => {
    return filteredData
      .filter(entry => entry.signo === '-')
      .reduce((sum, entry) => sum + entry.monto, 0);
  };

  const getBalance = () => {
    return getTotalIngresos() - getTotalEgresos();
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'venta-producto':
        return 'Venta de Producto';
      case 'ingreso-producto':
        return 'Ingreso de Producto';
      case 'servicio-adicional':
        return 'Servicio Adicional';
      default:
        return tipo;
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Historial General</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Registro completo de todas las transacciones</p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Ingresos</h3>
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">
              ${getTotalIngresos().toLocaleString('es-CO')} COP
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Total Egresos</h3>
              <TrendingDown className="text-red-600" size={20} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              ${getTotalEgresos().toLocaleString('es-CO')} COP
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Balance</h3>
              <History className="text-black" size={20} />
            </div>
            <p className={`text-2xl sm:text-3xl font-bold ${getBalance() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${getBalance().toLocaleString('es-CO')} COP
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
            <Filter size={18} className="text-gray-600" />
            <h2 className="text-base sm:text-lg font-semibold text-black">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Tipo de Transacción
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              >
                <option value="todos">Todos</option>
                <option value="ingresos">Solo Ingresos</option>
                <option value="egresos">Solo Egresos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              />
            </div>
          </div>
        </div>

        {/* Tabla de historial */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Signo
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    <div className="font-medium">{entry.fecha}</div>
                    <div className="text-gray-500 text-xs">{entry.hora}</div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {getTipoLabel(entry.tipo)}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                    {entry.descripcion}
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                    <span className={`text-xl sm:text-2xl font-bold ${
                      entry.signo === '+' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {entry.signo}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                    <span className={entry.signo === '+' ? 'text-green-600' : 'text-red-600'}>
                      ${entry.monto.toLocaleString('es-CO')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <History size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No hay registros para mostrar</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredData.length)} de {filteredData.length} items
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
    </div>
  );
}
