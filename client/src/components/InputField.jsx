import React, { useState } from 'react'
import { Icon } from '@iconify/react'

// Reusable input component with Formik integration, optional label, and password toggle
const InputField = ({ type, name, placeholder, formik, label }) => {
  const [showPassword, setShowPassword] = useState(false)
  const hasError = formik.touched[name] && formik.errors[name]
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-dark-slate">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          id={name}
          className={`w-full px-4 py-3 rounded-xl border text-dark-slate placeholder:text-gray-400 outline-none transition-all duration-200 bg-white text-sm ${hasError
              ? 'border-red-400 ring-4 ring-red-50'
              : 'border-gray-200 hover:border-dusty-green focus:border-forest-green focus:ring-4 focus:ring-forest-green/10'
            } ${isPassword ? 'pr-12' : ''}`}
          type={inputType}
          placeholder={placeholder}
          name={name}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-forest-green transition-colors p-1 rounded-lg hover:bg-forest-green/10"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} width="18" height="18" />
          </button>
        )}
      </div>
      {hasError && (
        <p className="text-xs text-red-500 flex items-center gap-1 animate-fade-in">
          <Icon icon="mdi:alert-circle-outline" width="13" height="13" />
          {formik.errors[name]}
        </p>
      )}
    </div>
  )
}

export default InputField
