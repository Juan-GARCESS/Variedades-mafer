import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Inicializando base de datos...');

  // Crear usuario administrador
  const adminExists = await prisma.user.findUnique({
    where: { email: 'Mafe@admin.com' }
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Luisfelipe17', 10);
    await prisma.user.create({
      data: {
        email: 'Mafe@admin.com',
        password: hashedPassword,
        name: 'Mafe',
        role: 'admin'
      }
    });
    console.log('✅ Usuario administrador creado: Mafe@admin.com');
  } else {
    console.log('ℹ️  Usuario administrador ya existe');
  }

  // Crear categorías por defecto
  const categoriesCount = await prisma.category.count();
  if (categoriesCount === 0) {
    await prisma.category.createMany({
      data: [
        { nombre: 'Cuadernos', descripcion: 'Cuadernos de todo tipo' },
        { nombre: 'Escritura', descripcion: 'Lápices, bolígrafos, marcadores' },
        { nombre: 'Papel', descripcion: 'Hojas, resmas, papel especial' },
        { nombre: 'Accesorios', descripcion: 'Tijeras, pegamento, clips' },
        { nombre: 'Electrónicos', descripcion: 'Calculadoras y dispositivos' }
      ]
    });
    console.log('✅ Categorías por defecto creadas');
  } else {
    console.log('ℹ️  Categorías ya existen');
  }

  console.log('✨ Base de datos inicializada correctamente');
}

main()
  .catch((e) => {
    console.error('❌ Error inicializando base de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
