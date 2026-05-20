import { render, screen } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';

const baseProduct = {
  _id: 'abc123',
  name: 'Calculus Textbook',
  price: 45,
  condition: 'good',
  category: { name: 'Books' },
  images: [],
  views: 12,
  negotiable: false,
};

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('Calculus Textbook')).toBeInTheDocument();
    expect(screen.getByText('$45')).toBeInTheDocument();
  });

  it('shows category and condition chips', () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
  });

  it('shows Negotiable chip when negotiable is true', () => {
    render(<ProductCard product={{ ...baseProduct, negotiable: true }} />);
    expect(screen.getByText('Negotiable')).toBeInTheDocument();
  });

  it('shows "Ending soon" when expiry is within 3 days', () => {
    const soon = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
    render(<ProductCard product={{ ...baseProduct, expiresAt: soon }} />);
    expect(screen.getByText('Ending soon')).toBeInTheDocument();
  });

  it('does not show "Ending soon" when expiry is far away', () => {
    const far = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    render(<ProductCard product={{ ...baseProduct, expiresAt: far }} />);
    expect(screen.queryByText('Ending soon')).not.toBeInTheDocument();
  });

  it('renders placeholder when no image provided', () => {
    render(<ProductCard product={{ ...baseProduct, images: [] }} />);
    expect(screen.getByText('Calculus Textbook')).toBeInTheDocument();
  });

  it('links to the correct listing page', () => {
    render(<ProductCard product={baseProduct} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/listing/abc123');
  });
});
