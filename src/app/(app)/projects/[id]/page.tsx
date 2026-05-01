"use client";

import { useState, useEffect, use } from 'react';
import styles from './ProjectDetails.module.css';

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For new tasks
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const fetchData = async () => {
    try {
      const [userRes, tasksRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/tasks?projectId=${projectId}`),
      ]);
      const userData = await userRes.json();
      const tasksData = await tasksRes.json();
      setUser(userData);
      setTasks(tasksData.tasks || []);

      // Admin can assign tasks to members
      if (userData.role === 'ADMIN') {
        const membersRes = await fetch('/api/members');
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body: any = { title, description, projectId };
      if (dueDate) body.dueDate = dueDate;
      if (user?.role === 'ADMIN' && assigneeId) body.assigneeId = assigneeId;

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setDueDate('');
        setAssigneeId('');
        setShowCreate(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      fetchData();
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const isAdmin = user?.role === 'ADMIN';
  const columns = ['TODO', 'IN_PROGRESS', 'DONE'];
  const columnLabels: Record<string, string> = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };

  // Progress for admin
  const totalTasks = tasks.length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;
  const progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Project Board</h1>
          <p className={styles.subtitle}>
            {isAdmin ? 'Manage tasks and assign to team members' : 'Your assigned tasks for this project'}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {/* Admin Progress Tracker */}
      {isAdmin && totalTasks > 0 && (
        <div className={`card glass ${styles.progressCard}`}>
          <div className={styles.progressInfo}>
            <span>Project Progress</span>
            <strong>{progressPercent}% Complete</strong>
          </div>
          <div className={styles.progressBarBg}>
            <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
          </div>
          <div className={styles.progressStats}>
            <span className={styles.statTodo}>{tasks.filter(t => t.status === 'TODO').length} To Do</span>
            <span className={styles.statProgress}>{tasks.filter(t => t.status === 'IN_PROGRESS').length} In Progress</span>
            <span className={styles.statDone}>{doneCount} Done</span>
          </div>
        </div>
      )}

      {showCreate && (
        <form className={`card glass ${styles.createForm}`} onSubmit={handleCreateTask}>
          <h3>{isAdmin ? 'Create & Assign Task' : 'Create Personal Task'}</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Task title" 
                required 
              />
            </div>
            {isAdmin && (
              <div className={styles.formGroup}>
                <label>Assign To</label>
                <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                  <option value="">-- Select Member --</option>
                  {members.map((m: any) => (
                    <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Task description (optional)" 
              rows={2} 
            />
          </div>
          <div className={styles.formGroup}>
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">
            {isAdmin ? 'Create & Assign' : 'Create Task'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading board...</p>
      ) : tasks.length === 0 ? (
        <div className={styles.emptyBoard}>
          {isAdmin ? 'No tasks yet. Create tasks and assign them to team members!' : 'No tasks assigned to you in this project yet.'}
        </div>
      ) : (
        <div className={styles.board}>
          {columns.map(col => (
            <div key={col} className={styles.column}>
              <h2 className={styles.colTitle}>
                <span className={`${styles.colDot} ${styles[`dot_${col.toLowerCase()}`]}`}></span>
                {columnLabels[col]}
                <span className={styles.colCount}>
                  {tasks.filter(t => t.status === col).length}
                </span>
              </h2>
              
              <div className={styles.taskList}>
                {tasks.filter(t => t.status === col).map(task => (
                  <div key={task._id} className={`card ${styles.taskCard}`}>
                    <h3>{task.title}</h3>
                    {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                    
                    {/* Show assignee for admin */}
                    {isAdmin && task.assignee?.name && (
                      <div className={styles.assigneeBadge}>
                        👤 {task.assignee.name}
                      </div>
                    )}

                    {task.dueDate && (
                      <div className={styles.taskDate}>
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className={styles.taskActions}>
                      <select 
                        value={task.status} 
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className={styles.statusSelect}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>

                      {isAdmin && (
                        <button 
                          className={styles.deleteBtn} 
                          onClick={() => handleDelete(task._id)}
                          title="Delete task"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
