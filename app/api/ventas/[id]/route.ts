import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    const { id } = await context.params;
    
    // Obtener la venta antes de eliminarla para devolver el stock
    const venta = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: true
      }
    });
    
    if (!venta) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }
    
    // Devolver el stock y eliminar la venta
    await prisma.$transaction(async (tx) => {
      // Devolver stock de cada producto
      for (const item of venta.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.cantidad
            }
          }
        });
      }
      
      // Eliminar la venta (los items se eliminan en cascada)
      await tx.sale.delete({
        where: { id }
      });
    });
    
    return NextResponse.json({ message: 'Venta eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    return NextResponse.json({ error: 'Error al eliminar venta' }, { status: 500 });
  }
}
