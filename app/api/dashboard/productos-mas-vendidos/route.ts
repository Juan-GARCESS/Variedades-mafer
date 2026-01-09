import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Obtener todas las ventas con sus items
    const ventas = await prisma.venta.findMany({
      include: {
        items: {
          include: {
            producto: {
              include: {
                categoria: true
              }
            }
          }
        }
      }
    });

    // Agrupar productos por ID y sumar cantidades vendidas
    const productosVendidos: { [key: string]: { producto: any; totalVendido: number } } = {};

    ventas.forEach(venta => {
      venta.items.forEach(item => {
        const productoId = item.productoId;
        if (productosVendidos[productoId]) {
          productosVendidos[productoId].totalVendido += item.cantidad;
        } else {
          productosVendidos[productoId] = {
            producto: item.producto,
            totalVendido: item.cantidad
          };
        }
      });
    });

    // Convertir a array y ordenar por cantidad vendida
    const productosMasVendidos = Object.values(productosVendidos)
      .sort((a, b) => b.totalVendido - a.totalVendido)
      .slice(0, 4) // Top 4
      .map(item => ({
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.producto.precio,
        stock: item.producto.stock,
        categoria: item.producto.categoria,
        totalVendido: item.totalVendido
      }));

    return NextResponse.json(productosMasVendidos);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    return NextResponse.json([], { status: 500 });
  }
}
