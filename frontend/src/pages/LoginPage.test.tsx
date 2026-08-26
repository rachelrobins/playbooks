import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const { mockLogin, mockRegister } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockRegister: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ token: null, login: mockLogin, register: mockRegister, logout: vi.fn() }),
}));

function renderLoginPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

// Verifies the password-strength gating added on top of the register form: weak
// passwords keep the submit button disabled and show a warning, strong ones don't,
// and login mode isn't gated at all (existing users shouldn't be re-judged on login).
describe('LoginPage password strength gating', () => {
  it('disables submit and warns for a weak-but-well-formed register password', () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'demo@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '12345678A' } });

    expect(screen.getByRole('button', { name: /Create Account/ })).toBeDisabled();
    expect(screen.getByText(/not be easily guessable/)).toHaveClass('field-hint--warning');
  });

  it('enables submit for a strong register password', () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'demo@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Tr4ction-Whale-Bramble!' } });

    expect(screen.getByRole('button', { name: /Create Account/ })).toBeEnabled();
    expect(screen.getByText(/not be easily guessable/)).not.toHaveClass('field-hint--warning');
  });

  it('does not gate submit on password strength in login mode', () => {
    renderLoginPage();
    // Login is the default mode; a weak password is fine here since we're not creating one.
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'demo@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '12345678A' } });

    // "Log In" is also the tab-switcher button's label, so disambiguate by type.
    const submitButton = screen
      .getAllByRole('button', { name: 'Log In' })
      .find((button) => button.getAttribute('type') === 'submit');
    expect(submitButton).toBeEnabled();
    expect(screen.queryByText(/not be easily guessable/)).not.toBeInTheDocument();
  });
});
