import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getClient, deleteClient, type Client } from '../services/client.service';
import AppLayout from '../components/AppLayout';
import styles from './clients.module.css';

function formatAddress(client: Client): string {
  const a = client.address;
  if (!a) return '—';
  const parts = [a.line1, a.line2, a.city, a.state, a.zip].filter(Boolean);
  return parts.length ? parts.join(', ') : '—';
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    getClient(id)
      .then(setClient)
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load client');
      });
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteClient(id);
      navigate('/clients');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete client');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loadError) {
    return (
      <AppLayout>
        <Link to="/clients" className={styles.backLink}>← Clients</Link>
        <div className={styles.errorBanner}>{loadError}</div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <Link to="/clients" className={styles.backLink}>← Clients</Link>
        <div className={styles.emptyState}>Loading…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link to="/clients" className={styles.backLink}>← Clients</Link>

      <div className={styles.detailCard}>
        <div className={styles.detailHeader}>
          <div>
            <h1 className={styles.detailName}>{client.name}</h1>
            <p className={styles.detailEmail}>{client.email}</p>
          </div>
          <div className={styles.detailActions}>
            <button
              className={styles.btnDanger}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          </div>
        </div>

        {deleteError && <div className={styles.errorBanner}>{deleteError}</div>}

        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <label>Phone</label>
            <span>{client.phone ?? '—'}</span>
          </div>
          <div className={styles.gridItem}>
            <label>Added</label>
            <span>{new Date(client.createdAt).toLocaleDateString()}</span>
          </div>
          <div className={styles.gridItem} style={{ gridColumn: '1 / -1' }}>
            <label>Address</label>
            <span>{formatAddress(client)}</span>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Delete client?</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
              This will permanently delete <strong style={{ color: '#e2e8f0' }}>{client.name}</strong> and all associated data.
            </p>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnSecondary}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className={styles.btnDanger}
                onClick={() => void handleDelete()}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
