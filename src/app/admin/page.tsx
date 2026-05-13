'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Layout from '@/components/Layout';
import styles from './page.module.css';
import {
  Shield, Users, Images, Trash2, Crown, User,
  Loader2, AlertCircle, BarChart3, Eye, RefreshCw,
  ChevronRight, Sparkles
} from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ExhibitionRow {
  id: string;
  title: string;
  gallery: string;
  userId: string;
  isPublic: boolean;
  likesCount: number;
  commentsCount: number;
  artworksCount: number;
  createdAt: string;
}

interface Stats {
  users: number;
  exhibitions: number;
  artworks: number;
}

type Tab = 'overview' | 'users' | 'exhibitions';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats>({ users: 0, exhibitions: 0, artworks: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [exhibitions, setExhibitions] = useState<ExhibitionRow[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const token = () => localStorage.getItem('token') || '';

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) { router.push('/auth/login'); return; }
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      if (payload.role !== 'admin') { router.push('/'); return; }
      setIsAdmin(true);
    } catch { router.push('/auth/login'); return; }

    // Load stats
    fetch(apiUrl('/stats'))
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'users') loadUsers();
    if (tab === 'exhibitions') loadExhibitions();
  }, [tab, isAdmin]);

  const loadUsers = async () => {
    setLoadingTab(true);
    try {
      const res = await fetch(apiUrl('/users/admin/all'), { headers: { Authorization: `Bearer ${token()}` } });
      const d = await res.json();
      if (d.success) setUsers(d.data.users);
    } catch { setError('Ошибка загрузки пользователей'); }
    finally { setLoadingTab(false); }
  };

  const loadExhibitions = async () => {
    setLoadingTab(true);
    try {
      const res = await fetch(apiUrl('/exhibitions?limit=50'));
      const d = await res.json();
      if (d.success) setExhibitions(d.data.exhibitions);
    } catch { setError('Ошибка загрузки выставок'); }
    finally { setLoadingTab(false); }
  };

  const changeRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(apiUrl(`/users/admin/${userId}/role`), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const d = await res.json();
      if (d.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
        flash('Роль обновлена');
      }
    } catch { setError('Ошибка обновления роли'); }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Удалить пользователя? Это действие нельзя отменить.')) return;
    try {
      const res = await fetch(apiUrl(`/users/admin/${userId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const d = await res.json();
      if (d.success) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        flash('Пользователь удалён');
      }
    } catch { setError('Ошибка удаления'); }
  };

  const deleteExhibition = async (exId: string) => {
    if (!confirm('Удалить выставку?')) return;
    try {
      const res = await fetch(apiUrl(`/exhibitions/${exId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      const d = await res.json();
      if (d.success) {
        setExhibitions(prev => prev.filter(e => e.id !== exId));
        flash('Выставка удалена');
      }
    } catch { setError('Ошибка удаления'); }
  };

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) {
    return (
      <Layout>
        <div className={styles.loadingPage}>
          <Loader2 size={40} className={styles.spin} />
          <p>Загрузка...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) return null;

  return (
    <Layout>
      <div className={styles.page}>
        <div className={styles.inner}>

          {/* Header */}
          <div className={styles.header}>
            <div className={styles.badge}>
              <Shield size={14} />
              Панель администратора
            </div>
            <h1 className={styles.title}>
              <span className={styles.gradient}>Управление</span> платформой
            </h1>
            <p className={styles.subtitle}>Полный контроль над контентом и пользователями</p>
          </div>

          {/* Alerts */}
          {success && <div className={styles.successAlert}><Sparkles size={16} />{success}</div>}
          {error && <div className={styles.errorAlert}><AlertCircle size={16} />{error}<button onClick={() => setError('')}>×</button></div>}

          {/* Stats cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Users size={28} /></div>
              <div className={styles.statNum}>{stats.users}</div>
              <div className={styles.statLabel}>Пользователей</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Images size={28} /></div>
              <div className={styles.statNum}>{stats.exhibitions}</div>
              <div className={styles.statLabel}>Выставок</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><BarChart3 size={28} /></div>
              <div className={styles.statNum}>{stats.artworks}</div>
              <div className={styles.statLabel}>Произведений</div>
            </div>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {(['overview', 'users', 'exhibitions'] as Tab[]).map(t => (
              <button
                key={t}
                className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'overview' && <BarChart3 size={16} />}
                {t === 'users' && <Users size={16} />}
                {t === 'exhibitions' && <Images size={16} />}
                {t === 'overview' ? 'Обзор' : t === 'users' ? 'Пользователи' : 'Выставки'}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {tab === 'overview' && (
            <div className={styles.overviewGrid}>
              <Link href="/admin/exhibitions" className={styles.actionCard}>
                <div className={styles.actionIcon}><Images size={32} /></div>
                <div>
                  <h3>Управление выставками</h3>
                  <p>Создавать, редактировать, удалять</p>
                </div>
                <ChevronRight size={20} className={styles.actionArrow} />
              </Link>
              <button className={styles.actionCard} onClick={() => setTab('users')}>
                <div className={styles.actionIcon}><Users size={32} /></div>
                <div>
                  <h3>Пользователи</h3>
                  <p>Управление ролями и аккаунтами</p>
                </div>
                <ChevronRight size={20} className={styles.actionArrow} />
              </button>
              <button className={styles.actionCard} onClick={() => setTab('exhibitions')}>
                <div className={styles.actionIcon}><Eye size={32} /></div>
                <div>
                  <h3>Все выставки</h3>
                  <p>Просмотр и модерация контента</p>
                </div>
                <ChevronRight size={20} className={styles.actionArrow} />
              </button>
            </div>
          )}

          {/* Users tab */}
          {tab === 'users' && (
            <div className={styles.tableSection}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}><Users size={20} />Пользователи ({users.length})</h2>
                <button className={styles.refreshBtn} onClick={loadUsers} disabled={loadingTab}>
                  <RefreshCw size={16} className={loadingTab ? styles.spin : ''} />
                </button>
              </div>
              {loadingTab ? (
                <div className={styles.tabLoading}><Loader2 size={32} className={styles.spin} /></div>
              ) : (
                <div className={styles.table}>
                  <div className={styles.tableHead}>
                    <span>Пользователь</span>
                    <span>Email</span>
                    <span>Роль</span>
                    <span>Дата</span>
                    <span>Действия</span>
                  </div>
                  {users.map(u => (
                    <div key={u.id} className={styles.tableRow}>
                      <span className={styles.userName}>
                        <div className={styles.userAvatar}>{u.name.charAt(0).toUpperCase()}</div>
                        {u.name}
                      </span>
                      <span className={styles.userEmail}>{u.email}</span>
                      <span>
                        <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
                          {u.role === 'admin' ? <Crown size={12} /> : <User size={12} />}
                          {u.role === 'admin' ? 'Админ' : 'Юзер'}
                        </span>
                      </span>
                      <span className={styles.dateCell}>
                        {new Date(u.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      <span className={styles.actions}>
                        <button
                          className={styles.roleToggleBtn}
                          onClick={() => changeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                          title={u.role === 'admin' ? 'Снять права' : 'Сделать админом'}
                        >
                          <Crown size={14} />
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteUser(u.id)}
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Exhibitions tab */}
          {tab === 'exhibitions' && (
            <div className={styles.tableSection}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}><Images size={20} />Выставки ({exhibitions.length})</h2>
                <button className={styles.refreshBtn} onClick={loadExhibitions} disabled={loadingTab}>
                  <RefreshCw size={16} className={loadingTab ? styles.spin : ''} />
                </button>
              </div>
              {loadingTab ? (
                <div className={styles.tabLoading}><Loader2 size={32} className={styles.spin} /></div>
              ) : (
                <div className={styles.table}>
                  <div className={styles.tableHead}>
                    <span>Название</span>
                    <span>Галерея</span>
                    <span>Статус</span>
                    <span>Лайки</span>
                    <span>Действия</span>
                  </div>
                  {exhibitions.map(ex => (
                    <div key={ex.id} className={styles.tableRow}>
                      <span className={styles.exTitle}>{ex.title}</span>
                      <span className={styles.exGallery}>{ex.gallery}</span>
                      <span>
                        <span className={`${styles.statusBadge} ${ex.isPublic ? styles.statusPublic : styles.statusPrivate}`}>
                          {ex.isPublic ? 'Публичная' : 'Приватная'}
                        </span>
                      </span>
                      <span className={styles.dateCell}>{ex.likesCount}</span>
                      <span className={styles.actions}>
                        <Link href={`/exhibitions/${ex.id}`} className={styles.viewBtn} title="Просмотр">
                          <Eye size={14} />
                        </Link>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteExhibition(ex.id)}
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}
