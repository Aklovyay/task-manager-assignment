import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const taskId = resolvedParams.id;
    const body = await request.json();
    const { status, assigneeId } = body;

    const { db } = await connectToDatabase();
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Build update object based on role
    const updateFields: any = {};

    if (status) {
      if (!['TODO', 'IN_PROGRESS', 'DONE'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      
      // Members can only update status of tasks assigned to them
      if (session.role === 'MEMBER') {
        const taskAssignee = task.assigneeId?.toString();
        if (taskAssignee !== session.userId) {
          return NextResponse.json({ error: 'You can only update your own tasks' }, { status: 403 });
        }
      }
      
      updateFields.status = status;
    }

    // Only admin can reassign tasks
    if (assigneeId !== undefined) {
      if (session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only Admins can reassign tasks' }, { status: 403 });
      }
      updateFields.assigneeId = assigneeId ? new ObjectId(assigneeId) : null;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    await db.collection('tasks').updateOne(
      { _id: new ObjectId(taskId) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Task PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only admin can delete tasks
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only Admins can delete tasks' }, { status: 403 });
    }

    const resolvedParams = await params;
    const taskId = resolvedParams.id;

    const { db } = await connectToDatabase();
    await db.collection('tasks').deleteOne({ _id: new ObjectId(taskId) });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
