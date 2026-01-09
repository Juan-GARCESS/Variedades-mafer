import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(serviceTypes);
  } catch (error) {
    console.error('Error fetching service types:', error);
    return NextResponse.json({ error: 'Error al obtener tipos de servicios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { nombre } = await request.json();
    
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    
    const serviceType = await prisma.serviceType.create({
      data: { nombre: nombre.trim() }
    });
    
    return NextResponse.json(serviceType, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un tipo de servicio con ese nombre' }, { status: 400 });
    }
    console.error('Error creating service type:', error);
    return NextResponse.json({ error: 'Error al crear tipo de servicio' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { nombre } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }
    
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    
    const serviceType = await prisma.serviceType.update({
      where: { id },
      data: { nombre: nombre.trim() }
    });
    
    return NextResponse.json(serviceType);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un tipo de servicio con ese nombre' }, { status: 400 });
    }
    console.error('Error updating service type:', error);
    return NextResponse.json({ error: 'Error al actualizar tipo de servicio' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }
    
    // Verificar si hay servicios asociados
    const servicesCount = await prisma.service.count({
      where: { serviceTypeId: id }
    });
    
    if (servicesCount > 0) {
      return NextResponse.json({ 
        error: `No se puede eliminar. Hay ${servicesCount} servicio(s) usando este tipo` 
      }, { status: 400 });
    }
    
    await prisma.serviceType.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Tipo de servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting service type:', error);
    return NextResponse.json({ error: 'Error al eliminar tipo de servicio' }, { status: 500 });
  }
}
