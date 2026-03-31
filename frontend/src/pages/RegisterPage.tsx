import { useState } from 'react';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth.service';
import { registerSchema } from '../schemas/auth.schemas';
import styles from './auth.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setFieldErrors({});
    setServerError(null);

    const result = registerSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      navigate('/');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>B</div>
          <span className={styles.brandName}>Billen</span>
        </div>

        <h1 className={styles.title}>Create an account</h1>
        <p className={styles.subtitle}>Start managing your invoices</p>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
          noValidate
        >
          {serverError && <div className={styles.error}>{serverError}</div>}

          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {fieldErrors.name?.[0] && (
              <span className={styles.fieldError}>{fieldErrors.name[0]}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldErrors.email?.[0] && (
              <span className={styles.fieldError}>{fieldErrors.email[0]}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password?.[0] && (
              <span className={styles.fieldError}>{fieldErrors.password[0]}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword?.[0] && (
              <span className={styles.fieldError}>{fieldErrors.confirmPassword[0]}</span>
            )}
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
