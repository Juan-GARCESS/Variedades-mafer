import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

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

export async function validateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return null;
    }

    return {
      email: user.email,
      role: user.role as 'admin' | 'employee',
      name: user.name,
      password: user.password
    };
  } catch (error) {
    console.error('Error validating user:', error);
    return null;
  }
}

export async function createUser(email: string, password: string, name: string, role: 'admin' | 'employee' = 'employee') {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
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
