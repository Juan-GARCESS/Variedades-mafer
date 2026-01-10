import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Obtener todas las ventas y servicios
    const ventas = await prisma.sale.findMany({
      select: {
        fecha: true,
        total: true
      }
    });

    const servicios = await prisma.service.findMany({
      select: {
        fecha: true,
        monto: true
      }
    });

    const egresos = await prisma.expense.findMany({
      select: {
        fecha: true,
        monto: true
      }
    });

    // Ventas diarias (hoy)
    const ventasHoy = ventas.filter(v => v.fecha.toISOString().split('T')[0] === todayStr);
    const serviciosHoy = servicios.filter(s => s.fecha.toISOString().split('T')[0] === todayStr);
    const egresosHoy = egresos.filter(e => e.fecha.toISOString().split('T')[0] === todayStr);

    const ingresosHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0) + serviciosHoy.reduce((sum, s) => sum + s.monto, 0);
    const egresosHoyTotal = egresosHoy.reduce((sum, e) => sum + e.monto, 0);

    // Ventas mensuales (este mes)
    const ventasMes = ventas.filter(v => {
      const fecha = new Date(v.fecha);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });
    const serviciosMes = servicios.filter(s => {
      const fecha = new Date(s.fecha);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });
    const egresosMes = egresos.filter(e => {
      const fecha = new Date(e.fecha);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    const ingresosMes = ventasMes.reduce((sum, v) => sum + v.total, 0) + serviciosMes.reduce((sum, s) => sum + s.monto, 0);
    const egresosMesTotal = egresosMes.reduce((sum, e) => sum + e.monto, 0);

    // Ventas anuales (este año)
    const ventasAnio = ventas.filter(v => {
      const fecha = new Date(v.fecha);
      return fecha.getFullYear() === currentYear;
    });
    const serviciosAnio = servicios.filter(s => {
      const fecha = new Date(s.fecha);
      return fecha.getFullYear() === currentYear;
    });
    const egresosAnio = egresos.filter(e => {
      const fecha = new Date(e.fecha);
      return fecha.getFullYear() === currentYear;
    });

    const ingresosAnio = ventasAnio.reduce((sum, v) => sum + v.total, 0) + serviciosAnio.reduce((sum, s) => sum + s.monto, 0);
    const egresosAnioTotal = egresosAnio.reduce((sum, e) => sum + e.monto, 0);

    return NextResponse.json({
      diario: {
        ingresos: ingresosHoy,
        egresos: egresosHoyTotal,
        balance: ingresosHoy - egresosHoyTotal,
        cantidadVentas: ventasHoy.length + serviciosHoy.length
      },
      mensual: {
        ingresos: ingresosMes,
        egresos: egresosMesTotal,
        balance: ingresosMes - egresosMesTotal,
        cantidadVentas: ventasMes.length + serviciosMes.length
      },
      anual: {
        ingresos: ingresosAnio,
        egresos: egresosAnioTotal,
        balance: ingresosAnio - egresosAnioTotal,
        cantidadVentas: ventasAnio.length + serviciosAnio.length
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error);
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 });
  }
}
