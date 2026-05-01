"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './Projects.module.css';

export default function ProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // For Admin creation
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [createError, setCreateError] = useState('');

  const fetchData = async () => {
    try {
      const [userRes, projectsRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/projects'),
      ]);
      const userData = await userRes.json();
      const projectsData = await projectsRes.json();
      setUser(userData);
      setProjects(projectsData.projects);

      // If Admin, also fetch members for the create form
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
  }, []);

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, memberIds: selectedMembers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setName('');
      setDescription('');
      setSelectedMembers([]);
      setShowCreate(false);
      fetchData();
    } catch (err: any) {
      setCreateError(err.message);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>
            {isAdmin ? 'Manage your team projects' : 'Projects assigned to you'}
          </p>
        </div>
        {/* Only Admin sees the Create Project button */}
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ New Project'}
          </button>
        )}
      </div>

      {showCreate && isAdmin && (
        <form className={`card glass ${styles.createForm}`} onSubmit={handleCreate}>
          <h2>Create New Project</h2>
          {createError && <div className={styles.error}>{createError}</div>}
          <div className={styles.formGroup}>
            <label>Project Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Marketing Website" />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the project..." />
          </div>
          
          {/* Member assignment */}
          <div className={styles.formGroup}>
            <label>Assign Team Members</label>
            {members.length === 0 ? (
              <p className={styles.noMembers}>No members have signed up yet. Members will appear here once they register.</p>
            ) : (
              <div className={styles.memberList}>
                {members.map((member: any) => (
                  <label key={member._id} className={`${styles.memberItem} ${selectedMembers.includes(member._id) ? styles.memberSelected : ''}`}>
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member._id)}
                      onChange={() => toggleMember(member._id)}
                    />
                    <div>
                      <div className={styles.memberName}>{member.name}</div>
                      <div className={styles.memberEmail}>{member.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          <button type="submit" className="btn-primary">Create Project</button>
        </form>
      )}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className={styles.emptyState}>
          {isAdmin ? 'No projects yet. Create your first project to get started!' : 'You have not been assigned to any projects yet.'}
        </div>
      ) : (
        <div className={styles.projectGrid}>
          {projects.map((project: any) => (
            <Link href={`/projects/${project._id}`} key={project._id} className={`card ${styles.projectCard}`}>
              <h3>{project.name}</h3>
              <p>{project.description || 'No description provided.'}</p>
              <div className={styles.cardFooter}>
                <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                <span className={styles.viewBtn}>View →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
