import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { db } = await connectToDatabase();

    if (session.role === 'ADMIN') {
      // Admin sees all projects they created
      const projects = await db.collection('projects').find({ createdBy: session.userId }).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ projects });
    } else {
      // Member sees only projects they are assigned to
      const memberships = await db.collection('project_members').find({ userId: session.userId }).toArray();
      const projectIds = memberships.map(m => m.projectId);
      
      if (projectIds.length === 0) {
        return NextResponse.json({ projects: [] });
      }

      const projects = await db.collection('projects').find({
        _id: { $in: projectIds.map((id: any) => typeof id === 'string' ? new ObjectId(id) : id) }
      }).sort({ createdAt: -1 }).toArray();

      return NextResponse.json({ projects });
    }
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only Admins can create projects
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only Admins can create projects' }, { status: 403 });
    }

    const { name, description, memberIds } = await request.json();
    if (!name) return NextResponse.json({ error: 'Project name is required' }, { status: 400 });

    const { db } = await connectToDatabase();
    
    const newProject = {
      name,
      description: description || '',
      createdBy: session.userId,
      createdAt: new Date(),
    };

    const result = await db.collection('projects').insertOne(newProject);
    
    // Add selected members to the project
    if (memberIds && memberIds.length > 0) {
      const memberDocs = memberIds.map((mId: string) => ({
        userId: mId,
        projectId: result.insertedId,
        joinedAt: new Date()
      }));
      await db.collection('project_members').insertMany(memberDocs);
    }

    return NextResponse.json({ success: true, projectId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
