'use client';

import { useState } from 'react';

export function useSessionStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.error('Error reading sessionStorage key:', key, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Si el valor es una función, llámala con el estado anterior
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Guardar el estado en sessionStorage
      setStoredValue(valueToStore);
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting sessionStorage key:', key, error);
    }
  };

  const removeValue = () => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing sessionStorage key:', key, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}
