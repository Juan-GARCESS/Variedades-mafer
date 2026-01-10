import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener ventas CON información del usuario
    const sales = await prisma.sale.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
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
      ...sales.map(sale => {
        const dateTime = new Date(sale.fecha);
        const vendedor = sale.user ? sale.user.name : 'Sin asignar';
        return {
          id: sale.id,
          tipo: 'venta-producto' as const,
          fecha: dateTime.toISOString().split('T')[0],
          hora: dateTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true }),
          descripcion: `Venta de ${sale.items.length} producto(s) - ${vendedor}`,
          monto: sale.total,
          signo: '+' as const,
          vendedor: vendedor
        };
      }),
      ...services.map(service => {
        const dateTime = new Date(service.fecha);
        return {
          id: service.id,
          tipo: 'servicio-adicional' as const,
          fecha: dateTime.toISOString().split('T')[0],
          hora: dateTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          descripcion: service.descripcion,
          monto: service.monto,
          signo: '+' as const,
          serviceTypeName: service.serviceType?.nombre || 'Sin categoría'
        };
      }),
      ...expenses.map(expense => {
        const dateTime = new Date(expense.fecha);
        return {
          id: expense.id,
          tipo: 'ingreso-producto' as const,
          fecha: dateTime.toISOString().split('T')[0],
          hora: dateTime.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          descripcion: expense.descripcion,
          monto: expense.monto,
          signo: '-' as const
        };
      })
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
