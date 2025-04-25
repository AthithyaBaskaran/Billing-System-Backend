import * as yup from 'yup';

// Common field validations
export const commonValidations = {
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email address'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10,15}$/, 'Phone number must be 10-15 digits'),
  address: yup
    .mixed()
    .required('Address is required')
    .transform((value) => {
      // Handle string that might be a stringified JSON
      if (typeof value === 'string' && value.startsWith('{')) {
        try {
          const addressObj = JSON.parse(value);
          return addressObj.fullAddress || value;
        } catch (e) {
          return value;
        }
      }
      // Handle object with fullAddress property
      else if (typeof value === 'object' && value !== null && 'fullAddress' in value) {
        return value.fullAddress;
      }
      // Return as is for simple strings
      return value;
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  simplePassword: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  loyaltyPoints: yup
    .number()
    .transform((value, originalValue) => 
      originalValue === '' ? 0 : value
    )
    .min(0, 'Loyalty points must be a positive number')
    .nullable()
};

// Customer schema
export const customerSchema = yup.object({
  firstName: commonValidations.firstName,
  lastName: commonValidations.lastName,
  email: commonValidations.email,
  phone: commonValidations.phone,
  address: commonValidations.address,
  loyaltyPoints: commonValidations.loyaltyPoints.default(0)
});

// Login schema
export const loginSchema = yup.object({
  email: commonValidations.email,
  password: commonValidations.simplePassword
});

// Signup schema
export const signupSchema = yup.object({
  firstName: commonValidations.firstName,
  lastName: commonValidations.lastName,
  email: commonValidations.email,
  password: commonValidations.password,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  phone: commonValidations.phone,
  address: commonValidations.address
});

// Type definitions for form data
export type CustomerFormData = yup.InferType<typeof customerSchema>;
export type LoginFormData = yup.InferType<typeof loginSchema>;

// Custom SignupFormData type to handle address as either string or object
export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  address: string | { 
    id: string;
    fullAddress: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | any; // Allow any to handle various address formats
}