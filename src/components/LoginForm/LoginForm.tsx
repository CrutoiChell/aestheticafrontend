'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/store/api/authApi';
import type { LoginCredentials } from '@/lib/types';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Неверный формат email';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Пароль обязателен';
    } else if (formData.password.length < 8) {
      errors.password = 'Пароль должен быть не менее 8 символов';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await login(formData).unwrap();
      
      // Store token in localStorage
      localStorage.setItem('token', result.token);
      
      // Redirect to home page on success
      router.push('/');
    } catch (err) {
      // Error is handled by RTK Query and displayed via error state
      console.error('Login failed:', err);
    }
  };

  const handleChange = (field: keyof LoginCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Extract error message from RTK Query error
  const getErrorMessage = (): string | null => {
    if (!error) return null;
    
    if ('status' in error) {
      // FetchBaseQueryError
      if (error.status === 401) {
        return 'Неверный email или пароль';
      }
      if (typeof error.data === 'object' && error.data && 'error' in error.data) {
        const errorData = error.data as { error: { message: string } };
        return errorData.error.message;
      }
      return 'Произошла ошибка при входе';
    }
    
    // SerializedError
    return error.message || 'Произошла ошибка при входе';
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Вход</h2>
      
      {/* Display API error */}
      {error && (
        <div className={styles.errorMessage} role="alert">
          {getErrorMessage()}
        </div>
      )}
      
      {/* Email field */}
      <div className={styles.fieldGroup}>
        <label htmlFor="email" className={styles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
          disabled={isLoading}
          aria-invalid={!!validationErrors.email}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
        />
        {validationErrors.email && (
          <span id="email-error" className={styles.fieldError} role="alert">
            {validationErrors.email}
          </span>
        )}
      </div>
      
      {/* Password field */}
      <div className={styles.fieldGroup}>
        <label htmlFor="password" className={styles.label}>
          Пароль
        </label>
        <input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
          disabled={isLoading}
          aria-invalid={!!validationErrors.password}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
        />
        {validationErrors.password && (
          <span id="password-error" className={styles.fieldError} role="alert">
            {validationErrors.password}
          </span>
        )}
      </div>
      
      {/* Submit button */}
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isLoading}
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </button>
    </form>
  );
}
