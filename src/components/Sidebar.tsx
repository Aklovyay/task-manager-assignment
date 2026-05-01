"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

export default function Sidebar({ user }: { user: any }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.logo}>Task<span className={styles.logoHighlight}>Flow</span></h2>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/dashboard" className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}>
          <span className={styles.icon}>📊</span>
          Dashboard
        </Link>
        <Link href="/projects" className={`${styles.link} ${pathname?.startsWith('/projects') ? styles.active : ''}`}>
          <span className={styles.icon}>📁</span>
          Projects
        </Link>
      </nav>

      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div className={styles.userName}>{user?.name}</div>
            <div className={`${styles.userRole} ${isAdmin ? styles.adminRole : styles.memberRole}`}>
              {isAdmin ? '🛡️ Admin' : '👤 Member'}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </aside>
  );
}
