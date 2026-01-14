/**
 * Float.js Form Hook
 * Modern form handling with validation
 */

import { useState, useCallback, useMemo, useRef } from 'react';

export type ValidationRule<T> = (value: T, formData: Record<string, any>) => string | undefined | Promise<string | undefined>;

export interface FieldConfig<T = any> {
  initialValue?: T;
  validate?: ValidationRule<T> | ValidationRule<T>[];
  transform?: (value: any) => T;
}

export interface FieldState<T = any> {
  value: T;
  error: string | undefined;
  touched: boolean;
  dirty: boolean;
}

export interface FloatFormOptions<T extends Record<string, any>> {
  initialValues?: Partial<T>;
  onSubmit: (values: T) => void | Promise<void>;
  onError?: (errors: Record<keyof T, string | undefined>) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FloatFormResult<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Field helpers
  register: (name: keyof T) => {
    value: any;
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: (e: React.FocusEvent<any>) => void;
    name: string;
  };
  
  // Actions
  setValue: (name: keyof T, value: any) => void;
  setError: (name: keyof T, error: string | undefined) => void;
  setTouched: (name: keyof T, touched?: boolean) => void;
  reset: (values?: Partial<T>) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  validate: () => Promise<boolean>;
  getFieldProps: (name: keyof T) => FieldState;
}

/**
 * Powerful form handling with validation
 * @example
 * const form = useFloatForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => await login(values)
 * });
 */
export function useFloatForm<T extends Record<string, any>>(
  options: FloatFormOptions<T>
): FloatFormResult<T> {
  const {
    initialValues = {} as Partial<T>,
    onSubmit,
    onError,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [values, setValues] = useState<T>(initialValues as T);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialValuesRef = useRef(initialValues);
  const validatorsRef = useRef<Map<keyof T, ValidationRule<any>[]>>(new Map());

  // Validate a single field
  const validateField = useCallback(async (name: keyof T, value: any): Promise<string | undefined> => {
    const validators = validatorsRef.current.get(name);
    if (!validators) return undefined;

    for (const validator of validators) {
      const error = await validator(value, values);
      if (error) return error;
    }
    return undefined;
  }, [values]);

  // Validate all fields
  const validate = useCallback(async (): Promise<boolean> => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [name] of validatorsRef.current) {
      const error = await validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Set a single value
  const setValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (validateOnChange) {
      validateField(name, value).then(error => {
        setErrors(prev => ({ ...prev, [name]: error }));
      });
    }
  }, [validateOnChange, validateField]);

  // Set error
  const setError = useCallback((name: keyof T, error: string | undefined) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  // Set touched
  const setTouched = useCallback((name: keyof T, isTouched = true) => {
    setTouchedState(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  // Reset form
  const reset = useCallback((newValues?: Partial<T>) => {
    setValues((newValues || initialValuesRef.current) as T);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, []);

  // Handle submit
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Touch all fields
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Record<keyof T, boolean>);
    setTouchedState(allTouched);

    setIsSubmitting(true);

    const isValid = await validate();
    
    if (isValid) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    } else if (onError) {
      onError(errors as Record<keyof T, string | undefined>);
    }

    setIsSubmitting(false);
  }, [values, validate, onSubmit, onError, errors]);

  // Register field
  const register = useCallback((name: keyof T) => {
    return {
      name: String(name),
      value: values[name] ?? '',
      onChange: (e: React.ChangeEvent<any>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setValue(name, value);
      },
      onBlur: () => {
        setTouched(name, true);
        if (validateOnBlur) {
          validateField(name, values[name]).then(error => {
            setErrors(prev => ({ ...prev, [name]: error }));
          });
        }
      },
    };
  }, [values, setValue, setTouched, validateOnBlur, validateField]);

  // Get field props
  const getFieldProps = useCallback((name: keyof T): FieldState => {
    return {
      value: values[name],
      error: errors[name],
      touched: touched[name] ?? false,
      dirty: values[name] !== initialValuesRef.current[name],
    };
  }, [values, errors, touched]);

  // Computed
  const isValid = useMemo(() => {
    return Object.values(errors).every(e => !e);
  }, [errors]);

  const isDirty = useMemo(() => {
    return Object.keys(values).some(
      key => values[key as keyof T] !== initialValuesRef.current[key as keyof T]
    );
  }, [values]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    register,
    setValue,
    setError,
    setTouched,
    reset,
    handleSubmit,
    validate,
    getFieldProps,
  };
}

// Built-in validators
export const validators = {
  required: (message = 'This field is required'): ValidationRule<any> => 
    (value) => {
      if (value === undefined || value === null || value === '') {
        return message;
      }
      return undefined;
    },

  email: (message = 'Invalid email address'): ValidationRule<string> => 
    (value) => {
      if (!value) return undefined;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? undefined : message;
    },

  minLength: (min: number, message?: string): ValidationRule<string> => 
    (value) => {
      if (!value) return undefined;
      return value.length >= min 
        ? undefined 
        : message || `Must be at least ${min} characters`;
    },

  maxLength: (max: number, message?: string): ValidationRule<string> => 
    (value) => {
      if (!value) return undefined;
      return value.length <= max 
        ? undefined 
        : message || `Must be at most ${max} characters`;
    },

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => 
    (value) => {
      if (!value) return undefined;
      return regex.test(value) ? undefined : message;
    },

  match: (field: string, message = 'Fields do not match'): ValidationRule<any> => 
    (value, formData) => value === formData[field] ? undefined : message,
};
