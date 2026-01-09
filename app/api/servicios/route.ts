import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { fecha: 'desc' }
    });
    
    const formattedServices = services.map(service => ({
      ...service,
      fecha: service.fecha.toISOString().split('T')[0]
    }));
    
    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error al obtener servicios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newService = await prisma.service.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        precio: parseFloat(body.precio),
        fecha: body.fecha ? new Date(body.fecha) : new Date()
      }
    });
    
    return NextResponse.json({
      ...newService,
      fecha: newService.fecha.toISOString().split('T')[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Error al crear servicio' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID no proporcionado' }, { status: 400 });
    }
    
    await prisma.service.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Error al eliminar servicio' }, { status: 500 });
  }
}
