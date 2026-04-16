import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getInvoice,
  deleteInvoice,
  sendInvoice,
  type Invoice,
  type InvoiceStatus,
} from '../services/invoice.service';
import { getClient, type Client } from '../services/client.service';
import AppLayout from '../components/AppLayout';
import styles from './invoices.module.css';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!id) return;
    getInvoice(id)
      .then((inv) => {
        setInvoice(inv);
        return getClient(inv.clientId);
      })
      .then(setClient)
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load invoice');
      });
  }, [id]);

  async function handleSend() {
    if (!id) return;
    setActionError(null);
    setSending(true);
    try {
      const updated = await sendInvoice(id);
      setInvoice(updated);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteInvoice(id);
      navigate('/invoices');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete invoice');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  function statusClass(status: InvoiceStatus) {
    if (status === 'draft') return styles.statusDraft;
    if (status === 'sent') return styles.statusSent;
    return styles.statusOverdue;
  }

  if (loadError) {
    return (
      <AppLayout>
        <Link to="/invoices" className={styles.backLink}>
          ← Invoices
        </Link>
        <div className={styles.errorBanner}>{loadError}</div>
      </AppLayout>
    );
  }

  if (!invoice) {
    return (
      <AppLayout>
        <Link to="/invoices" className={styles.backLink}>
          ← Invoices
        </Link>
        <div className={styles.emptyState}>Loading…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Link to="/invoices" className={styles.backLink}>
        ← Invoices
      </Link>

      <div className={styles.detailCard}>
        <div className={styles.detailHeader}>
          <div>
            <h1 className={styles.detailTitle}>{invoice.invoiceNumber}</h1>
            <p className={styles.detailSub}>
              <span className={`${styles.statusBadge} ${statusClass(invoice.status)}`}>
                {invoice.status}
              </span>
              {client && <span>{client.name}</span>}
            </p>
          </div>
          <div className={styles.detailActions}>
            {invoice.status === 'draft' && (
              <button
                className={styles.btnPrimary}
                onClick={() => void handleSend()}
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send'}
              </button>
            )}
            <button
              className={styles.btnDanger}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          </div>
        </div>

        {actionError && <div className={styles.errorBanner}>{actionError}</div>}

        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <label>Client</label>
            <span>{client?.name ?? '—'}</span>
          </div>
          <div className={styles.gridItem}>
            <label>Currency</label>
            <span>{invoice.currency}</span>
          </div>
          <div className={styles.gridItem}>
            <label>Issue date</label>
            <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
          </div>
          <div className={styles.gridItem}>
            <label>Due date</label>
            <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
          </div>
          <div className={styles.gridItem}>
            <label>Total amount</label>
            <span>
              {invoice.currency} {invoice.amount.toFixed(2)}
            </span>
          </div>
          <div className={styles.gridItem}>
            <label>Created</label>
            <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
          </div>
          {invoice.notes && (
            <div className={styles.gridItem} style={{ gridColumn: '1 / -1' }}>
              <label>Notes</label>
              <span>{invoice.notes}</span>
            </div>
          )}
        </div>

        <p className={styles.sectionTitle}>Line items</p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.length === 0 ? (
              <tr>
                <td colSpan={4}>
                  <div className={styles.emptyState} style={{ padding: '24px' }}>
                    No line items.
                  </div>
                </td>
              </tr>
            ) : (
              invoice.lineItems.map((item, i) => (
                <tr key={i}>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>
                    {invoice.currency} {item.unitPrice.toFixed(2)}
                  </td>
                  <td>
                    {invoice.currency} {item.total.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className={styles.reviewTotal} style={{ marginTop: 16 }}>
          <span className={styles.reviewTotalLabel}>Total</span>
          <span className={styles.reviewTotalAmount}>
            {invoice.currency} {invoice.amount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className={styles.overlay} onClick={() => setConfirmDelete(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Delete invoice?</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>
              This will permanently delete invoice{' '}
              <strong style={{ color: '#e2e8f0' }}>{invoice.invoiceNumber}</strong>.
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
