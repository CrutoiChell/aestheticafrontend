import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders search input with default placeholder', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Поиск выставок...');
    expect(input).toBeInTheDocument();
  });

  it('renders search input with custom placeholder', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} placeholder="Найти выставку" />);
    
    const input = screen.getByPlaceholderText('Найти выставку');
    expect(input).toBeInTheDocument();
  });

  it('displays search icon', () => {
    const mockOnSearch = jest.fn();
    const { container } = render(<SearchBar onSearch={mockOnSearch} />);
    
    const icon = container.querySelector('svg.searchIcon');
    expect(icon).toBeInTheDocument();
  });

  it('updates input value when user types', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Поиск выставок...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Импрессионизм' } });
    
    expect(input.value).toBe('Импрессионизм');
  });

  it('debounces search callback', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} debounceMs={500} />);
    
    const input = screen.getByPlaceholderText('Поиск выставок...');
    
    // Type multiple characters quickly
    fireEvent.change(input, { target: { value: 'И' } });
    fireEvent.change(input, { target: { value: 'Им' } });
    fireEvent.change(input, { target: { value: 'Импр' } });
    
    // Should not call onSearch immediately
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast-forward time by 500ms
    jest.advanceTimersByTime(500);
    
    // Should call onSearch once with final value
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('Импр');
    });
  });

  it('shows clear button when input has value', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Поиск выставок...');
    
    // Clear button should not be visible initially
    expect(screen.queryByLabelText('Очистить поиск')).not.toBeInTheDocument();
    
    // Type something
    fireEvent.change(input, { target: { value: 'Тест' } });
    
    // Clear button should now be visible
    expect(screen.getByLabelText('Очистить поиск')).toBeInTheDocument();
  });

  it('clears input when clear button is clicked', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText('Поиск выставок...') as HTMLInputElement;
    
    // Type something
    fireEvent.change(input, { target: { value: 'Тест' } });
    expect(input.value).toBe('Тест');
    
    // Click clear button
    const clearButton = screen.getByLabelText('Очистить поиск');
    fireEvent.click(clearButton);
    
    // Input should be cleared
    expect(input.value).toBe('');
    
    // onSearch should be called immediately with empty string
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('calls onSearch with empty string on initial render', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} debounceMs={500} />);
    
    // Fast-forward time
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('');
    });
  });

  it('respects custom debounce time', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} debounceMs={1000} />);
    
    const input = screen.getByPlaceholderText('Поиск выставок...');
    fireEvent.change(input, { target: { value: 'Тест' } });
    
    // Should not call after 500ms
    jest.advanceTimersByTime(500);
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Should call after 1000ms
    jest.advanceTimersByTime(500);
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('Тест');
    });
  });

  it('cancels previous debounce timer when input changes', async () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} debounceMs={500} />);
    
    const input = screen.getByPlaceholderText('Поиск выставок...');
    
    // First change
    fireEvent.change(input, { target: { value: 'Первый' } });
    jest.advanceTimersByTime(300);
    
    // Second change before debounce completes
    fireEvent.change(input, { target: { value: 'Второй' } });
    jest.advanceTimersByTime(500);
    
    // Should only call once with the latest value
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1);
      expect(mockOnSearch).toHaveBeenCalledWith('Второй');
    });
  });

  it('has accessible labels', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);
    
    const input = screen.getByLabelText('Поиск выставок');
    expect(input).toBeInTheDocument();
  });
});
