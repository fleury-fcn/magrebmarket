'use client';

import { useCallback, useState, type ChangeEvent } from "react";
import type { FormErrors } from "../types";

// eslint-disable-next-line no-unused-vars
type Validator<T> = (values: T) => FormErrors;

interface UseFormOptions<T> {
  initialValues: T;
  validate?: Validator<T>;
}

export function useForm<T>({
  initialValues,
  validate,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, type, value } = e.target;
      const checked = (e.target as HTMLInputElement).checked;
      setValues(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
      setErrors(prev => ({ ...prev, [name]: undefined }));
    },
  []);

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [String(field)]: undefined }));
  }, []);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = useCallback(
    (valuesToValidate?: Partial<T>): boolean => {
      if (!validate) return true;
      const errs = validate((valuesToValidate as T) ?? values);
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [validate, values],
  );

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const reset = useCallback((nextValues?: Partial<T>) => {
    setValues(nextValues ? { ...initialValues, ...nextValues } : initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
    validateForm,
    setFieldError,
    clearErrors,
    reset,
  };
}
