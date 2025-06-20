'use client';

import React, { useState } from 'react';
import { SavedProperty, updateProperty, deleteProperty } from '@/lib/storage/properties';

interface SavedPropertiesTabProps {
  properties: SavedProperty[];
  onPropertiesChange: () => void;
  onEditProperty: (property: SavedProperty) => void;
}

export default function SavedPropertiesTab({
  properties,
  onPropertiesChange,
  onEditProperty
}: SavedPropertiesTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleEdit = (property: SavedProperty) => {
    setEditingId(property.id);
    setEditName(property.name);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateProperty(id, { name: editName.trim() });
      onPropertiesChange();
    }
    setEditingId(null);
    setEditName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      deleteProperty(id);
      onPropertiesChange();
    }
  };

  if (properties.length === 0) {
    return (
      <div className="text-center py-12" role="region" aria-label="Saved properties list">
        <div className="text-gray-400 mb-4" aria-hidden="true">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No saved properties</h3>
        <p className="text-gray-500">Save properties from the calculator to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Saved properties list">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Saved Properties</h2>
        <span className="text-sm text-gray-500" aria-live="polite">
          {properties.length}/3 properties
        </span>
      </div>

      <div className="space-y-3" role="list" aria-label="Property list">
        {properties.map((property) => (
          <div key={property.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm" role="listitem">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                {editingId === property.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Property name"
                      aria-label="Edit property name"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(property.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <button
                      onClick={() => handleSaveEdit(property.id)}
                      className="text-green-600 hover:text-green-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                      aria-label="Save property name"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                      aria-label="Cancel editing property name"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h3 className="font-medium text-gray-900">{property.name}</h3>
                )}

                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Home Price:</span>
                    <span className="ml-1 font-medium text-gray-900">${property.homePrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rate:</span>
                    <span className="ml-1 font-medium text-gray-900">{property.interestRate}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Down Payment:</span>
                    <span className="ml-1 font-medium text-gray-900">{property.downPaymentPercent}%</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Monthly Payment:</span>
                    <span className="ml-1 font-medium text-blue-600">${property.monthlyPayment.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  Saved on {property.createdAt.toLocaleDateString()}
                </div>
              </div>

              <div className="flex justify-center sm:justify-end space-x-2">
                <button
                  onClick={() => onEditProperty(property)}
                  className="text-blue-600 hover:text-blue-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  title="Load into calculator"
                  aria-label={`Load ${property.name} into calculator`}
                >
                  Load
                </button>
                <button
                  onClick={() => handleEdit(property)}
                  className="text-gray-600 hover:text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                  title="Rename property"
                  aria-label={`Rename ${property.name}`}
                >
                  Rename
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="text-red-600 hover:text-red-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  title="Delete property"
                  aria-label={`Delete ${property.name}`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 