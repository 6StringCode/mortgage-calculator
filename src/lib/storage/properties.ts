export interface SavedProperty {
  id: string;
  name: string;
  homePrice: number;
  interestRate: number;
  downPaymentPercent: number;
  annualTaxAmount: number;
  annualInsuranceAmount: number;
  monthlyPayment: number;
  createdAt: Date;
}

const STORAGE_KEY = 'mortgage-calculator-properties';
const MAX_PROPERTIES = 3;

export function saveProperty(property: Omit<SavedProperty, 'id' | 'createdAt'>): boolean {
  try {
    const properties = getSavedProperties();

    if (properties.length >= MAX_PROPERTIES) {
      return false; // Cannot save more than 3 properties
    }

    const newProperty: SavedProperty = {
      ...property,
      id: generateId(),
      createdAt: new Date()
    };

    const updatedProperties = [...properties, newProperty];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProperties));
    return true;
  } catch (error) {
    console.error('Failed to save property:', error);
    return false;
  }
}

export function getSavedProperties(): SavedProperty[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const properties = JSON.parse(stored) as Array<SavedProperty & { createdAt: string }>;
    return properties.map((prop) => ({
      ...prop,
      createdAt: new Date(prop.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load properties:', error);
    return [];
  }
}

export function updateProperty(id: string, updates: Partial<SavedProperty>): boolean {
  try {
    const properties = getSavedProperties();
    const index = properties.findIndex(p => p.id === id);

    if (index === -1) return false;

    properties[index] = { ...properties[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
    return true;
  } catch (error) {
    console.error('Failed to update property:', error);
    return false;
  }
}

export function deleteProperty(id: string): boolean {
  try {
    const properties = getSavedProperties();
    const filtered = properties.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete property:', error);
    return false;
  }
}

export function canSaveMoreProperties(): boolean {
  return getSavedProperties().length < MAX_PROPERTIES;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
} 