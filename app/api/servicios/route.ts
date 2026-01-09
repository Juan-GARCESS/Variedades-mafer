import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        serviceType: true
      },
      orderBy: { fecha: 'desc' }
    });
    
    const formattedServices = services.map(service => ({
      id: service.id,
      fecha: service.fecha.toISOString().split('T')[0],
      descripcion: service.descripcion,
      monto: service.monto,
      serviceTypeId: service.serviceTypeId,
      serviceType: service.serviceType
    }));
    
    return NextResponse.json(formattedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    // Devolver array vacío en caso de error
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.serviceTypeId) {
      return NextResponse.json({ error: 'El tipo de servicio es requerido' }, { status: 400 });
    }
    
    const newService = await prisma.service.create({
      data: {
        descripcion: body.descripcion,
        monto: parseFloat(body.monto),
        serviceTypeId: body.serviceTypeId,
        fecha: body.fecha ? new Date(body.fecha) : new Date()
      },
      include: {
        serviceType: true
      }
    });
    
    return NextResponse.json({
      id: newService.id,
      fecha: newService.fecha.toISOString().split('T')[0],
      descripcion: newService.descripcion,
      monto: newService.monto,
      serviceTypeId: newService.serviceTypeId,
      serviceType: newService.serviceType
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
