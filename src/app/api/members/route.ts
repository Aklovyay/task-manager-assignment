import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET all members (for admin to assign tasks)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only Admins can view members' }, { status: 403 });
    }

    const { db } = await connectToDatabase();
    const members = await db.collection('users').find(
      { role: 'MEMBER' },
      { projection: { password: 0 } }
    ).toArray();

    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
