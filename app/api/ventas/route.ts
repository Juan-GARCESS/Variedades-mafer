import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
    
    // Formatear para el frontend
    const formattedSales = sales.map(sale => ({
      id: sale.id,
      fecha: sale.fecha.toISOString().split('T')[0],
      total: sale.total,
      estado: sale.estado,
      productos: sale.items.map(item => ({
        productoId: item.productId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      }))
    }));
    
    return NextResponse.json(formattedSales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Error al obtener ventas' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productos, estado } = body;
    
    // Calcular el total
    let total = 0;
    const productosVenta = await Promise.all(
      productos.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productoId }
        });
        
        if (!product) {
          throw new Error(`Producto ${item.productoId} no encontrado`);
        }
        
        if (product.stock < item.cantidad) {
          throw new Error(`Stock insuficiente para ${product.nombre}`);
        }
        
        const precioUnitario = product.precio;
        total += precioUnitario * item.cantidad;
        
        return {
          productId: item.productoId,
          cantidad: item.cantidad,
          precioUnitario
        };
      })
    );
    
    // Crear la venta con transacción
    const nuevaVenta = await prisma.$transaction(async (tx) => {
      // Crear la venta
      const sale = await tx.sale.create({
        data: {
          total,
          estado: estado || 'completada',
          items: {
            create: productosVenta
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      
      // Actualizar stock de cada producto
      for (const item of productosVenta) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.cantidad
            }
          }
        });
      }
      
      return sale;
    });
    
    return NextResponse.json({
      id: nuevaVenta.id,
      fecha: nuevaVenta.fecha.toISOString().split('T')[0],
      total: nuevaVenta.total,
      estado: nuevaVenta.estado,
      productos: nuevaVenta.items.map(item => ({
        productoId: item.productId,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario
      }))
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sale:', error);
    return NextResponse.json({ error: error.message || 'Error al crear la venta' }, { status: 500 });
  }
}
