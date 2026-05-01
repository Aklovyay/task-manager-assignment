import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getSession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const { db } = await connectToDatabase();

    if (projectId) {
      // Getting tasks for a specific project
      const tasks = await db.collection('tasks').aggregate([
        { $match: { projectId: new ObjectId(projectId) } },
        {
          $lookup: {
            from: 'users',
            localField: 'assigneeId',
            foreignField: '_id',
            as: 'assignee'
          }
        },
        { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            description: 1,
            status: 1,
            dueDate: 1,
            createdBy: 1,
            assigneeId: 1,
            projectId: 1,
            'assignee._id': 1,
            'assignee.name': 1,
            'assignee.email': 1
          }
        }
      ]).toArray();

      // If member, only show tasks assigned to them
      if (session.role === 'MEMBER') {
        const filtered = tasks.filter((t: any) => {
          const assigneeId = t.assigneeId?.toString();
          return assigneeId === session.userId;
        });
        return NextResponse.json({ tasks: filtered });
      }

      return NextResponse.json({ tasks });
    }

    // No projectId — fetch all tasks for the current user
    // For Admin: fetch all tasks across projects they own
    // For Member: fetch only tasks assigned to them
    if (session.role === 'ADMIN') {
      // Get all projects created by admin
      const adminProjects = await db.collection('projects').find({ createdBy: session.userId }).toArray();
      const projectIds = adminProjects.map(p => p._id);
      
      const tasks = await db.collection('tasks').aggregate([
        { $match: { projectId: { $in: projectIds } } },
        {
          $lookup: {
            from: 'users',
            localField: 'assigneeId',
            foreignField: '_id',
            as: 'assignee'
          }
        },
        { $unwind: { path: '$assignee', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            description: 1,
            status: 1,
            dueDate: 1,
            createdBy: 1,
            'assignee.name': 1,
            'project.name': 1
          }
        }
      ]).toArray();

      return NextResponse.json({ tasks });
    } else {
      // Member: get tasks assigned to them + tasks they created for themselves
      const memberTasks = await db.collection('tasks').aggregate([
        {
          $match: {
            $or: [
              { assigneeId: new ObjectId(session.userId) },
              { createdBy: session.userId }
            ]
          }
        },
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            title: 1,
            description: 1,
            status: 1,
            dueDate: 1,
            createdBy: 1,
            'project.name': 1
          }
        }
      ]).toArray();

      return NextResponse.json({ tasks: memberTasks });
    }
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, dueDate, projectId, assigneeId } = await request.json();
    if (!title || !projectId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const { db } = await connectToDatabase();

    // If MEMBER is trying to assign to someone else, deny
    if (session.role === 'MEMBER' && assigneeId && assigneeId !== session.userId) {
      return NextResponse.json({ error: 'Members cannot assign tasks to others' }, { status: 403 });
    }

    const newTask = {
      title,
      description: description || '',
      status: 'TODO',
      dueDate: dueDate ? new Date(dueDate) : null,
      createdAt: new Date(),
      createdBy: session.userId,
      projectId: new ObjectId(projectId),
      // Admin can assign to anyone, Member can only self-assign
      assigneeId: session.role === 'ADMIN' && assigneeId
        ? new ObjectId(assigneeId)
        : new ObjectId(session.userId)
    };

    const result = await db.collection('tasks').insertOne(newTask);

    return NextResponse.json({ success: true, taskId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Tasks POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
