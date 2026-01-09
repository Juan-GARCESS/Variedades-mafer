import { NextResponse } from 'next/server';
import { validateUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await validateUser(email, password);

    if (user) {
      return NextResponse.json({
        email: user.email,
        role: user.role,
        name: user.name
      });
    }

    return NextResponse.json(
      { error: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
