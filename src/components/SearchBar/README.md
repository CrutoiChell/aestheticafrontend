# SearchBar Component

Компонент поиска с дебаунсингом для фильтрации выставок.

## Описание

SearchBar - это компонент поиска, который позволяет пользователям искать выставки по текстовому запросу. Компонент включает дебаунсинг для оптимизации производительности и предотвращения избыточных запросов к API.

## Особенности

- **Дебаунсинг**: Автоматическая задержка перед вызовом функции поиска (по умолчанию 500мс)
- **Кнопка очистки**: Появляется при вводе текста для быстрой очистки поля
- **Иконка поиска**: Визуальный индикатор функции поиска
- **Адаптивный дизайн**: Оптимизирован для мобильных и десктопных устройств
- **Доступность**: Полная поддержка ARIA-атрибутов и клавиатурной навигации

## Использование

```tsx
import SearchBar from '@/components/SearchBar';

function ExhibitionsPage() {
  const handleSearch = (query: string) => {
    // Обработка поискового запроса
    console.log('Поиск:', query);
  };

  return (
    <SearchBar 
      onSearch={handleSearch}
      placeholder="Найти выставку..."
      debounceMs={500}
    />
  );
}
```

## Props

| Prop | Тип | По умолчанию | Описание |
|------|-----|--------------|----------|
| `onSearch` | `(query: string) => void` | **обязательный** | Функция обратного вызова, вызываемая при изменении поискового запроса |
| `placeholder` | `string` | `'Поиск выставок...'` | Текст-заполнитель для поля ввода |
| `debounceMs` | `number` | `500` | Задержка дебаунсинга в миллисекундах |

## Интеграция с RTK Query

Компонент разработан для работы с RTK Query. Пример интеграции:

```tsx
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import { useGetExhibitionsQuery } from '@/store/api/exhibitionsApi';

function ExhibitionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data, isLoading, error } = useGetExhibitionsQuery({
    search: searchQuery,
  });

  return (
    <div>
      <SearchBar onSearch={setSearchQuery} />
      {/* Отображение результатов */}
    </div>
  );
}
```

## Стилизация

Компонент использует CSS Modules для изоляции стилей. Основные классы:

- `.searchBar` - контейнер компонента
- `.searchInputWrapper` - обертка для поля ввода и иконок
- `.searchInput` - поле ввода
- `.searchIcon` - иконка поиска
- `.clearButton` - кнопка очистки

## Доступность

- Поле ввода имеет `aria-label="Поиск выставок"`
- Кнопка очистки имеет `aria-label="Очистить поиск"`
- Иконка поиска помечена как `aria-hidden="true"`
- Полная поддержка клавиатурной навигации

## Тестирование

Компонент покрыт unit-тестами, включая:

- Рендеринг с различными props
- Обновление значения при вводе
- Дебаунсинг поисковых запросов
- Функциональность кнопки очистки
- Доступность

Запуск тестов:

```bash
npm test -- SearchBar.test.tsx
```

## Требования

Валидирует требование **4.1**: "WHEN a user enters a search query, THE Frontend SHALL send the query to the API and display matching results"
