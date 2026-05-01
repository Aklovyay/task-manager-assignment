import { getSession } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import styles from './AppLayout.module.css';
import { redirect } from 'next/navigation';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className={styles.appContainer}>
      <Sidebar user={session} />
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
