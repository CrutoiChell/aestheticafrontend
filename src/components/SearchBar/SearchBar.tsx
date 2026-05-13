'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = 'Поиск выставок...', 
  debounceMs = 500 
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState('');

  const onSearchRef = useRef(onSearch);
  useEffect(() => { onSearchRef.current = onSearch; });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchRef.current(searchValue);
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchValue, debounceMs]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchValue('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <svg 
          className={styles.searchIcon} 
          width="20" 
          height="20" 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path 
            d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={searchValue}
          onChange={handleChange}
          aria-label="Поиск выставок"
        />
        {searchValue && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Очистить поиск"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 4L4 12M4 4l8 8" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
