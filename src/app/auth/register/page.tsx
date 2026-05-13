'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { apiUrl } from '@/lib/api';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          JSON.parse(atob(parts[1]));
          router.replace('/');
        }
      } catch { localStorage.removeItem('token'); }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password.length < 8) {
      setError('Пароль должен быть минимум 8 символов');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(apiUrl('/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Ошибка регистрации');
      }

      localStorage.setItem('token', data.data.token);
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
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
            Начните свое <span className={styles.gradient}>путешествие</span>
          </h1>
          <p className={styles.subtitle}>
            Присоединяйтесь к сообществу любителей искусства
          </p>
          <div className={styles.benefits}>
            <div className={styles.benefit}>
              <CheckCircle size={24} />
              <span>Бесплатный доступ ко всем выставкам</span>
            </div>
            <div className={styles.benefit}>
              <CheckCircle size={24} />
              <span>Персональные рекомендации</span>
            </div>
            <div className={styles.benefit}>
              <CheckCircle size={24} />
              <span>Сохранение избранного</span>
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.formCard}>
            <div className={styles.formHeader}>
              <UserPlus size={32} className={styles.formIcon} />
              <h2>Создать аккаунт</h2>
              <p>Заполните форму для регистрации</p>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">
                  <User size={18} />
                  <span>Имя</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ваше имя"
                  required
                />
              </div>

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
                  placeholder="Минимум 8 символов"
                  required
                  minLength={8}
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className={styles.spinner} size={20} />
                    <span>Регистрация...</span>
                  </>
                ) : (
                  <>
                    <span>Зарегистрироваться</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className={styles.divider}>
              <span>или</span>
            </div>

            <Link href="/auth/login" className={styles.loginLink}>
              Уже есть аккаунт? <span>Войти</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
