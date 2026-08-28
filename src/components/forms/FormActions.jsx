import React from 'react';

export function FormActions({ onSubmit, onCancel, submitLabel, cancelLabel, submitColor = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
  };

  return (
    <div className="flex space-x-4 pt-2">
      <button
        type="submit"
        className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition shadow-sm ${colorClasses[submitColor] || colorClasses.blue}`}
      >
        {submitLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
