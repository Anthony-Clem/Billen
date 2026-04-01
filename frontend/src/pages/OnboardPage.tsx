import { useState } from 'react';
import { z } from 'zod';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { onboard } from '../services/client.service';
import { onboardSchema } from '../schemas/client.schemas';
import styles from './auth.module.css';

export default function OnboardPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token') ?? '';
  const expiresParam = params.get('expires');
  const expiresAt = expiresParam ? parseInt(expiresParam, 10) : NaN;
  const isExpired = !token || isNaN(expiresAt) || Date.now() > expiresAt;

  const [form, setForm] = useState({
    name: '', phone: '',
    addressLine1: '', addressLine2: '',
    addressCity: '', addressState: '', addressZip: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string[]>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setFieldErrors({});
    setServerError(null);
    const result = onboardSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setLoading(true);
    try {
      await onboard({ token, ...result.data });
      navigate('/login?onboarded=1');
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  }

  if (isExpired) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <div className={styles.logo}>B</div>
            <span className={styles.brandName}>Billen</span>
          </div>
          <h1 className={styles.title}>Link expired</h1>
          <p className={styles.subtitle}>
            This invite link has expired or is invalid. Please ask to be re-invited.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card} style={{ maxWidth: 480 }}>
        <div className={styles.brand}>
          <div className={styles.logo}>B</div>
          <span className={styles.brandName}>Billen</span>
        </div>

        <h1 className={styles.title}>Complete your profile</h1>
        <p className={styles.subtitle}>
          Fill in your details to finish onboarding.
        </p>

        <form
          className={styles.form}
          onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
          noValidate
        >
          {serverError && <div className={styles.error}>{serverError}</div>}

          <div className={styles.field}>
            <label htmlFor="ob-name" className={styles.label}>Name</label>
            <input
              id="ob-name"
              type="text"
              className={styles.input}
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
            />
            {fieldErrors.name?.[0] && (
              <span className={styles.fieldError}>{fieldErrors.name[0]}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="ob-phone" className={styles.label}>Phone</label>
            <input
              id="ob-phone"
              type="tel"
              className={styles.input}
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="ob-line1" className={styles.label}>Address line 1</label>
            <input
              id="ob-line1"
              type="text"
              className={styles.input}
              value={form.addressLine1}
              onChange={(e) => setField('addressLine1', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="ob-line2" className={styles.label}>Address line 2</label>
            <input
              id="ob-line2"
              type="text"
              className={styles.input}
              value={form.addressLine2}
              onChange={(e) => setField('addressLine2', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="ob-city" className={styles.label}>City</label>
            <input
              id="ob-city"
              type="text"
              className={styles.input}
              value={form.addressCity}
              onChange={(e) => setField('addressCity', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="ob-state" className={styles.label}>State</label>
            <input
              id="ob-state"
              type="text"
              className={styles.input}
              value={form.addressState}
              onChange={(e) => setField('addressState', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="ob-zip" className={styles.label}>ZIP</label>
            <input
              id="ob-zip"
              type="text"
              className={styles.input}
              value={form.addressZip}
              onChange={(e) => setField('addressZip', e.target.value)}
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Submitting…' : 'Complete profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
