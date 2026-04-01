import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  getClients,
  createClient,
  sendInvite,
  type Client,
} from '../services/client.service';
import { inviteSchema, createClientSchema } from '../schemas/client.schemas';
import AppLayout from '../components/AppLayout';
import styles from './clients.module.css';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteFieldErrors, setInviteFieldErrors] = useState<Partial<Record<string, string[]>>>({});
  const [inviteServerError, setInviteServerError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '', email: '', phone: '',
    addressLine1: '', addressLine2: '',
    addressCity: '', addressState: '', addressZip: '',
  });
  const [addFieldErrors, setAddFieldErrors] = useState<Partial<Record<string, string[]>>>({});
  const [addServerError, setAddServerError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load clients');
      });
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleInviteSubmit() {
    setInviteFieldErrors({});
    setInviteServerError(null);
    const result = inviteSchema.safeParse({ email: inviteEmail });
    if (!result.success) {
      setInviteFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setInviteLoading(true);
    try {
      await sendInvite(inviteEmail);
      setInviteSent(true);
    } catch (err) {
      setInviteServerError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  }

  function closeInvite() {
    setShowInvite(false);
    setInviteEmail('');
    setInviteFieldErrors({});
    setInviteServerError(null);
    setInviteSent(false);
  }

  async function handleAddSubmit() {
    setAddFieldErrors({});
    setAddServerError(null);
    const result = createClientSchema.safeParse(addForm);
    if (!result.success) {
      setAddFieldErrors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setAddLoading(true);
    try {
      const client = await createClient(result.data);
      setClients((prev) => [client, ...prev]);
      closeAdd();
    } catch (err) {
      setAddServerError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setAddLoading(false);
    }
  }

  function closeAdd() {
    setShowAdd(false);
    setAddForm({
      name: '', email: '', phone: '',
      addressLine1: '', addressLine2: '',
      addressCity: '', addressState: '', addressZip: '',
    });
    setAddFieldErrors({});
    setAddServerError(null);
  }

  function setAddField(field: string, value: string) {
    setAddForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <AppLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Clients</h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Search clients…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={styles.btnSecondary} onClick={() => setShowInvite(true)}>
            Invite client
          </button>
          <button className={styles.btnPrimary} onClick={() => setShowAdd(true)}>
            Add client
          </button>
        </div>
      </div>

      {loadError && <div className={styles.errorBanner}>{loadError}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Added</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <div className={styles.emptyState}>
                  {search ? 'No clients match your search.' : 'No clients yet.'}
                </div>
              </td>
            </tr>
          ) : (
            filtered.map((c) => (
              <tr key={c.id}>
                <td className={styles.clientName}>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone ?? '—'}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <Link to={`/clients/${c.id}`} className={styles.btnLink}>
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Invite dialog */}
      {showInvite && (
        <div className={styles.overlay} onClick={closeInvite}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Invite client</h2>
            {inviteSent ? (
              <>
                <p style={{ color: '#6b7280', fontSize: 14 }}>
                  Invite sent to <strong style={{ color: '#e2e8f0' }}>{inviteEmail}</strong>.
                  The link expires in 48 hours.
                </p>
                <div className={styles.modalFooter}>
                  <button className={styles.btnPrimary} onClick={closeInvite}>
                    Done
                  </button>
                </div>
              </>
            ) : (
              <form
                className={styles.form}
                onSubmit={(e) => { e.preventDefault(); void handleInviteSubmit(); }}
                noValidate
              >
                {inviteServerError && (
                  <div className={styles.errorBanner}>{inviteServerError}</div>
                )}
                <div className={styles.field}>
                  <label htmlFor="invite-email" className={styles.label}>
                    Client email
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    className={styles.input}
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                  {inviteFieldErrors.email?.[0] && (
                    <span className={styles.fieldError}>{inviteFieldErrors.email[0]}</span>
                  )}
                </div>
                <div className={styles.modalFooter}>
                  <button type="button" className={styles.btnSecondary} onClick={closeInvite}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnPrimary} disabled={inviteLoading}>
                    {inviteLoading ? 'Sending…' : 'Send invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add client dialog */}
      {showAdd && (
        <div className={styles.overlay} onClick={closeAdd}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Add client</h2>
            <form
              className={styles.form}
              onSubmit={(e) => { e.preventDefault(); void handleAddSubmit(); }}
              noValidate
            >
              {addServerError && (
                <div className={styles.errorBanner}>{addServerError}</div>
              )}

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label htmlFor="add-name" className={styles.label}>Name</label>
                  <input
                    id="add-name"
                    type="text"
                    className={styles.input}
                    value={addForm.name}
                    onChange={(e) => setAddField('name', e.target.value)}
                  />
                  {addFieldErrors.name?.[0] && (
                    <span className={styles.fieldError}>{addFieldErrors.name[0]}</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="add-phone" className={styles.label}>Phone</label>
                  <input
                    id="add-phone"
                    type="tel"
                    className={styles.input}
                    value={addForm.phone}
                    onChange={(e) => setAddField('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="add-email" className={styles.label}>Email</label>
                <input
                  id="add-email"
                  type="email"
                  className={styles.input}
                  value={addForm.email}
                  onChange={(e) => setAddField('email', e.target.value)}
                />
                {addFieldErrors.email?.[0] && (
                  <span className={styles.fieldError}>{addFieldErrors.email[0]}</span>
                )}
              </div>

              <div className={styles.field}>
                <label htmlFor="add-line1" className={styles.label}>Address line 1</label>
                <input
                  id="add-line1"
                  type="text"
                  className={styles.input}
                  value={addForm.addressLine1}
                  onChange={(e) => setAddField('addressLine1', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="add-line2" className={styles.label}>Address line 2</label>
                <input
                  id="add-line2"
                  type="text"
                  className={styles.input}
                  value={addForm.addressLine2}
                  onChange={(e) => setAddField('addressLine2', e.target.value)}
                />
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label htmlFor="add-city" className={styles.label}>City</label>
                  <input
                    id="add-city"
                    type="text"
                    className={styles.input}
                    value={addForm.addressCity}
                    onChange={(e) => setAddField('addressCity', e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="add-state" className={styles.label}>State</label>
                  <input
                    id="add-state"
                    type="text"
                    className={styles.input}
                    value={addForm.addressState}
                    onChange={(e) => setAddField('addressState', e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="add-zip" className={styles.label}>ZIP</label>
                <input
                  id="add-zip"
                  type="text"
                  className={styles.input}
                  style={{ maxWidth: 140 }}
                  value={addForm.addressZip}
                  onChange={(e) => setAddField('addressZip', e.target.value)}
                />
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={closeAdd}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={addLoading}>
                  {addLoading ? 'Adding…' : 'Add client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
