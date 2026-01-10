import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        categoria: true
      },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = await prisma.product.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        precio: parseFloat(body.precio),
        stock: parseInt(body.stock),
        stockMinimo: parseInt(body.stockMinimo || '5'),
        categoriaId: body.categoriaId
      },
      include: {
        categoria: true
      }
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        nombre: updates.nombre,
        descripcion: updates.descripcion,
        precio: parseFloat(updates.precio),
        stock: parseInt(updates.stock),
        stockMinimo: parseInt(updates.stockMinimo || '5'),
        categoriaId: updates.categoriaId
      },
      include: {
        categoria: true
      }
    });
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    await prisma.product.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 });
  }
}
