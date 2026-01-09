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
