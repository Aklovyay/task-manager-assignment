import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Animated background elements */}
      <div className={styles.bgOrbs}>
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>
        <div className={styles.orb3}></div>
      </div>

      {/* Giant background text */}
      <div className={styles.bgText}>TaskFlow</div>

      <main className={styles.main}>
        <div className={styles.badge}>✨ Team Task Manager</div>
        <h1 className={styles.title}>
          Task<span className={styles.highlight}>Flow</span>
        </h1>
        <p className={styles.description}>
          Streamline your team's workflow. Create projects, assign tasks, and track progress — all in one place.
        </p>

        <div className={styles.actions}>
          <Link href="/login" className={styles.primaryBtn}>
            Get Started
            <span className={styles.arrow}>→</span>
          </Link>
          <Link href="/signup" className={styles.secondaryBtn}>
            Create Account
          </Link>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📁</span>
            <span>Projects</span>
          </div>
          <div className={styles.featureDivider}></div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>✅</span>
            <span>Tasks</span>
          </div>
          <div className={styles.featureDivider}></div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>👥</span>
            <span>Teams</span>
          </div>
          <div className={styles.featureDivider}></div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📊</span>
            <span>Tracking</span>
          </div>
        </div>
      </main>
    </div>
  );
}
