import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Obtener userId de los headers
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
    // Si es empleado, solo ver sus ventas. Si es admin, ver todas
    const whereClause = user.role === 'admin' ? {} : { userId: user.id };
    
    const sales = await prisma.sale.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
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
      user: sale.user ? {
        id: sale.user.id,
        name: sale.user.name,
        email: sale.user.email,
        role: sale.user.role
      } : null,
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
    // Obtener userId de los headers
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }
    
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
          userId: user.id,
          items: {
            create: productosVenta
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
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
      user: nuevaVenta.user ? {
        id: nuevaVenta.user.id,
        name: nuevaVenta.user.name,
        email: nuevaVenta.user.email,
        role: nuevaVenta.user.role
      } : null,
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
