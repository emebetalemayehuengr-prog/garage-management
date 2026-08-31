import React, { useState } from 'react';
import {
  DollarSign,
  Download,
  Eye,
  FileText,
  Plus,
  Printer,
  Receipt,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useGarage } from '../../context/GarageContext';
import { formatETB } from '../../utils/format';
import {
  downloadInvoicePdf,
  downloadReceiptPdf,
  previewInvoice,
  previewReceipt,
  printInvoice,
  printReceipt,
} from '../../utils/print';

const emptyLine = () => ({ description: '', quantity: 1, unitPrice: 0 });

const Billing = () => {
  const {
    invoices = [],
    jobCards = [],
    vehicles = [],
    customers = [],
    spareParts = [],
    companyProfile,
    createInvoice,
    recordInvoicePayment,
    registerInvoicePrint,
    registerReceiptPrint,
    PAYMENT_STATUS,
  } = useGarage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentInputs, setPaymentInputs] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({});
  const [busyAction, setBusyAction] = useState('');
  const [form, setForm] = useState({
    jobCardId: '',
    serviceItems: [emptyLine()],
    partItems: [emptyLine()],
    laborCost: 0,
    discount: 0,
    vatRate: 15,
    paymentMethod: 'Cash',
  });

  const resetForm = () =>
    setForm({
      jobCardId: '',
      serviceItems: [emptyLine()],
      partItems: [emptyLine()],
      laborCost: 0,
      discount: 0,
      vatRate: 15,
      paymentMethod: 'Cash',
    });

  const updateLine = (group, index, field, value) =>
    setForm((current) => ({
      ...current,
      [group]: current[group].map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: ['description', 'partNumber'].includes(field) ? value : Number(value),
            }
          : item
      ),
    }));

  const submit = async (event) => {
    event.preventDefault();
    const serviceItems = form.serviceItems.filter((item) => item.description.trim());
    const partItems = form.partItems.filter((item) => item.description.trim());
    const lineTotal = [...serviceItems, ...partItems].reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      Number(form.laborCost || 0)
    );
    const discounted = Math.max(0, lineTotal - Number(form.discount || 0));
    try {
      await createInvoice({
        ...form,
        jobCardId: Number(form.jobCardId),
        serviceItems,
        partItems,
        totalAmount: discounted * (1 + Number(form.vatRate || 0) / 100),
        paidAmount: 0,
      });
      toast.success('Invoice created');
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getDocumentData = (invoice, payment) => {
    const jobCard = jobCards.find((item) => item.id === invoice.jobCardId);
    const vehicle = vehicles.find((item) => item.id === jobCard?.vehicleId);
    const customer = customers.find((item) => item.id === vehicle?.customerId);
    return { invoice, payment, jobCard, vehicle, customer, profile: companyProfile };
  };

  const requireProfile = () => {
    if (companyProfile) return true;
    toast.error('Set up Settings → Company Profile before generating documents.');
    return false;
  };

  const run = async (key, action) => {
    setBusyAction(key);
    try {
      await action();
    } catch (error) {
      toast.error(error.message || 'Document action failed');
    } finally {
      setBusyAction('');
    }
  };

  const handleInvoicePrint = (invoice, pdf = false) =>
    run(`${pdf ? 'pdf' : 'print'}-${invoice.id}`, async () => {
      if (!requireProfile()) return;
      const result = await registerInvoicePrint(invoice.id);
      const data = { ...getDocumentData(result.invoice), isDuplicate: result.isDuplicate };
      if (pdf) await downloadInvoicePdf(data);
      else printInvoice(data);
    });

  const handleReceiptPrint = (invoice, payment, pdf = false) =>
    run(`${pdf ? 'rpdf' : 'rprint'}-${invoice.id}`, async () => {
      if (!requireProfile()) return;
      const result = await registerReceiptPrint(invoice.id, payment.id);
      const data = {
        ...getDocumentData(result.invoice, result.payment),
        isDuplicate: result.isDuplicate,
      };
      if (pdf) await downloadReceiptPdf(data);
      else printReceipt(data);
    });

  const handlePayment = (invoice) =>
    run(`pay-${invoice.id}`, async () => {
      const amount = Number(paymentInputs[invoice.id]);
      if (!amount || amount <= 0) throw new Error('Enter a valid payment amount');
      await recordInvoicePayment(invoice.id, amount, paymentMethods[invoice.id] || 'Cash');
      setPaymentInputs((current) => ({ ...current, [invoice.id]: '' }));
      toast.success('Payment recorded and receipt created');
    });

  const filteredInvoices = invoices.filter((invoice) => String(invoice.id).includes(searchTerm));
  const statusColor = (status) =>
    status === PAYMENT_STATUS.PAID
      ? 'bg-green-100 text-green-700'
      : status === PAYMENT_STATUS.PARTIAL
        ? 'bg-orange-100 text-orange-700'
        : 'bg-yellow-100 text-yellow-700';

  const lineEditor = (group, title) => (
    <div className="md:col-span-2 rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <button
          type="button"
          onClick={() =>
            setForm((current) => ({ ...current, [group]: [...current[group], emptyLine()] }))
          }
          className="text-sm font-medium text-blue-600"
        >
          + Add line
        </button>
      </div>
      <div className="space-y-2">
        {form[group].map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2">
            {group === 'partItems' && spareParts.length > 0 && (
              <select
                value=""
                onChange={(event) => {
                  const part = spareParts.find(
                    (candidate) => candidate.id === Number(event.target.value)
                  );
                  if (!part) return;
                  updateLine(group, index, 'description', part.name);
                  updateLine(group, index, 'partNumber', String(part.id));
                  updateLine(group, index, 'unitPrice', part.price);
                }}
                className="col-span-12 rounded border bg-gray-50 px-3 py-2 text-sm"
              >
                <option value="">Choose from inventory (optional)</option>
                {spareParts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name} — {formatETB(part.price)} ({part.stock} in stock)
                  </option>
                ))}
              </select>
            )}
            <input
              required={index === 0 && group === 'serviceItems'}
              value={item.description}
              onChange={(event) => updateLine(group, index, 'description', event.target.value)}
              placeholder="Description"
              className="col-span-7 rounded border px-3 py-2"
            />
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={item.quantity}
              onChange={(event) => updateLine(group, index, 'quantity', event.target.value)}
              placeholder="Qty"
              className="col-span-2 rounded border px-2 py-2"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={item.unitPrice}
              onChange={(event) => updateLine(group, index, 'unitPrice', event.target.value)}
              placeholder="Unit price"
              className="col-span-2 rounded border px-2 py-2"
            />
            <button
              type="button"
              onClick={() =>
                setForm((current) => ({
                  ...current,
                  [group]: current[group].filter((_, itemIndex) => itemIndex !== index),
                }))
              }
              className="col-span-1 text-red-500"
              aria-label="Remove line"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Billing</h2>
          <p className="mt-1 text-gray-500">Professional invoices, payments, and receipts</p>
        </div>
        <button
          onClick={() => setShowAddForm((open) => !open)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" /> Create Invoice
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-xl border bg-white p-6 shadow-sm md:grid-cols-2"
        >
          <div className="md:col-span-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Create New Invoice</h3>
            <button type="button" onClick={() => setShowAddForm(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <label className="text-sm font-medium">
            Job Card
            <select
              required
              value={form.jobCardId}
              onChange={(event) => {
                const jobCard = jobCards.find((item) => item.id === Number(event.target.value));
                setForm((current) => ({
                  ...current,
                  jobCardId: event.target.value,
                  serviceItems: [
                    { description: jobCard?.problemDescription || '', quantity: 1, unitPrice: 0 },
                  ],
                }));
              }}
              className="mt-2 w-full rounded-lg border px-3 py-2.5"
            >
              <option value="">Select Job Card</option>
              {jobCards
                .filter((job) => !invoices.some((invoice) => invoice.jobCardId === job.id))
                .map((job) => (
                  <option key={job.id} value={job.id}>
                    Job #{job.id} — {job.problemDescription}
                  </option>
                ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Default payment method
            <select
              value={form.paymentMethod}
              onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}
              className="mt-2 w-full rounded-lg border px-3 py-2.5"
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Mobile Money</option>
              <option>Card</option>
              <option>Credit</option>
            </select>
          </label>
          {lineEditor('serviceItems', 'Services / jobs performed')}
          {lineEditor('partItems', 'Spare parts used')}
          {[
            ['laborCost', 'Labor cost'],
            ['discount', 'Discount'],
            ['vatRate', 'VAT / tax rate (%)'],
          ].map(([field, label]) => (
            <label key={field} className="text-sm font-medium">
              {label}
              <input
                type="number"
                min="0"
                step="0.01"
                value={form[field]}
                onChange={(event) => setForm({ ...form, [field]: Number(event.target.value) })}
                className="mt-2 w-full rounded-lg border px-3 py-2.5"
              />
            </label>
          ))}
          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
              className="rounded-lg border px-5 py-2.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white"
            >
              Create Invoice
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="relative border-b p-4">
          <Search className="absolute left-7 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search invoice number…"
            className="w-full rounded-lg border py-2 pl-10 pr-4"
          />
        </div>
        {filteredInvoices.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No invoices found</div>
        ) : (
          <div className="divide-y">
            {filteredInvoices.map((invoice) => {
              const balance = Math.max(0, invoice.totalAmount - (invoice.paidAmount || 0));
              const latestPayment = invoice.payments?.[invoice.payments.length - 1];
              const data = getDocumentData(invoice, latestPayment);
              return (
                <article key={invoice.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-blue-600" />
                        <h3 className="font-bold text-gray-800">INV-{invoice.id}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Job #{invoice.jobCardId} • {formatETB(invoice.totalAmount)} total •{' '}
                        {formatETB(balance)} balance
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={!companyProfile}
                        onClick={() => requireProfile() && previewInvoice(data)}
                        className="flex items-center gap-1 rounded border px-3 py-2 text-sm"
                      >
                        <Eye className="h-4 w-4" /> Preview Invoice
                      </button>
                      <button
                        disabled={busyAction}
                        onClick={() => handleInvoicePrint(invoice)}
                        className="flex items-center gap-1 rounded bg-blue-600 px-3 py-2 text-sm text-white"
                      >
                        <Printer className="h-4 w-4" /> Print Invoice
                      </button>
                      <button
                        disabled={busyAction}
                        onClick={() => handleInvoicePrint(invoice, true)}
                        className="flex items-center gap-1 rounded border px-3 py-2 text-sm"
                      >
                        <Download className="h-4 w-4" /> Invoice PDF
                      </button>
                    </div>
                  </div>
                  {invoice.status !== PAYMENT_STATUS.PAID && (
                    <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-3">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <input
                        type="number"
                        min="0.01"
                        max={balance}
                        step="0.01"
                        value={paymentInputs[invoice.id] || ''}
                        onChange={(event) =>
                          setPaymentInputs((current) => ({
                            ...current,
                            [invoice.id]: event.target.value,
                          }))
                        }
                        placeholder="Payment amount"
                        className="w-40 rounded border px-3 py-2"
                      />
                      <select
                        value={paymentMethods[invoice.id] || 'Cash'}
                        onChange={(event) =>
                          setPaymentMethods((current) => ({
                            ...current,
                            [invoice.id]: event.target.value,
                          }))
                        }
                        className="rounded border px-3 py-2"
                      >
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                        <option>Mobile Money</option>
                        <option>Card</option>
                      </select>
                      <button
                        disabled={busyAction}
                        onClick={() => handlePayment(invoice)}
                        className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        Record Payment
                      </button>
                    </div>
                  )}
                  {latestPayment && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <p className="text-sm text-gray-600">
                        <FileText className="mr-1 inline h-4 w-4" /> Latest receipt:{' '}
                        <strong>{latestPayment.receiptNumber}</strong> •{' '}
                        {formatETB(latestPayment.amount)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => previewReceipt(data)}
                          className="flex items-center gap-1 rounded border px-3 py-2 text-sm"
                        >
                          <Eye className="h-4 w-4" /> Preview Receipt
                        </button>
                        <button
                          disabled={busyAction}
                          onClick={() => handleReceiptPrint(invoice, latestPayment)}
                          className="flex items-center gap-1 rounded bg-slate-700 px-3 py-2 text-sm text-white"
                        >
                          <Printer className="h-4 w-4" /> Print Receipt
                        </button>
                        <button
                          disabled={busyAction}
                          onClick={() => handleReceiptPrint(invoice, latestPayment, true)}
                          className="flex items-center gap-1 rounded border px-3 py-2 text-sm"
                        >
                          <Download className="h-4 w-4" /> Receipt PDF
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing;
