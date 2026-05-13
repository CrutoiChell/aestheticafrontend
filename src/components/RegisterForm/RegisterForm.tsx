'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/store/api/authApi';
import type { RegisterData } from '@/lib/types';
import styles from './RegisterForm.module.css';

export default function RegisterForm() {
  const router = useRouter();
  const [register, { isLoading, error }] = useRegisterMutation();
  
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
  });
  
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  const validateForm = (): boolean => {
    const errors: { name?: string; email?: string; password?: string } = {};
    
    // Name validation
    if (!formData.name) {
      errors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      errors.name = 'Имя должно быть не менее 2 символов';
    }
    
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
      const result = await register(formData).unwrap();
      
      // Store token in localStorage
      localStorage.setItem('token', result.token);
      
      // Redirect to home page on success
      router.push('/');
      router.refresh();
    } catch (err) {
      // Error is handled by RTK Query and displayed via error state
      console.error('Registration failed:', err);
    }
  };

  const handleChange = (field: keyof RegisterData, value: string) => {
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
      if (error.status === 400) {
        if (typeof error.data === 'object' && error.data && 'error' in error.data) {
          const errorData = error.data as { error: { message: string } };
          return errorData.error.message;
        }
        return 'Неверные данные регистрации';
      }
      if (typeof error.data === 'object' && error.data && 'error' in error.data) {
        const errorData = error.data as { error: { message: string } };
        return errorData.error.message;
      }
      return 'Произошла ошибка при регистрации';
    }
    
    // SerializedError
    return error.message || 'Произошла ошибка при регистрации';
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Регистрация</h2>
      
      {/* Display API error */}
      {error && (
        <div className={styles.errorMessage} role="alert">
          {getErrorMessage()}
        </div>
      )}
      
      {/* Name field */}
      <div className={styles.fieldGroup}>
        <label htmlFor="name" className={styles.label}>
          Имя
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          className={`${styles.input} ${validationErrors.name ? styles.inputError : ''}`}
          disabled={isLoading}
          aria-invalid={!!validationErrors.name}
          aria-describedby={validationErrors.name ? 'name-error' : undefined}
        />
        {validationErrors.name && (
          <span id="name-error" className={styles.fieldError} role="alert">
            {validationErrors.name}
          </span>
        )}
      </div>
      
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
        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </button>
    </form>
  );
}
