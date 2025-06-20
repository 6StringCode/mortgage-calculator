'use client';

import React, { useState, useEffect } from 'react';
import { SavedProperty, saveProperty, getSavedProperties, canSaveMoreProperties } from '@/lib/storage/properties';
import SavedPropertiesTab from '@/components/SavedPropertiesTab';
import CompareTab from '@/components/CompareTab';

interface FormErrors {
  homePrice?: string;
  interestRate?: string;
  annualTaxAmount?: string;
  annualInsuranceAmount?: string;
  downPaymentPercent?: string;
  propertyName?: string;
  general?: string;
}

interface MortgageRateData {
  rate: number;
  date: string;
  source: string;
}

type TabType = 'calculator' | 'saved' | 'compare';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('calculator');
  const [homePrice, setHomePrice] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('6.5'); // Default fallback rate
  const [annualTaxAmount, setAnnualTaxAmount] = useState<string>('');
  const [annualInsuranceAmount, setAnnualInsuranceAmount] = useState<string>('');
  const [downPaymentPercent, setDownPaymentPercent] = useState<string>('20');
  const [downPaymentAmount, setDownPaymentAmount] = useState<string>('');
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rateData, setRateData] = useState<MortgageRateData | null>(null);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(true);
  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [propertyName, setPropertyName] = useState<string>('');
  const [showSaveForm, setShowSaveForm] = useState<boolean>(false);

  // Fetch current mortgage rate on component mount
  useEffect(() => {
    const fetchCurrentRate = async () => {
      try {
        setIsLoadingRate(true);
        const response = await fetch('/api/mortgage-rate');
        if (response.ok) {
          const data: MortgageRateData = await response.json();
          setRateData(data);
          setInterestRate(data.rate.toString());
        } else {
          console.warn('Failed to fetch current rate, using fallback');
        }
      } catch (error) {
        console.warn('Error fetching current rate:', error);
      } finally {
        setIsLoadingRate(false);
      }
    };

    fetchCurrentRate();
  }, []);

  // Load saved properties
  useEffect(() => {
    setSavedProperties(getSavedProperties());
  }, []);

  // Calculate down payment amount when home price or percentage changes
  useEffect(() => {
    if (homePrice && downPaymentPercent) {
      const amount = (parseFloat(homePrice) * parseFloat(downPaymentPercent)) / 100;
      setDownPaymentAmount(amount.toFixed(2));
    }
  }, [homePrice, downPaymentPercent]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    // Validate Home Price
    if (!homePrice) {
      newErrors.homePrice = 'Home price is required';
      isValid = false;
    } else if (parseFloat(homePrice) <= 0) {
      newErrors.homePrice = 'Home price must be greater than 0';
      isValid = false;
    }

    // Validate Interest Rate
    if (!interestRate) {
      newErrors.interestRate = 'Interest rate is required';
      isValid = false;
    } else if (parseFloat(interestRate) <= 0 || parseFloat(interestRate) > 100) {
      newErrors.interestRate = 'Interest rate must be between 0 and 100';
      isValid = false;
    }

    // Validate Annual Tax Amount
    if (!annualTaxAmount) {
      newErrors.annualTaxAmount = 'Annual tax amount is required';
      isValid = false;
    } else if (parseFloat(annualTaxAmount) < 0) {
      newErrors.annualTaxAmount = 'Annual tax amount cannot be negative';
      isValid = false;
    }

    // Validate Annual Insurance Amount
    if (!annualInsuranceAmount) {
      newErrors.annualInsuranceAmount = 'Annual insurance amount is required';
      isValid = false;
    } else if (parseFloat(annualInsuranceAmount) < 0) {
      newErrors.annualInsuranceAmount = 'Annual insurance amount cannot be negative';
      isValid = false;
    }

    // Validate Down Payment Percentage
    if (!downPaymentPercent) {
      newErrors.downPaymentPercent = 'Down payment percentage is required';
      isValid = false;
    } else if (parseFloat(downPaymentPercent) < 0 || parseFloat(downPaymentPercent) > 100) {
      newErrors.downPaymentPercent = 'Down payment percentage must be between 0 and 100';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors and results
    setErrors({});
    setMonthlyPayment(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Simulate API call or complex calculation
      await new Promise(resolve => setTimeout(resolve, 500));

      const principal = parseFloat(homePrice) - parseFloat(downPaymentAmount);
      const rate = parseFloat(interestRate) / 100 / 12;
      const term = 30 * 12;
      const annualTax = parseFloat(annualTaxAmount);
      const annualInsurance = parseFloat(annualInsuranceAmount);

      const monthlyMortgage = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      const monthlyTax = annualTax / 12;
      const monthlyInsurance = annualInsurance / 12;
      const totalMonthly = monthlyMortgage + monthlyTax + monthlyInsurance;

      setMonthlyPayment(totalMonthly);
    } catch {
      setErrors({
        ...errors,
        general: 'An error occurred during calculation. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProperty = () => {
    if (!monthlyPayment) {
      setErrors({ general: 'Please calculate a payment first' });
      return;
    }

    if (!propertyName.trim()) {
      setErrors({ propertyName: 'Property name is required' });
      return;
    }

    if (!canSaveMoreProperties()) {
      setErrors({ general: 'You can only save up to 3 properties. Please delete one first.' });
      return;
    }

    const success = saveProperty({
      name: propertyName.trim(),
      homePrice: parseFloat(homePrice),
      interestRate: parseFloat(interestRate),
      downPaymentPercent: parseFloat(downPaymentPercent),
      annualTaxAmount: parseFloat(annualTaxAmount),
      annualInsuranceAmount: parseFloat(annualInsuranceAmount),
      monthlyPayment
    });

    if (success) {
      setPropertyName('');
      setShowSaveForm(false);
      setSavedProperties(getSavedProperties());
      setErrors({});
    } else {
      setErrors({ general: 'Failed to save property. Please try again.' });
    }
  };

  const handleLoadProperty = (property: SavedProperty) => {
    setHomePrice(property.homePrice.toString());
    setInterestRate(property.interestRate.toString());
    setDownPaymentPercent(property.downPaymentPercent.toString());
    setAnnualTaxAmount(property.annualTaxAmount.toString());
    setAnnualInsuranceAmount(property.annualInsuranceAmount.toString());
    setMonthlyPayment(property.monthlyPayment);
    setActiveTab('calculator');
    setErrors({});
  };

  const handlePropertiesChange = () => {
    setSavedProperties(getSavedProperties());
  };

  const renderCalculatorTab = () => (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        aria-label="Mortgage calculator form"
        noValidate
      >
        <div>
          <label htmlFor="homePrice" className="block text-sm font-medium text-gray-700">
            Home Price ($)
          </label>
          <input
            type="number"
            id="homePrice"
            value={homePrice}
            onChange={(e) => {
              setHomePrice(e.target.value);
              setErrors(prev => ({ ...prev, homePrice: undefined }));
            }}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${errors.homePrice ? 'border-red-500' : ''
              }`}
            placeholder="Enter home price"
            aria-required="true"
            min="0"
            step="1000"
            aria-label="Home price in dollars"
            aria-invalid={!!errors.homePrice}
            aria-describedby={errors.homePrice ? 'homePrice-error' : undefined}
          />
          {errors.homePrice && (
            <p id="homePrice-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.homePrice}
            </p>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="block text-sm font-medium text-gray-700">
            Down Payment
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="downPaymentPercent" className="block text-xs text-gray-500">
                Percentage (%)
              </label>
              <input
                type="number"
                id="downPaymentPercent"
                value={downPaymentPercent}
                onChange={(e) => {
                  setDownPaymentPercent(e.target.value);
                  setErrors(prev => ({ ...prev, downPaymentPercent: undefined }));
                }}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${errors.downPaymentPercent ? 'border-red-500' : ''
                  }`}
                placeholder="20"
                step="0.1"
                min="0"
                max="100"
                aria-label="Down payment percentage"
                aria-invalid={!!errors.downPaymentPercent}
                aria-describedby={errors.downPaymentPercent ? 'downPaymentPercent-error' : undefined}
              />
              {errors.downPaymentPercent && (
                <p id="downPaymentPercent-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.downPaymentPercent}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="downPaymentAmount" className="block text-xs text-gray-500">
                Amount ($)
              </label>
              <input
                type="number"
                id="downPaymentAmount"
                value={downPaymentAmount}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-black"
                placeholder="0.00"
                aria-label="Calculated down payment amount"
                aria-readonly="true"
              />
            </div>
          </div>
        </fieldset>

        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">
            Interest Rate (%)
          </label>
          <div className="relative">
            <input
              type="number"
              id="interestRate"
              value={interestRate}
              onChange={(e) => {
                setInterestRate(e.target.value);
                setErrors(prev => ({ ...prev, interestRate: undefined }));
              }}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${errors.interestRate ? 'border-red-500' : ''
                }`}
              placeholder="Enter interest rate"
              step="0.01"
              min="0"
              max="100"
              aria-label="Interest rate percentage"
              aria-invalid={!!errors.interestRate}
              aria-describedby={errors.interestRate ? 'interestRate-error' : undefined}
              disabled={isLoadingRate}
            />
            {isLoadingRate && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {errors.interestRate && (
            <p id="interestRate-error" className="mt-1 text-sm text-red-600" role="alert">
              {errors.interestRate}
            </p>
          )}
          <div className="mt-1 text-xs text-gray-500" aria-live="polite">
            {isLoadingRate ? (
              'Loading current mortgage rate...'
            ) : rateData ? (
              <>
                Current 30-year fixed rate: {rateData.rate}% (as of {new Date(rateData.date).toLocaleDateString()})
                <br />
                <span className="text-gray-400">Source: {rateData.source}</span>
              </>
            ) : (
              'Current average 30-year fixed rate (fallback data)'
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="annualTaxAmount" className="block text-sm font-medium text-gray-700">
              Annual Property Tax ($)
            </label>
            <input
              type="number"
              id="annualTaxAmount"
              value={annualTaxAmount}
              onChange={(e) => {
                setAnnualTaxAmount(e.target.value);
                setErrors(prev => ({ ...prev, annualTaxAmount: undefined }));
              }}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${errors.annualTaxAmount ? 'border-red-500' : ''
                }`}
              placeholder="Enter annual tax amount"
              aria-required="true"
              min="0"
              step="100"
              aria-label="Annual property tax amount"
              aria-invalid={!!errors.annualTaxAmount}
              aria-describedby={errors.annualTaxAmount ? 'annualTaxAmount-error' : undefined}
            />
            {errors.annualTaxAmount && (
              <p id="annualTaxAmount-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.annualTaxAmount}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="annualInsuranceAmount" className="block text-sm font-medium text-gray-700">
              Annual Insurance ($)
            </label>
            <input
              type="number"
              id="annualInsuranceAmount"
              value={annualInsuranceAmount}
              onChange={(e) => {
                setAnnualInsuranceAmount(e.target.value);
                setErrors(prev => ({ ...prev, annualInsuranceAmount: undefined }));
              }}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${errors.annualInsuranceAmount ? 'border-red-500' : ''
                }`}
              placeholder="Enter annual insurance amount"
              aria-required="true"
              min="0"
              step="100"
              aria-label="Annual insurance amount"
              aria-invalid={!!errors.annualInsuranceAmount}
              aria-describedby={errors.annualInsuranceAmount ? 'annualInsuranceAmount-error' : undefined}
            />
            {errors.annualInsuranceAmount && (
              <p id="annualInsuranceAmount-error" className="mt-1 text-sm text-red-600" role="alert">
                {errors.annualInsuranceAmount}
              </p>
            )}
          </div>
        </div>

        {errors.general && (
          <div
            className="p-3 bg-red-50 text-red-700 rounded-md"
            role="alert"
            aria-live="assertive"
          >
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Calculate monthly mortgage payment"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating...
            </span>
          ) : (
            'Calculate Monthly Payment'
          )}
        </button>
      </form>

      {monthlyPayment !== null && (
        <div
          className="mt-6 p-4 bg-gray-50 rounded-md"
          role="region"
          aria-label="Monthly payment result"
        >
          <h2 className="text-lg font-semibold text-gray-800">Monthly Payment</h2>
          <p
            className="text-2xl font-bold text-blue-600"
            aria-live="polite"
          >
            ${monthlyPayment.toFixed(2)}
          </p>

          {canSaveMoreProperties() && (
            <div className="mt-4">
              {!showSaveForm ? (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Save This Property
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="propertyName" className="block text-sm font-medium text-gray-700">
                      Property Name
                    </label>
                    <input
                      type="text"
                      id="propertyName"
                      value={propertyName}
                      onChange={(e) => {
                        setPropertyName(e.target.value);
                        setErrors(prev => ({ ...prev, propertyName: undefined }));
                      }}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black ${errors.propertyName ? 'border-red-500' : ''}`}
                      placeholder="e.g., Dream Home, Investment Property"
                      aria-invalid={!!errors.propertyName}
                      aria-describedby={errors.propertyName ? 'propertyName-error' : undefined}
                    />
                    {errors.propertyName && (
                      <p id="propertyName-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.propertyName}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProperty}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Save Property
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveForm(false);
                        setPropertyName('');
                        setErrors(prev => ({ ...prev, propertyName: undefined }));
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <main className="min-h-screen p-8 bg-gray-50" role="main">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Mortgage Calculator</h1>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Mortgage calculator tabs">
            <button
              onClick={() => setActiveTab('calculator')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTab('calculator');
                }
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeTab === 'calculator'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              aria-selected={activeTab === 'calculator'}
              role="tab"
              aria-controls="calculator-panel"
              id="calculator-tab"
            >
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTab('saved');
                }
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeTab === 'saved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              aria-selected={activeTab === 'saved'}
              role="tab"
              aria-controls="saved-panel"
              id="saved-tab"
            >
              Saved Properties ({savedProperties.length}/3)
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTab('compare');
                }
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${activeTab === 'compare'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              aria-selected={activeTab === 'compare'}
              role="tab"
              aria-controls="compare-panel"
              id="compare-tab"
            >
              Compare
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div
              id="calculator-panel"
              role="tabpanel"
              aria-labelledby="calculator-tab"
              className={activeTab === 'calculator' ? 'block' : 'hidden'}
            >
              {renderCalculatorTab()}
            </div>
            <div
              id="saved-panel"
              role="tabpanel"
              aria-labelledby="saved-tab"
              className={activeTab === 'saved' ? 'block' : 'hidden'}
            >
              <SavedPropertiesTab
                properties={savedProperties}
                onPropertiesChange={handlePropertiesChange}
                onEditProperty={handleLoadProperty}
              />
            </div>
            <div
              id="compare-panel"
              role="tabpanel"
              aria-labelledby="compare-tab"
              className={activeTab === 'compare' ? 'block' : 'hidden'}
            >
              <CompareTab properties={savedProperties} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 