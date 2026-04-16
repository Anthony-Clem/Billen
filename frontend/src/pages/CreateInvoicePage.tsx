import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { createInvoice } from '../services/invoice.service';
import { getClients, type Client } from '../services/client.service';
import { invoiceDetailsSchema, lineItemSchema } from '../schemas/invoice.schemas';
import AppLayout from '../components/AppLayout';
import styles from './invoices.module.css';

type LineItemRow = {
  description: string;
  quantity: string;
  unitPrice: string;
};

type Details = {
  clientId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  notes: string;
};

const EMPTY_ITEM: LineItemRow = { description: '', quantity: '1', unitPrice: '0' };

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Client[]>([]);

  const [details, setDetails] = useState<Details>({
    clientId: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0] ?? '',
    dueDate: '',
    currency: 'USD',
    notes: '',
  });

  const [lineItems, setLineItems] = useState<LineItemRow[]>([{ ...EMPTY_ITEM }]);

  const [step1Errors, setStep1Errors] = useState<Partial<Record<string, string[]>>>({});
  const [step2ItemErrors, setStep2ItemErrors] = useState<
    Array<Partial<Record<string, string[]>>>
  >([]);
  const [step2TopError, setStep2TopError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getClients().catch(() => null).then((data) => {
      if (data) setClients(data);
    });
  }, []);

  function setDetail(field: keyof Details, value: string) {
    setDetails((prev) => ({ ...prev, [field]: value }));
  }

  function setItemField(index: number, field: keyof LineItemRow, value: string) {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addItem() {
    setLineItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(index: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  function computeRowTotal(item: LineItemRow): number {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return qty * price;
  }

  function computeTotal(): number {
    return lineItems.reduce((sum, item) => sum + computeRowTotal(item), 0);
  }

  function handleNextFromStep1() {
    setStep1Errors({});
    const result = invoiceDetailsSchema.safeParse(details);
    if (!result.success) {
      setStep1Errors(z.flattenError(result.error).fieldErrors);
      return;
    }
    setStep(2);
  }

  function handleNextFromStep2() {
    setStep2ItemErrors([]);
    setStep2TopError(null);

    if (lineItems.length === 0) {
      setStep2TopError('Add at least one line item');
      return;
    }

    const errors = lineItems.map((item) => {
      const result = lineItemSchema.safeParse({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      });
      if (!result.success) return z.flattenError(result.error).fieldErrors;
      return {};
    });

    if (errors.some((e) => Object.keys(e).length > 0)) {
      setStep2ItemErrors(errors);
      return;
    }

    setStep(3);
  }

  async function handleSubmit() {
    setServerError(null);
    setSubmitting(true);
    try {
      const parsedItems = lineItems.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }));
      const amount = parsedItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const invoice = await createInvoice({
        clientId: details.clientId,
        invoiceNumber: details.invoiceNumber,
        issueDate: details.issueDate,
        dueDate: details.dueDate,
        currency: details.currency,
        notes: details.notes || undefined,
        amount,
        lineItems: parsedItems,
      });
      navigate(`/invoices/${invoice.id}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to create invoice');
      setSubmitting(false);
    }
  }

  const clientName =
    clients.find((c) => c.id === details.clientId)?.name ?? details.clientId;

  function stepClass(n: number) {
    if (n < step) return `${styles.step} ${styles.stepDone}`;
    if (n === step) return `${styles.step} ${styles.stepActive}`;
    return styles.step;
  }

  return (
    <AppLayout>
      <div className={styles.createShell}>
        <Link to="/invoices" className={styles.backLink}>
          ← Invoices
        </Link>

        <div className={styles.pageHeader} style={{ marginBottom: 28 }}>
          <h1 className={styles.pageTitle}>New Invoice</h1>
        </div>

        <div className={styles.createCard}>
          {/* Step indicator */}
          <div className={styles.stepIndicator}>
            <div className={stepClass(1)}>
              <span className={styles.stepNum}>1</span>
              <span className={styles.stepLabel}>Details</span>
            </div>
            <div className={styles.stepLine} />
            <div className={stepClass(2)}>
              <span className={styles.stepNum}>2</span>
              <span className={styles.stepLabel}>Line Items</span>
            </div>
            <div className={styles.stepLine} />
            <div className={stepClass(3)}>
              <span className={styles.stepNum}>3</span>
              <span className={styles.stepLabel}>Review</span>
            </div>
          </div>

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                handleNextFromStep1();
              }}
              noValidate
            >
              <div className={styles.field}>
                <label htmlFor="inv-client" className={styles.label}>
                  Client
                </label>
                <select
                  id="inv-client"
                  className={styles.select}
                  value={details.clientId}
                  onChange={(e) => setDetail('clientId', e.target.value)}
                >
                  <option value="">Select a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {step1Errors.clientId?.[0] && (
                  <span className={styles.fieldError}>{step1Errors.clientId[0]}</span>
                )}
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label htmlFor="inv-number" className={styles.label}>
                    Invoice number
                  </label>
                  <input
                    id="inv-number"
                    type="text"
                    className={styles.input}
                    placeholder="INV-001"
                    value={details.invoiceNumber}
                    onChange={(e) => setDetail('invoiceNumber', e.target.value)}
                  />
                  {step1Errors.invoiceNumber?.[0] && (
                    <span className={styles.fieldError}>{step1Errors.invoiceNumber[0]}</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="inv-currency" className={styles.label}>
                    Currency
                  </label>
                  <input
                    id="inv-currency"
                    type="text"
                    className={styles.input}
                    placeholder="USD"
                    value={details.currency}
                    onChange={(e) => setDetail('currency', e.target.value)}
                  />
                  {step1Errors.currency?.[0] && (
                    <span className={styles.fieldError}>{step1Errors.currency[0]}</span>
                  )}
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label htmlFor="inv-issue" className={styles.label}>
                    Issue date
                  </label>
                  <input
                    id="inv-issue"
                    type="date"
                    className={styles.input}
                    value={details.issueDate}
                    onChange={(e) => setDetail('issueDate', e.target.value)}
                  />
                  {step1Errors.issueDate?.[0] && (
                    <span className={styles.fieldError}>{step1Errors.issueDate[0]}</span>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="inv-due" className={styles.label}>
                    Due date
                  </label>
                  <input
                    id="inv-due"
                    type="date"
                    className={styles.input}
                    value={details.dueDate}
                    onChange={(e) => setDetail('dueDate', e.target.value)}
                  />
                  {step1Errors.dueDate?.[0] && (
                    <span className={styles.fieldError}>{step1Errors.dueDate[0]}</span>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="inv-notes" className={styles.label}>
                  Notes (optional)
                </label>
                <textarea
                  id="inv-notes"
                  className={styles.textarea}
                  placeholder="Payment terms, references…"
                  value={details.notes}
                  onChange={(e) => setDetail('notes', e.target.value)}
                />
              </div>

              <div className={styles.formFooter}>
                <span />
                <div className={styles.formFooterRight}>
                  <button type="submit" className={styles.btnPrimary}>
                    Next →
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ── Step 2: Line items ── */}
          {step === 2 && (
            <form
              className={styles.form}
              onSubmit={(e) => {
                e.preventDefault();
                handleNextFromStep2();
              }}
              noValidate
            >
              {step2TopError && (
                <div className={styles.errorBanner}>{step2TopError}</div>
              )}

              <div className={styles.lineItemsHeader}>
                <span className={styles.lineItemsHeaderLabel}>Description</span>
                <span className={styles.lineItemsHeaderLabel}>Qty</span>
                <span className={styles.lineItemsHeaderLabel}>Unit price</span>
                <span className={styles.lineItemsHeaderLabel}>Total</span>
                <span />
              </div>

              {lineItems.map((item, i) => (
                <div key={i}>
                  <div className={styles.lineItemRow}>
                    <div className={styles.field}>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => setItemField(i, 'description', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <input
                        type="number"
                        className={styles.input}
                        min="0"
                        step="1"
                        value={item.quantity}
                        onChange={(e) => setItemField(i, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <input
                        type="number"
                        className={styles.input}
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => setItemField(i, 'unitPrice', e.target.value)}
                      />
                    </div>
                    <span className={styles.lineItemTotal}>
                      {computeRowTotal(item).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      className={styles.lineItemRemoveBtn}
                      onClick={() => removeItem(i)}
                      aria-label="Remove line item"
                    >
                      ×
                    </button>
                  </div>
                  {step2ItemErrors[i] && Object.keys(step2ItemErrors[i] ?? {}).length > 0 && (
                    <div style={{ paddingLeft: 0, marginTop: 2 }}>
                      {step2ItemErrors[i]?.description?.[0] && (
                        <span className={styles.fieldError} style={{ display: 'block' }}>
                          Description: {step2ItemErrors[i]?.description?.[0]}
                        </span>
                      )}
                      {step2ItemErrors[i]?.quantity?.[0] && (
                        <span className={styles.fieldError} style={{ display: 'block' }}>
                          Qty: {step2ItemErrors[i]?.quantity?.[0]}
                        </span>
                      )}
                      {step2ItemErrors[i]?.unitPrice?.[0] && (
                        <span className={styles.fieldError} style={{ display: 'block' }}>
                          Unit price: {step2ItemErrors[i]?.unitPrice?.[0]}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <button type="button" className={styles.addItemBtn} onClick={addItem}>
                + Add line item
              </button>

              <div className={styles.formFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <div className={styles.formFooterRight}>
                  <button type="submit" className={styles.btnPrimary}>
                    Next →
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <div>
              {serverError && <div className={styles.errorBanner}>{serverError}</div>}

              <div className={styles.reviewCard}>
                <div className={styles.reviewGrid}>
                  <div className={styles.reviewItem}>
                    <label>Client</label>
                    <span>{clientName}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <label>Invoice #</label>
                    <span>{details.invoiceNumber}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <label>Issue date</label>
                    <span>{new Date(details.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <label>Due date</label>
                    <span>{new Date(details.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.reviewItem}>
                    <label>Currency</label>
                    <span>{details.currency}</span>
                  </div>
                  {details.notes && (
                    <div className={styles.reviewItem} style={{ gridColumn: '1 / -1' }}>
                      <label>Notes</label>
                      <span>{details.notes}</span>
                    </div>
                  )}
                </div>

                <div className={styles.reviewDivider} />

                <div>
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
                      {lineItems.map((item, i) => (
                        <tr key={i}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>
                            {details.currency} {parseFloat(item.unitPrice).toFixed(2)}
                          </td>
                          <td>
                            {details.currency} {computeRowTotal(item).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className={styles.reviewTotal}>
                  <span className={styles.reviewTotalLabel}>Total</span>
                  <span className={styles.reviewTotalAmount}>
                    {details.currency} {computeTotal().toFixed(2)}
                  </span>
                </div>
              </div>

              <div className={styles.formFooter}>
                <button
                  className={styles.btnSecondary}
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
                <div className={styles.formFooterRight}>
                  <button
                    className={styles.btnPrimary}
                    disabled={submitting}
                    onClick={() => void handleSubmit()}
                  >
                    {submitting ? 'Creating…' : 'Create invoice'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
