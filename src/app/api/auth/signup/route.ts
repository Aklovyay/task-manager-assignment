import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { setSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Default role is MEMBER unless ADMIN is specified
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';

    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: userRole,
      createdAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);

    // Create session payload
    const sessionPayload = {
      userId: result.insertedId.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({ success: true, message: 'User created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
