import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    return NextResponse.json({ error: 'Error al obtener categorías de egresos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCategory = await prisma.expenseCategory.create({
      data: {
        nombre: body.nombre
      }
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense category:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Esta categoría ya existe' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Verificar si hay egresos con esta categoría
    const expensesCount = await prisma.expense.count({
      where: { expenseCategoryId: id }
    });

    if (expensesCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${expensesCount} egreso(s) usando esta categoría` },
        { status: 400 }
      );
    }
    
    await prisma.expenseCategory.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense category:', error);
    return NextResponse.json({ error: 'Error al eliminar categoría' }, { status: 500 });
  }
}
