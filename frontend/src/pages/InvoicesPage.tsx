import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getInvoices, type Invoice, type InvoiceStatus } from '../services/invoice.service';
import { getClients, type Client } from '../services/client.service';
import AppLayout from '../components/AppLayout';
import styles from './invoices.module.css';

const PAGE_SIZE = 10;

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [sortKey, setSortKey] = useState<'dueDate' | 'amount'>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([getInvoices(), getClients()])
      .then(([inv, cli]) => {
        setInvoices(inv);
        setClients(cli);
      })
      .catch((err: unknown) => {
        setLoadError(err instanceof Error ? err.message : 'Failed to load invoices');
      });
  }, []);

  const clientMap = new Map(clients.map((c) => [c.id, c.name]));

  function toggleSort(key: 'dueDate' | 'amount') {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }

  let filtered = invoices;
  if (statusFilter !== 'all') filtered = filtered.filter((i) => i.status === statusFilter);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((i) => i.invoiceNumber.toLowerCase().includes(q));
  }

  const sorted = [...filtered].sort((a, b) => {
    const valA = sortKey === 'dueDate' ? new Date(a.dueDate).getTime() : a.amount;
    const valB = sortKey === 'dueDate' ? new Date(b.dueDate).getTime() : b.amount;
    return sortDir === 'asc' ? valA - valB : valB - valA;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function statusClass(status: InvoiceStatus) {
    if (status === 'draft') return styles.statusDraft;
    if (status === 'sent') return styles.statusSent;
    return styles.statusOverdue;
  }

  return (
    <AppLayout>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Invoices</h1>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Search by number…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | InvoiceStatus);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="overdue">Overdue</option>
          </select>
          <Link to="/invoices/create" className={styles.btnPrimary}>
            New invoice
          </Link>
        </div>
      </div>

      {loadError && <div className={styles.errorBanner}>{loadError}</div>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Status</th>
            <th>Client</th>
            <th>
              <button className={styles.sortBtn} onClick={() => toggleSort('dueDate')}>
                Due Date{sortKey === 'dueDate' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </button>
            </th>
            <th>
              <button className={styles.sortBtn} onClick={() => toggleSort('amount')}>
                Amount{sortKey === 'amount' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </button>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 ? (
            <tr>
              <td colSpan={6}>
                <div className={styles.emptyState}>
                  {search || statusFilter !== 'all'
                    ? 'No invoices match your filters.'
                    : 'No invoices yet.'}
                </div>
              </td>
            </tr>
          ) : (
            paged.map((inv) => (
              <tr key={inv.id}>
                <td className={styles.invoiceNumber}>{inv.invoiceNumber}</td>
                <td>
                  <span className={`${styles.statusBadge} ${statusClass(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td>{clientMap.get(inv.clientId) ?? '—'}</td>
                <td>{new Date(inv.dueDate).toLocaleDateString()}</td>
                <td>
                  {inv.currency} {inv.amount.toFixed(2)}
                </td>
                <td>
                  <Link to={`/invoices/${inv.id}`} className={styles.btnLink}>
                    View
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className={styles.paginationRow}>
          <button
            className={styles.paginationBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className={styles.paginationInfo}>
            Page {page} of {totalPages}
          </span>
          <button
            className={styles.paginationBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </AppLayout>
  );
}
