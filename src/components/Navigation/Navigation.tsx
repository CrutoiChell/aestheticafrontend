'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Palette, Shield, LogOut, LogIn, UserPlus, Menu, X, Plus } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/mediaUrl';
import { apiUrl } from '@/lib/api';
import styles from './Navigation.module.css';

export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) { localStorage.removeItem('token'); return; }
      const payload = JSON.parse(atob(parts[1]));
      setIsAuthenticated(true);
      setUserRole(payload.role);
      setUserId(payload.userId || '');
      setUserName(payload.name || payload.email?.split('@')[0] || 'Пользователь');
    } catch {
      localStorage.removeItem('token');
    }
  }, []);

  // Fetch avatar from profile
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(apiUrl('/users/profile'), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUserName(d.data.user.name || userName);
          setAvatarUrl(d.data.user.avatarUrl || null);
        }
      })
      .catch((err) => {
        console.error('[Navigation] profile fetch failed:', err);
      });
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    setIsMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className={styles.nav}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo} onClick={closeMobileMenu}>
          <Palette size={28} />
          <span className={styles.logoText}>Эстетика</span>
        </Link>

        <button
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className={`${styles.menu} ${isMobileMenuOpen ? styles.menuOpen : ''}`}>
          <Link href="/exhibitions" className={styles.navLink} onClick={closeMobileMenu}>
            <Palette size={16} />
            <span>Выставки</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link href="/create-exhibition" className={styles.createButton} onClick={closeMobileMenu}>
                <Plus size={16} />
                <span>Создать</span>
              </Link>

              {userRole === 'admin' && (
                <Link href="/admin" className={styles.navLink} onClick={closeMobileMenu}>
                  <Shield size={16} />
                  <span>Админ</span>
                </Link>
              )}

              {/* Avatar + name → profile link */}
              <Link href="/profile" className={styles.userChip} onClick={closeMobileMenu}>
                <div className={styles.chipAvatar}>
                  {avatarUrl ? (
                    <img src={resolveMediaUrl(avatarUrl)} alt={userName} className={styles.chipAvatarImg} />
                  ) : (
                    <span className={styles.chipInitial}>
                      {userName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className={styles.chipName}>{userName}</span>
              </Link>

              <button onClick={handleLogout} className={styles.logoutButton}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className={styles.navLink} onClick={closeMobileMenu}>
                <LogIn size={16} />
                <span>Войти</span>
              </Link>
              <Link href="/auth/register" className={styles.registerButton} onClick={closeMobileMenu}>
                <UserPlus size={16} />
                <span>Регистрация</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className={styles.overlay} onClick={closeMobileMenu} />
      )}
    </nav>
  );
}
