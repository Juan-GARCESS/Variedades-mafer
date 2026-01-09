import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener ventas
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    // Obtener servicios
    const services = await prisma.service.findMany({
      include: {
        serviceType: true
      }
    });
    
    // Obtener egresos
    const expenses = await prisma.expense.findMany({
      include: {
        expenseCategory: true
      }
    });
    
    // Formatear historial
    const history = [
      ...sales.map(sale => ({
        id: sale.id,
        tipo: 'venta' as const,
        fecha: sale.fecha.toISOString().split('T')[0],
        descripcion: `Venta de ${sale.items.length} producto(s)`,
        monto: sale.total
      })),
      ...services.map(service => ({
        id: service.id,
        tipo: 'servicio' as const,
        fecha: service.fecha.toISOString().split('T')[0],
        descripcion: service.descripcion,
        monto: service.monto
      })),
      ...expenses.map(expense => ({
        id: expense.id,
        tipo: 'egreso' as const,
        fecha: expense.fecha.toISOString().split('T')[0],
        descripcion: expense.descripcion,
        monto: -expense.monto // Negativo para egresos
      }))
    ];
    
    // Ordenar por fecha descendente
    history.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    // Devolver array vacío en caso de error
    return NextResponse.json([]);
  }
}
