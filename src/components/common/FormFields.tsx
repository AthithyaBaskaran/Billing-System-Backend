import React from 'react';
import { 
  TextField, 
  Autocomplete, 
  TextFieldProps,
  AutocompleteProps
} from '@mui/material';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

// Common props for all form fields
interface BaseFormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

// Props for text input fields
interface TextInputProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  type?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  InputProps?: TextFieldProps['InputProps'];
}

// Props for autocomplete fields
interface AutocompleteFieldProps<T extends FieldValues, Option> extends BaseFormFieldProps<T> {
  options: Option[];
  getOptionLabel: (option: Option) => string;
  isOptionEqualToValue?: (option: Option, value: Option) => boolean;
  autocompleteProps?: Partial<AutocompleteProps<Option, false, false, false>>;
  placeholder?: string;
}

// Text input component
export const TextInput = <T extends FieldValues>({
  name,
  control,
  label,
  required = false,
  error = false,
  helperText,
  fullWidth = true,
  type = 'text',
  multiline = false,
  rows,
  placeholder,
  inputProps,
  InputProps
}: TextInputProps<T>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <TextField
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          name={name}
          inputRef={ref}
          label={label}
          required={required}
          fullWidth={fullWidth}
          error={error}
          helperText={helperText}
          type={type}
          multiline={multiline}
          rows={rows}
          placeholder={placeholder}
          inputProps={inputProps}
          InputProps={{
            ...InputProps,
            sx: { borderRadius: 1, ...(InputProps?.sx || {}) }
          }}
        />
      )}
    />
  );
};

// Autocomplete field component
export const AutocompleteField = <T extends FieldValues, Option,>({
  name,
  control,
  label,
  required = false,
  error = false,
  helperText,
  fullWidth = true,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  autocompleteProps,
  placeholder
}: AutocompleteFieldProps<T, Option>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <Autocomplete
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          value={value}
          onChange={(_, newValue) => {
            // If newValue is an object with fullAddress, extract it
            if (newValue && typeof newValue === 'object' && 'fullAddress' in newValue) {
              // Pass the entire object, but ensure it's properly handled
              onChange(newValue);
            } else {
              // For string values or null
              onChange(newValue);
            }
          }}
          onBlur={onBlur}
          fullWidth={fullWidth}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              required={required}
              error={error}
              helperText={helperText}
              placeholder={placeholder}
              inputRef={ref}
              InputProps={{
                ...params.InputProps,
                sx: { borderRadius: 1 }
              }}
            />
          )}
          {...autocompleteProps}
        />
      )}
    />
  );
};