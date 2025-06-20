'use client';

import React, { useState } from 'react';
import { SavedProperty } from '@/lib/storage/properties';

interface CompareTabProps {
  properties: SavedProperty[];
}

export default function CompareTab({ properties }: CompareTabProps) {
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const handlePropertyToggle = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : prev.length < 3
          ? [...prev, propertyId]
          : prev
    );
  };

  const selectedPropertyData = properties.filter(p => selectedProperties.includes(p.id));

  if (properties.length === 0) {
    return (
      <div className="text-center py-12" role="region" aria-label="Property comparison">
        <div className="text-gray-400 mb-4" aria-hidden="true">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties to compare</h3>
        <p className="text-gray-500">Save properties first to compare them side by side</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Property comparison">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Compare Properties</h2>

        {/* Property Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Select properties to compare (up to 3):</h3>
          <div className="space-y-2" role="group" aria-label="Property selection">
            {properties.map((property) => (
              <label key={property.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProperties.includes(property.id)}
                  onChange={() => handlePropertyToggle(property.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  disabled={!selectedProperties.includes(property.id) && selectedProperties.length >= 3}
                  aria-label={`Select ${property.name} for comparison`}
                />
                <span className="text-sm text-gray-900">{property.name}</span>
                <span className="text-sm text-gray-500">
                  (${property.monthlyPayment.toFixed(2)}/month)
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedPropertyData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Property comparison table">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                      Property
                    </th>
                    {selectedPropertyData.map((property) => (
                      <th key={property.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col">
                        {property.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" scope="row">
                      Home Price
                    </td>
                    {selectedPropertyData.map((property) => (
                      <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${property.homePrice.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" scope="row">
                      Interest Rate
                    </td>
                    {selectedPropertyData.map((property) => (
                      <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.interestRate}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" scope="row">
                      Down Payment
                    </td>
                    {selectedPropertyData.map((property) => (
                      <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {property.downPaymentPercent}%
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" scope="row">
                      Annual Taxes
                    </td>
                    {selectedPropertyData.map((property) => (
                      <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${property.annualTaxAmount.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" scope="row">
                      Annual Insurance
                    </td>
                    {selectedPropertyData.map((property) => (
                      <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${property.annualInsuranceAmount.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900" scope="row">
                      Monthly Payment
                    </td>
                    {selectedPropertyData.map((property) => (
                      <td key={property.id} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                        ${property.monthlyPayment.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {selectedPropertyData.length > 1 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg" role="region" aria-label="Comparison summary">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Summary:</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Lowest Payment:</span>
                <span className="ml-1 font-medium text-green-600">
                  ${Math.min(...selectedPropertyData.map(p => p.monthlyPayment)).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Highest Payment:</span>
                <span className="ml-1 font-medium text-red-600">
                  ${Math.max(...selectedPropertyData.map(p => p.monthlyPayment)).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Payment Difference:</span>
                <span className="ml-1 font-medium text-gray-800">
                  ${(Math.max(...selectedPropertyData.map(p => p.monthlyPayment)) -
                    Math.min(...selectedPropertyData.map(p => p.monthlyPayment))).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 