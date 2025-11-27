import { useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for debounced validation to improve performance
 * Prevents validation from running on every keystroke
 */
export const useDebouncedValidation = (
  validationFunction: (value: string) => string,
  delay: number = 300
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedValidate = useCallback(
    (value: string, setError: (error: string) => void) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for validation
      timeoutRef.current = setTimeout(() => {
        const error = validationFunction(value);
        setError(error);
      }, delay);
    },
    [validationFunction, delay]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clear validation immediately (useful for clearing errors on focus)
  const clearValidation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedValidate, clearValidation };
};

/**
 * Validation functions for common use cases
 */
export const validationFunctions = {
  email: (email: string): string => {
    if (!email) {
      return 'Email là bắt buộc';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Vui lòng nhập email hợp lệ';
    }
    return '';
  },

  password: (password: string): string => {
    if (!password) {
      return 'Mật khẩu là bắt buộc';
    }
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return '';
  },

  confirmPassword: (password: string, confirmPassword: string): string => {
    if (!confirmPassword) {
      return 'Xác nhận mật khẩu là bắt buộc';
    }
    if (password !== confirmPassword) {
      return 'Mật khẩu không khớp';
    }
    return '';
  },

  name: (name: string): string => {
    if (!name || name.trim().length === 0) {
      return 'Họ tên là bắt buộc';
    }
    if (name.trim().length < 2) {
      return 'Họ tên phải có ít nhất 2 ký tự';
    }
    return '';
  },

  required: (value: string, fieldName: string = 'Trường này'): string => {
    if (!value || value.trim().length === 0) {
      return `${fieldName} là bắt buộc`;
    }
    return '';
  },
};

export default useDebouncedValidation;