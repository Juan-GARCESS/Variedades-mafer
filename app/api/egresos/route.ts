import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        expenseCategory: true
      },
      orderBy: { fecha: 'desc' }
    });
    
    // Formatear fechas para el frontend
    const formattedExpenses = expenses.map((expense) => ({
      id: expense.id,
      fecha: expense.fecha.toISOString().split('T')[0],
      descripcion: expense.descripcion,
      monto: expense.monto,
      categoria: expense.expenseCategory.nombre,
      expenseCategoryId: expense.expenseCategoryId
    }));
    
    return NextResponse.json(formattedExpenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Error al obtener gastos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newExpense = await prisma.expense.create({
      data: {
        fecha: new Date(body.fecha),
        descripcion: body.descripcion,
        monto: parseFloat(body.monto),
        expenseCategoryId: body.expenseCategoryId
      },
      include: {
        expenseCategory: true
      }
    });
    
    return NextResponse.json({
      id: newExpense.id,
      fecha: newExpense.fecha.toISOString().split('T')[0],
      descripcion: newExpense.descripcion,
      monto: newExpense.monto,
      categoria: newExpense.expenseCategory.nombre,
      expenseCategoryId: newExpense.expenseCategoryId
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Error al crear el gasto' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }
    
    await prisma.expense.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Gasto eliminado exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Error al eliminar el gasto' }, { status: 500 });
  }
}
