import { render, screen, fireEvent } from '@testing-library/react';
import WishlistButton from '@/components/WishlistButton';

jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { _id: 'user1' } }),
}));

const STORAGE_KEY = 'wishlist_user1';

beforeEach(() => {
  localStorage.clear();
});

describe('WishlistButton', () => {
  it('renders unsaved state by default', () => {
    render(<WishlistButton productId="prod1" />);
    expect(screen.getByRole('button', { name: /save to wishlist/i })).toBeInTheDocument();
  });

  it('renders saved state when product is already in localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['prod1']));
    render(<WishlistButton productId="prod1" />);
    expect(screen.getByRole('button', { name: /remove from wishlist/i })).toBeInTheDocument();
  });

  it('toggles to saved on click', () => {
    render(<WishlistButton productId="prod2" />);
    fireEvent.click(screen.getByRole('button'));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored).toContain('prod2');
  });

  it('removes from wishlist on second click', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['prod3']));
    render(<WishlistButton productId="prod3" />);
    fireEvent.click(screen.getByRole('button'));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    expect(stored).not.toContain('prod3');
  });
});
