'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, Loader2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          JSON.parse(atob(parts[1])); // validate
          router.replace('/');
        }
      } catch { localStorage.removeItem('token'); }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Ошибка входа');
      }

      localStorage.setItem('token', data.data.token);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
        <div className={styles.circle3}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.leftSection}>
          <Link href="/" className={styles.logo}>
            <Sparkles size={40} />
            <span>Aesthetica</span>
          </Link>
          <h1 className={styles.title}>
            Добро пожаловать <span className={styles.gradient}>обратно</span>
          </h1>
          <p className={styles.subtitle}>
            Войдите чтобы продолжить исследовать мир искусства
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>✨</div>
              <div>
                <h3>Тысячи выставок</h3>
                <p>Доступ к коллекциям со всего мира</p>
              </div>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>🎨</div>
              <div>
                <h3>Персональные рекомендации</h3>
                <p>Находите искусство по вашему вкусу</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <LogIn size={32} className={styles.formIcon} />
              <h2>Вход в аккаунт</h2>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email">
                  <Mail size={18} />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">
                  <Lock size={18} />
                  <span>Пароль</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className={styles.spinner} size={20} />
                    <span>Вход...</span>
                  </>
                ) : (
                  <>
                    <span>Войти</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span>или</span>
            </div>

            <Link href="/auth/register" className={styles.registerLink}>
              Нет аккаунта? <span>Зарегистрироваться</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
