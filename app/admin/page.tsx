'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { User, Plus, Edit, Trash2, Shield } from 'lucide-react';

interface Employee {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  createdAt?: string;
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const [newEmployee, setNewEmployee] = useState({
    email: '',
    name: '',
    password: '',
    role: 'employee' as 'admin' | 'employee'
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    const response = await fetch('/api/admin/usuarios');
    const data = await response.json();
    setEmployees(data);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setNewEmployee({
      email: '',
      name: '',
      password: '',
      role: 'employee'
    });
    setShowModal(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      email: employee.email,
      name: employee.name,
      password: '',
      role: employee.role
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEmployee) {
        const response = await fetch('/api/admin/usuarios', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingEmployee.id,
            ...newEmployee
          })
        });
        
        if (response.ok) {
          showToast('Usuario actualizado exitosamente', 'success');
        } else {
          const data = await response.json();
          showToast(data.error || 'Error al actualizar usuario', 'error');
          return;
        }
      } else {
        const response = await fetch('/api/admin/usuarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEmployee)
        });
        
        if (response.ok) {
          showToast('Usuario creado exitosamente', 'success');
        } else {
          const data = await response.json();
          showToast(data.error || 'Error al crear usuario', 'error');
          return;
        }
      }
      
      fetchEmployees();
      setShowModal(false);
      setNewEmployee({
        email: '',
        name: '',
        password: '',
        role: 'employee'
      });
      setEditingEmployee(null);
    } catch (error) {
      showToast('Error al guardar el usuario', 'error');
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar a "${name}"?`)) {
      try {
        const response = await fetch(`/api/admin/usuarios?id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          showToast('Usuario eliminado exitosamente', 'success');
          fetchEmployees();
        } else {
          const data = await response.json();
          showToast(data.error || 'Error al eliminar usuario', 'error');
        }
      } catch (error) {
        showToast('Error al eliminar el usuario', 'error');
      }
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = employees.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading || !user || user.role !== 'admin') {
    return <div className="min-h-screen bg-white flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black flex items-center">
              <Shield className="mr-2 sm:mr-3" size={28} />
              Panel de Administración
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Gestiona usuarios y permisos del sistema</p>
          </div>
          <button
            onClick={handleAddEmployee}
            className="flex items-center justify-center space-x-2 bg-black text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-800 transition-colors w-full md:w-auto"
          >
            <Plus size={20} />
            <span>Agregar Usuario</span>
          </button>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Usuarios</h3>
            <p className="text-2xl sm:text-3xl font-bold text-black">{employees.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Empleados</h3>
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">
              {employees.filter(e => e.role === 'employee').length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Administradores</h3>
            <p className="text-2xl sm:text-3xl font-bold text-black">
              {employees.filter(e => e.role === 'admin').length}
            </p>
          </div>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-black">Usuarios del Sistema</h2>
          </div>

          <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Registro
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-black text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold mr-2 sm:mr-3">
                        {employee.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-black">{employee.name}</div>
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.email}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.role === 'admin'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {employee.role === 'admin' ? 'Admin' : 'Empleado'}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('es-CO') : 'N/A'}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handleEditEmployee(employee)}
                      className="text-black hover:text-gray-600 inline-flex items-center p-1 sm:p-0"
                    >
                      <Edit size={16} />
                    </button>
                    {employee.email !== 'Mafe@admin.com' && (
                      <button 
                        onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                        className="text-black hover:text-gray-600 inline-flex items-center p-1 sm:p-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, employees.length)} de {employees.length} items
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

        {/* Leyenda de permisos */}
        <div className="mt-4 sm:mt-6 bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold text-black mb-2 sm:mb-3">Leyenda de Permisos:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs mr-2">P</span>
              <span className="text-gray-700">Productos</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs mr-2">V</span>
              <span className="text-gray-700">Ventas</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs mr-2">H</span>
              <span className="text-gray-700">Historial</span>
            </div>
            <div className="flex items-center">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs mr-2">S</span>
              <span className="text-gray-700">Servicios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-full sm:max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-black">
            <h2 className="text-2xl font-bold text-black mb-6">
              {editingEmployee ? 'Editar Usuario' : 'Agregar Nuevo Usuario'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="email@ejemplo.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {editingEmployee && '(dejar en blanco para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="••••••••"
                  required={!editingEmployee}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol
                </label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                >
                  <option value="employee">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  {newEmployee.role === 'admin' 
                    ? 'Los administradores tienen acceso completo al sistema' 
                    : 'Los empleados pueden acceder a todas las funciones excepto gestión de usuarios'}
                </p>
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
