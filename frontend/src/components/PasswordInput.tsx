/**
 * Renders a password input field with a control to show or hide the password.
 */
import { InputHTMLAttributes, useState } from 'react';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;


/** Renders a password input field with a toggle to show/hide the password. */
export function PasswordInput({ className, ...inputProps }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input">
      <input type={visible ? 'text' : 'password'} className={className} {...inputProps} />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((prev) => !prev)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 6c-5 0-9.27 3.11-11 7 .66 1.49 1.66 2.79 2.88 3.84l1.45-1.45A8.96 8.96 0 0 1 3.18 13a8.98 8.98 0 0 1 15.44-3.02l1.44-1.44A10.94 10.94 0 0 0 12 6Zm0 3a4 4 0 0 0-3.83 5.17l5-5A3.98 3.98 0 0 0 12 9Zm8.06-.94-1.44 1.44c.68.8 1.24 1.72 1.62 2.5a8.98 8.98 0 0 1-11.32 4.24l-1.5 1.5A10.9 10.9 0 0 0 12 20c5 0 9.27-3.11 11-7a13.13 13.13 0 0 0-2.94-3.94ZM3.5 3.5 2.09 4.91 5 7.82A13.14 13.14 0 0 0 1 13c1.73 3.89 6 7 11 7 1.62 0 3.15-.33 4.53-.91l2.56 2.56 1.41-1.41L3.5 3.5Zm7.87 7.87 2.26 2.26A3.98 3.98 0 0 1 12 16a4 4 0 0 1-3.87-5.13l.24.24Z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
