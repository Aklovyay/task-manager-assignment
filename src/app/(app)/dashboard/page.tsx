"use client";

import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, tasksRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/tasks')
        ]);
        const userData = await userRes.json();
        const tasksData = await tasksRes.json();
        setUser(userData);
        setTasks(tasksData.tasks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.container}><p>Loading dashboard...</p></div>;

  const isAdmin = user?.role === 'ADMIN';
  const todoCount = tasks.filter(t => t.status === 'TODO').length;
  const progressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneCount = tasks.filter(t => t.status === 'DONE').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>
        Welcome back, {user?.name}!
        <span className={`${styles.roleBadge} ${isAdmin ? styles.adminBadge : styles.memberBadge}`}>
          {user?.role}
        </span>
      </p>

      {/* --- ADMIN DASHBOARD --- */}
      {isAdmin && (
        <>
          {/* Progress Tracking Stats */}
          <div className={styles.statsGrid}>
            <div className={`card glass ${styles.statCard}`}>
              <div className={styles.statLabel}>Total Tasks (Your Projects)</div>
              <div className={styles.statValue}>{totalTasks}</div>
            </div>
            <div className={`card glass ${styles.statCard}`}>
              <div className={styles.statLabel}>To Do</div>
              <div className={`${styles.statValue} ${styles.warningText}`}>{todoCount}</div>
            </div>
            <div className={`card glass ${styles.statCard}`}>
              <div className={styles.statLabel}>In Progress</div>
              <div className={`${styles.statValue} ${styles.accentText}`}>{progressCount}</div>
            </div>
            <div className={`card glass ${styles.statCard}`}>
              <div className={styles.statLabel}>Completed</div>
              <div className={`${styles.statValue} ${styles.successText}`}>{doneCount}</div>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className={`card glass ${styles.progressCard}`}>
            <div className={styles.progressHeader}>
              <h2>Overall Progress</h2>
              <span className={styles.progressPercent}>{progressPercent}%</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
            </div>
            <div className={styles.progressLegend}>
              <span><span className={styles.dotWarning}></span> To Do: {todoCount}</span>
              <span><span className={styles.dotAccent}></span> In Progress: {progressCount}</span>
              <span><span className={styles.dotSuccess}></span> Done: {doneCount}</span>
            </div>
          </div>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitleDanger}>⚠ Overdue Tasks ({overdueTasks.length})</h2>
              <div className={styles.taskList}>
                {overdueTasks.map(task => (
                  <div key={task._id} className={`card ${styles.taskCard} ${styles.overdueCard}`}>
                    <div className={styles.taskHeader}>
                      <h3>{task.title}</h3>
                      <span className={`${styles.badge} ${styles.overdueBadge}`}>OVERDUE</span>
                    </div>
                    <p className={styles.taskMeta}>
                      {task.assignee?.name && <span>Assigned to: <strong>{task.assignee.name}</strong></span>}
                      {task.project?.name && <span> • Project: {task.project.name}</span>}
                    </p>
                    <div className={styles.taskDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All tasks across admin's projects */}
          <div className={styles.section}>
            <h2>All Tasks Across Your Projects</h2>
            {tasks.length === 0 ? (
              <p className={styles.emptyState}>No tasks yet. Go to a project to create and assign tasks.</p>
            ) : (
              <div className={styles.taskList}>
                {tasks.map(task => (
                  <div key={task._id} className={`card ${styles.taskCard}`}>
                    <div className={styles.taskHeader}>
                      <h3>{task.title}</h3>
                      <span className={`${styles.badge} ${styles[task.status.toLowerCase()]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className={styles.taskMeta}>
                      {task.assignee?.name && <span>Assigned to: <strong>{task.assignee.name}</strong></span>}
                      {task.project?.name && <span> • Project: {task.project.name}</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* --- MEMBER DASHBOARD --- */}
      {!isAdmin && (
        <>
          <div className={styles.statsGrid}>
            <div className={`card glass ${styles.statCard}`}>
              <div className={styles.statLabel}>My Tasks</div>
              <div className={styles.statValue}>{totalTasks}</div>
            </div>
            <div className={`card glass ${styles.statCard}`}>
              <div className={styles.statLabel}>To Do</div>
              <div className={`${styles.statValue} ${styles.warningText}`}>{todoCount}</div>
            </div>
            <div className={`card glass ${styles.statCard}`}>
              <div className={styles.statLabel}>In Progress</div>
              <div className={`${styles.statValue} ${styles.accentText}`}>{progressCount}</div>
            </div>
            <div className={`card glass ${styles.statCard}`}>
              <div className={styles.statLabel}>Done</div>
              <div className={`${styles.statValue} ${styles.successText}`}>{doneCount}</div>
            </div>
          </div>

          {/* Tasks assigned by admin */}
          <div className={styles.section}>
            <h2>Tasks Assigned To Me</h2>
            {tasks.length === 0 ? (
              <p className={styles.emptyState}>No tasks assigned to you yet.</p>
            ) : (
              <div className={styles.taskList}>
                {tasks.map(task => (
                  <div key={task._id} className={`card ${styles.taskCard}`}>
                    <div className={styles.taskHeader}>
                      <h3>{task.title}</h3>
                      <span className={`${styles.badge} ${styles[task.status.toLowerCase()]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                    {task.project?.name && <p className={styles.taskMeta}>Project: {task.project.name}</p>}
                    {task.dueDate && (
                      <div className={styles.taskDate}>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
