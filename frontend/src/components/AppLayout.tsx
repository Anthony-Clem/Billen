import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../services/auth.service';
import { useAuth } from '../hooks/useAuth';
import styles from './AppLayout.module.css';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logo}>B</div>
          <span className={styles.brandName}>Billen</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/clients"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Clients
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            Invoices
          </NavLink>
        </nav>

        <div className={styles.bottom}>
          <div className={styles.userRow}>
            <span className={styles.userName}>{user?.name ?? '—'}</span>
            <button
              className={styles.logoutBtn}
              onClick={() => void handleLogout()}
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
