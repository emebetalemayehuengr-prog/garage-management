import React, { useState } from 'react';
import { Building2, Eye, ImagePlus, Pencil, Save, Stamp, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGarage } from '../../context/GarageContext';
import { readProfileImage } from '../../utils/imageUpload';
import { previewCompanyProfile } from '../../utils/print';

const EMPTY_PROFILE = {
  companyName: '',
  logo: '',
  address: '',
  phone: '',
  email: '',
  taxNumber: '',
  registrationNumber: '',
  bankInformation: '',
  ownerManagerName: '',
  stamp: '',
  invoiceFooter: '',
};

const CompanyProfile = () => {
  const { companyProfile, saveCompanyProfile } = useGarage();
  const [form, setForm] = useState(() => ({ ...EMPTY_PROFILE, ...(companyProfile || {}) }));
  const [editing, setEditing] = useState(!companyProfile);
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const uploadImage = async (field, file) => {
    try {
      update(field, await readProfileImage(file));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveCompanyProfile(form);
      setEditing(false);
      toast.success('Company profile saved');
    } catch (error) {
      toast.error(error.message || 'Unable to save company profile');
    } finally {
      setSaving(false);
    }
  };

  const imageField = (field, label, Icon) => (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
      <label className="mb-3 block text-sm font-semibold text-gray-700">{label}</label>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-32 items-center justify-center overflow-hidden rounded-lg border bg-white">
          {form[field] ? (
            <img src={form[field]} alt={label} className="h-full w-full object-contain" />
          ) : (
            <Icon className="h-9 w-9 text-gray-300" />
          )}
        </div>
        {editing && (
          <div className="space-y-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
              <ImagePlus className="h-4 w-4" />
              {form[field] ? `Replace ${label}` : `Upload ${label}`}
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(event) => uploadImage(field, event.target.files?.[0])}
              />
            </label>
            {form[field] && (
              <button
                type="button"
                onClick={() => update(field, '')}
                className="flex items-center gap-1 text-sm text-red-600"
              >
                <X className="h-4 w-4" /> Remove
              </button>
            )}
            <p className="text-xs text-gray-500">PNG/JPG, maximum 650 KB</p>
          </div>
        )}
      </div>
    </div>
  );

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-3xl font-bold text-gray-800">
            <Building2 className="h-8 w-8 text-blue-600" /> Company Profile
          </h2>
          <p className="mt-1 text-gray-500">
            Saved details are automatically used on invoices and receipts.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => previewCompanyProfile(form)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
          )}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="space-y-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {imageField('logo', 'Logo', Building2)}
          {imageField('stamp', 'Stamp', Stamp)}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['companyName', 'Garage / company name', 'text', true],
            ['ownerManagerName', 'Owner / manager name', 'text', true],
            ['phone', 'Phone number', 'tel', true],
            ['email', 'Email', 'email', true],
            ['taxNumber', 'Tax / VAT number', 'text', false],
            ['registrationNumber', 'Registration / license number', 'text', false],
          ].map(([field, label, type, required]) => (
            <label key={field} className="block text-sm font-semibold text-gray-700">
              {label}
              <input
                className={`${inputClass} mt-2`}
                type={type}
                required={required}
                disabled={!editing}
                value={form[field]}
                onChange={(event) => update(field, event.target.value)}
              />
            </label>
          ))}
        </div>
        {[
          ['address', 'Garage address', 3, true],
          ['bankInformation', 'Bank / payment information', 4, false],
          ['invoiceFooter', 'Optional invoice footer / message', 3, false],
        ].map(([field, label, rows, required]) => (
          <label key={field} className="block text-sm font-semibold text-gray-700">
            {label}
            <textarea
              className={`${inputClass} mt-2 resize-y`}
              rows={rows}
              required={required}
              disabled={!editing}
              value={form[field]}
              onChange={(event) => update(field, event.target.value)}
            />
          </label>
        ))}
        {editing && (
          <div className="flex justify-end gap-3 border-t pt-5">
            {companyProfile && (
              <button
                type="button"
                onClick={() => {
                  setForm({ ...EMPTY_PROFILE, ...companyProfile });
                  setEditing(false);
                }}
                className="rounded-lg border px-5 py-2.5 font-medium text-gray-700"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 font-medium text-white hover:bg-green-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CompanyProfile;
