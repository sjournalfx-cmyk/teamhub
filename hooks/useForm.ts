import React, { useState, useCallback, useMemo } from 'react';

// Validation rule types
type ValidationRule<T> = {
    validate: (value: T, allValues?: Record<string, any>) => boolean;
    message: string;
};

type FieldConfig<T> = {
    initialValue: T;
    rules?: ValidationRule<T>[];
};

type FormConfig = Record<string, FieldConfig<any>>;

type FormValues<T extends FormConfig> = {
    [K in keyof T]: T[K]['initialValue'];
};

type FormErrors<T extends FormConfig> = {
    [K in keyof T]?: string;
};

type FormTouched<T extends FormConfig> = {
    [K in keyof T]?: boolean;
};

interface UseFormReturn<T extends FormConfig> {
    values: FormValues<T>;
    errors: FormErrors<T>;
    touched: FormTouched<T>;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
    setValue: <K extends keyof T>(field: K, value: T[K]['initialValue']) => void;
    setValues: (values: Partial<FormValues<T>>) => void;
    setTouched: (field: keyof T) => void;
    setError: (field: keyof T, message: string) => void;
    clearError: (field: keyof T) => void;
    validate: () => boolean;
    validateField: (field: keyof T) => boolean;
    reset: () => void;
    handleSubmit: (onSubmit: (values: FormValues<T>) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
}

/**
 * Custom hook for form state management and validation
 */
export function useForm<T extends FormConfig>(config: T): UseFormReturn<T> {
    // Extract initial values from config
    const initialValues = useMemo(() => {
        const values = {} as FormValues<T>;
        for (const key in config) {
            values[key as keyof T] = config[key].initialValue;
        }
        return values;
    }, []);

    const [values, setValuesState] = useState<FormValues<T>>(initialValues);
    const [errors, setErrors] = useState<FormErrors<T>>({});
    const [touched, setTouchedState] = useState<FormTouched<T>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isDirty = useMemo(() => {
        for (const key in values) {
            if (values[key] !== initialValues[key]) {
                return true;
            }
        }
        return false;
    }, [values, initialValues]);

    const validateField = useCallback((field: keyof T): boolean => {
        const fieldConfig = config[field as string];
        const value = values[field];
        const rules = fieldConfig.rules || [];

        for (const rule of rules) {
            if (!rule.validate(value, values as Record<string, any>)) {
                setErrors(prev => ({ ...prev, [field]: rule.message }));
                return false;
            }
        }

        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
        return true;
    }, [config, values]);

    const validate = useCallback((): boolean => {
        let isValid = true;
        const newErrors: FormErrors<T> = {};

        for (const field in config) {
            const fieldConfig = config[field];
            const value = values[field as keyof T];
            const rules = fieldConfig.rules || [];

            for (const rule of rules) {
                if (!rule.validate(value, values as Record<string, any>)) {
                    newErrors[field as keyof T] = rule.message;
                    isValid = false;
                    break;
                }
            }
        }

        setErrors(newErrors);
        return isValid;
    }, [config, values]);

    const isValid = useMemo(() => {
        for (const field in config) {
            const fieldConfig = config[field];
            const value = values[field as keyof T];
            const rules = fieldConfig.rules || [];

            for (const rule of rules) {
                if (!rule.validate(value, values as Record<string, any>)) {
                    return false;
                }
            }
        }
        return true;
    }, [config, values]);

    const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]['initialValue']) => {
        setValuesState(prev => ({ ...prev, [field]: value }));
    }, []);

    const setValuesBulk = useCallback((newValues: Partial<FormValues<T>>) => {
        setValuesState(prev => ({ ...prev, ...newValues }));
    }, []);

    const setTouched = useCallback((field: keyof T) => {
        setTouchedState(prev => ({ ...prev, [field]: true }));
    }, []);

    const setError = useCallback((field: keyof T, message: string) => {
        setErrors(prev => ({ ...prev, [field]: message }));
    }, []);

    const clearError = useCallback((field: keyof T) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    }, []);

    const reset = useCallback(() => {
        setValuesState(initialValues);
        setErrors({});
        setTouchedState({});
        setIsSubmitting(false);
    }, [initialValues]);

    const handleSubmit = useCallback(
        (onSubmit: (values: FormValues<T>) => Promise<void> | void) => {
            return async (e?: React.FormEvent) => {
                e?.preventDefault();

                // Mark all fields as touched
                const allTouched = {} as FormTouched<T>;
                for (const key in config) {
                    allTouched[key as keyof T] = true;
                }
                setTouchedState(allTouched);

                // Validate all fields
                if (!validate()) {
                    return;
                }

                setIsSubmitting(true);
                try {
                    await onSubmit(values);
                } finally {
                    setIsSubmitting(false);
                }
            };
        },
        [config, validate, values]
    );

    return {
        values,
        errors,
        touched,
        isValid,
        isDirty,
        isSubmitting,
        setValue,
        setValues: setValuesBulk,
        setTouched,
        setError,
        clearError,
        validate,
        validateField,
        reset,
        handleSubmit
    };
}

// =============================================
// Common Validation Rules
// =============================================

export const validators = {
    required: (message = 'This field is required'): ValidationRule<any> => ({
        validate: (value) => {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim().length > 0;
            if (Array.isArray(value)) return value.length > 0;
            return true;
        },
        message
    }),

    email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
        validate: (value) => {
            if (!value) return true; // Allow empty (combine with required if needed)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value);
        },
        message
    }),

    minLength: (min: number, message?: string): ValidationRule<string> => ({
        validate: (value) => !value || value.length >= min,
        message: message || `Must be at least ${min} characters`
    }),

    maxLength: (max: number, message?: string): ValidationRule<string> => ({
        validate: (value) => !value || value.length <= max,
        message: message || `Must be no more than ${max} characters`
    }),

    min: (min: number, message?: string): ValidationRule<number> => ({
        validate: (value) => value === undefined || value === null || value >= min,
        message: message || `Must be at least ${min}`
    }),

    max: (max: number, message?: string): ValidationRule<number> => ({
        validate: (value) => value === undefined || value === null || value <= max,
        message: message || `Must be no more than ${max}`
    }),

    pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule<string> => ({
        validate: (value) => !value || regex.test(value),
        message
    }),

    matches: (fieldName: string, message?: string): ValidationRule<any> => ({
        validate: (value, allValues) => {
            if (!allValues) return true;
            return value === allValues[fieldName];
        },
        message: message || `Must match ${fieldName}`
    }),

    custom: <T>(validateFn: (value: T, allValues?: Record<string, any>) => boolean, message: string): ValidationRule<T> => ({
        validate: validateFn,
        message
    })
};

export default useForm;
