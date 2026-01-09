import bcrypt from 'bcryptjs';

export interface User {
  email: string;
  password: string;
  role: 'admin' | 'employee';
  name: string;
}

export interface Employee {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  permissions: {
    productos: boolean;
    ventas: boolean;
    historial: boolean;
    servicios: boolean;
  };
  active: boolean;
}

// Base de datos simulada
export const users: User[] = [
  {
    email: 'Mafe@admin.com',
    password: bcrypt.hashSync('Luisfelipe17', 10),
    role: 'admin',
    name: 'Administrador'
  }
];

export const employees: Employee[] = [
  {
    id: '1',
    email: 'Mafe@admin.com',
    name: 'Administrador',
    role: 'admin',
    permissions: {
      productos: true,
      ventas: true,
      historial: true,
      servicios: true
    },
    active: true
  }
];

export async function validateUser(email: string, password: string): Promise<User | null> {
  const user = users.find(u => u.email === email);
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

export function addEmployee(employee: Omit<Employee, 'id'>): Employee {
  const newEmployee: Employee = {
    ...employee,
    id: Date.now().toString()
  };
  employees.push(newEmployee);
  return newEmployee;
}

export function updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) return null;
  
  employees[index] = { ...employees[index], ...updates };
  return employees[index];
}

export function deleteEmployee(id: string): boolean {
  const index = employees.findIndex(e => e.id === id);
  if (index === -1) return false;
  
  employees.splice(index, 1);
  return true;
}

export function getEmployees(): Employee[] {
  return employees;
}
