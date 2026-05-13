import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginScreen } from './LoginScreen';

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  changePassword: vi.fn(),
}));

const navMocks = vi.hoisted(() => ({
  setCurrentView: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: authMocks.login,
    register: authMocks.register,
    changePassword: authMocks.changePassword,
  }),
}));

vi.mock('../../context', () => ({
  useNavigation: () => ({
    setCurrentView: navMocks.setCurrentView,
  }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginScreen />);

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');
    const form = container.querySelector('form');
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(form).toBeTruthy();

    await user.type(emailInput!, 'user@localhost');
    await user.type(passwordInput!, 'Secret1!');
    fireEvent.submit(form!);

    expect(await screen.findByText(/poprawny adres email/i)).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it('navigates admin to admin dashboard after successful login', async () => {
    const user = userEvent.setup();
    authMocks.login.mockResolvedValue('admin');
    const { container } = render(<LoginScreen />);

    await user.type(container.querySelector('input[type="email"]')!, 'chef@gastrohub.test');
    await user.type(container.querySelector('input[type="password"]')!, 'AnyPassword1');
    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(navMocks.setCurrentView).toHaveBeenCalledWith('admin_dashboard');
    });
    expect(authMocks.login).toHaveBeenCalledWith('chef@gastrohub.test', 'AnyPassword1');
  });

  it('requires strong password in register mode', async () => {
    const user = userEvent.setup();
    const { container } = render(<LoginScreen />);

    await user.click(screen.getByRole('button', { name: /^rejestracja$/i }));
    await user.type(container.querySelector('input[type="email"]')!, 'new@gastrohub.test');
    await user.type(container.querySelector('input[type="password"]')!, 'weak');
    fireEvent.submit(container.querySelector('form')!);

    expect(await screen.findByText(/min\. 8 znaków/i)).toBeInTheDocument();
    expect(authMocks.register).not.toHaveBeenCalled();
  });
});
