import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExhibitionForm from './ExhibitionForm';
import { Exhibition } from '@/lib/types';

describe('ExhibitionForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const mockExhibition: Exhibition = {
    id: '1',
    title: 'Современное искусство',
    description: 'Коллекция современных произведений',
    gallery: 'Третьяковская галерея',
    startDate: '2024-01-15T00:00:00.000Z',
    endDate: '2024-03-30T00:00:00.000Z',
    imageUrl: 'https://example.com/exhibition.jpg',
    location: 'Москва',
    artworkIds: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create form with empty fields', () => {
    render(
      <ExhibitionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Создать выставку')).toBeInTheDocument();
    expect(screen.getByLabelText(/Название/)).toHaveValue('');
    expect(screen.getByLabelText(/Описание/)).toHaveValue('');
    expect(screen.getByLabelText(/Галерея/)).toHaveValue('');
  });

  it('renders edit form with pre-filled data', () => {
    render(
      <ExhibitionForm
        exhibition={mockExhibition}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Редактировать выставку')).toBeInTheDocument();
    expect(screen.getByLabelText(/Название/)).toHaveValue('Современное искусство');
    expect(screen.getByLabelText(/Описание/)).toHaveValue('Коллекция современных произведений');
    expect(screen.getByLabelText(/Галерея/)).toHaveValue('Третьяковская галерея');
  });

  it('validates required fields', async () => {
    render(
      <ExhibitionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Создать');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Название обязательно')).toBeInTheDocument();
      expect(screen.getByText('Описание обязательно')).toBeInTheDocument();
      expect(screen.getByText('Галерея обязательна')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates date range', async () => {
    render(
      <ExhibitionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Название/);
    const descriptionInput = screen.getByLabelText(/Описание/);
    const galleryInput = screen.getByLabelText(/Галерея/);
    const startDateInput = screen.getByLabelText(/Дата начала/);
    const endDateInput = screen.getByLabelText(/Дата окончания/);
    const imageUrlInput = screen.getByLabelText(/URL изображения/);

    fireEvent.change(titleInput, { target: { value: 'Тест' } });
    fireEvent.change(descriptionInput, { target: { value: 'Описание' } });
    fireEvent.change(galleryInput, { target: { value: 'Галерея' } });
    fireEvent.change(startDateInput, { target: { value: '2024-03-30' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/image.jpg' } });

    const submitButton = screen.getByText('Создать');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Дата окончания должна быть после даты начала')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates image URL format', async () => {
    render(
      <ExhibitionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Название/);
    const descriptionInput = screen.getByLabelText(/Описание/);
    const galleryInput = screen.getByLabelText(/Галерея/);
    const startDateInput = screen.getByLabelText(/Дата начала/);
    const endDateInput = screen.getByLabelText(/Дата окончания/);
    const imageUrlInput = screen.getByLabelText(/URL изображения/);

    fireEvent.change(titleInput, { target: { value: 'Тест' } });
    fireEvent.change(descriptionInput, { target: { value: 'Описание' } });
    fireEvent.change(galleryInput, { target: { value: 'Галерея' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2024-03-30' } });
    fireEvent.change(imageUrlInput, { target: { value: 'invalid-url' } });

    const submitButton = screen.getByText('Создать');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Введите корректный URL')).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    render(
      <ExhibitionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Название/);
    const descriptionInput = screen.getByLabelText(/Описание/);
    const galleryInput = screen.getByLabelText(/Галерея/);
    const startDateInput = screen.getByLabelText(/Дата начала/);
    const endDateInput = screen.getByLabelText(/Дата окончания/);
    const imageUrlInput = screen.getByLabelText(/URL изображения/);
    const locationInput = screen.getByLabelText(/Местоположение/);

    fireEvent.change(titleInput, { target: { value: 'Новая выставка' } });
    fireEvent.change(descriptionInput, { target: { value: 'Описание выставки' } });
    fireEvent.change(galleryInput, { target: { value: 'Эрмитаж' } });
    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2024-03-30' } });
    fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/image.jpg' } });
    fireEvent.change(locationInput, { target: { value: 'Санкт-Петербург' } });

    const submitButton = screen.getByText('Создать');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Новая выставка',
        description: 'Описание выставки',
        gallery: 'Эрмитаж',
        startDate: '2024-01-15',
        endDate: '2024-03-30',
        imageUrl: 'https://example.com/image.jpg',
        location: 'Санкт-Петербург',
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <ExhibitionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Отмена');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('clears field error when user starts typing', async () => {
    render(
      <ExhibitionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Создать');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Название обязательно')).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Название/);
    fireEvent.change(titleInput, { target: { value: 'Новое название' } });

    await waitFor(() => {
      expect(screen.queryByText('Название обязательно')).not.toBeInTheDocument();
    });
  });

  it('disables form inputs when loading', () => {
    render(
      <ExhibitionForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    expect(screen.getByLabelText(/Название/)).toBeDisabled();
    expect(screen.getByLabelText(/Описание/)).toBeDisabled();
    expect(screen.getByLabelText(/Галерея/)).toBeDisabled();
    expect(screen.getByText('Сохранение...')).toBeInTheDocument();
  });
});
