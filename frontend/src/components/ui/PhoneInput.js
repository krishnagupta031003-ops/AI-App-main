/**
 * PhoneInput Component
 * Professional phone input matching other input styling exactly
 */

'use client';

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import PhoneInput2 from 'react-phone-input-2';
import { getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';
import 'react-phone-input-2/lib/style.css';

const DEFAULT_MAX_LENGTH = 15;

// Memoized cache so we don't recompute per keystroke.
const maxLengthCache = {};

// Returns the correct mobile-number max length for ANY country, using
// Google's official phone number metadata (via libphonenumber-js) instead
// of react-phone-input-2's unreliable/unavailable format data.
function getMaxLengthForCountry(iso2) {
  if (!iso2) return DEFAULT_MAX_LENGTH;
  const code = iso2.toUpperCase();

  if (maxLengthCache[code] !== undefined) {
    return maxLengthCache[code];
  }

  let length = DEFAULT_MAX_LENGTH;
  try {
    const example = getExampleNumber(code, examples);
    if (example && example.nationalNumber) {
      length = example.nationalNumber.length;
    }
  } catch {
    // keep default if the country code isn't recognized
  }

  maxLengthCache[code] = length;
  return length;
}

export default function PhoneInput({
  value,
  onChange,
  label,
  error,
  disabled = false,
  required = false
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const hasError = !!error;

  const [dialCode, setDialCode] = useState('91');
  const [inputMaxLength, setInputMaxLength] = useState(getMaxLengthForCountry('in'));

  const handleOnChange = (val, country, e, formattedValue) => {
    let maxLength = inputMaxLength;

    if (country) {
      if (country.dialCode) {
        setDialCode(country.dialCode);
      }
      if (country.countryCode) {
        maxLength = getMaxLengthForCountry(country.countryCode);
        setInputMaxLength(maxLength);
      }
    }

    const digitsOnly = val.replace(/\D/g, '');

    let numberOnly = digitsOnly;
    const dialCodeDigits = country?.dialCode?.replace(/\D/g, '') || '';
    if (dialCodeDigits && digitsOnly.startsWith(dialCodeDigits)) {
      numberOnly = digitsOnly.slice(dialCodeDigits.length);
    }

    const limitedNumber = numberOnly.slice(0, maxLength);

    if (onChange) {
      onChange(limitedNumber, country, e, formattedValue);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
      )}

      <div className={`phone-input-wrapper ${hasError ? 'has-error' : ''}`}>
        <div
          className="dial-code-overlay absolute z-10 flex items-center justify-center pointer-events-none"
          style={{
            left: '52px',
            top: '1px',
            bottom: '1px',
            width: '38px',
            borderRight: `1px solid ${isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(226, 232, 240, 0.9)'}`,
            color: isDark ? 'rgb(248, 250, 252)' : 'rgb(2, 6, 23)',
            fontSize: '15px',
            fontWeight: '500',
            backgroundColor: 'transparent'
          }}
        >
          +{dialCode}
        </div>

        <PhoneInput2
          country={'in'}
          value={value}
          onChange={handleOnChange}
          disabled={disabled}
          enableSearch={true}
          disableSearchIcon={false}
          disableCountryCode={true}
          disableCountryGuess={true}
          autoFormat={false}
          containerClass="phone-container"
          inputClass="phone-field"
          buttonClass="phone-flag-button"
          dropdownClass="phone-dropdown"
          searchClass="phone-search"
          inputProps={{
            required: required,
            name: 'phone',
            placeholder: '9876543210',
            maxLength: inputMaxLength // native, browser-enforced — works even if parent re-render lags
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-rose-500 dark:text-rose-400">{error}</p>
      )}

      <style jsx global>{`
        .phone-input-wrapper {
          position: relative;
        }

        .phone-input-wrapper .phone-container {
          width: 100%;
          position: relative;
          z-index: 2 !important;
        }

        .phone-input-wrapper:has(.phone-dropdown) .dial-code-overlay {
          visibility: hidden;
        }

        .phone-input-wrapper .phone-field {
          width: 100% !important;
          height: 44px !important;
          padding: 10px 16px 10px 106px !important;
          font-size: 15px !important;
          line-height: 1.5 !important;
          border-radius: 12px !important;
          border: 1px solid ${isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(226, 232, 240, 0.9)'} !important;
          background-color: ${isDark ? 'rgba(2, 6, 23, 0.6)' : 'rgba(255, 255, 255, 0.95)'} !important;
          color: ${isDark ? 'rgb(248, 250, 252)' : 'rgb(2, 6, 23)'} !important;
          transition: all 0.2s ease !important;
          font-family: inherit !important;
        }

        @media (min-width: 640px) {
          .phone-input-wrapper .phone-field {
            height: 48px !important;
            padding: 12px 16px 12px 106px !important;
            font-size: 16px !important;
          }
        }

        .phone-input-wrapper.has-error .phone-field {
          border-color: rgb(251, 113, 133) !important;
        }

        .phone-input-wrapper:not(.has-error) .phone-field:hover {
           border-color: ${isDark ? 'rgb(71, 85, 105)' : 'rgb(203, 213, 225)'} !important;
        }

        .phone-input-wrapper .phone-field:focus {
          outline: none !important;
          border-color: transparent !important;
          box-shadow: 0 0 0 2px ${isDark ? 'rgba(34, 211, 238, 0.7)' : 'rgba(34, 211, 238, 0.7)'} !important;
        }

        .phone-input-wrapper.has-error .phone-field:focus {
          box-shadow: 0 0 0 2px rgba(251, 113, 133, 1) !important;
        }

        .phone-input-wrapper .phone-field:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
        }

        .phone-input-wrapper .phone-field::placeholder {
          color: ${isDark ? 'rgb(100, 116, 139)' : 'rgb(148, 163, 184)'} !important;
        }

        .phone-input-wrapper .phone-flag-button {
          position: absolute !important;
          left: 1px !important;
          top: 1px !important;
          bottom: 1px !important;
          width: 90px !important;
          background: transparent !important;
          border: none !important;
          border-radius: 11px 0 0 11px !important;
          padding: 0 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          transition: background-color 0.2s ease !important;
        }

        .phone-input-wrapper .phone-flag-button:hover,
        .phone-input-wrapper .phone-flag-button:focus {
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'} !important;
        }

        .phone-input-wrapper .phone-flag-button .selected-flag {
          position: relative !important;
          width: 45px !important;
          height: 100% !important;
          padding: 0 0 0 12px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 4px !important;
          background: transparent !important;
        }

        .phone-input-wrapper .phone-flag-button .flag {
          transform: scale(1.4) !important;
          margin: -3px 0 0 0 !important;
        }

        .phone-input-wrapper .phone-flag-button .arrow {
          border: none !important;
          width: 0 !important;
          height: 0 !important;
          border-left: 3px solid transparent !important;
          border-right: 3px solid transparent !important;
          border-top: 4px solid ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} !important;
          margin: 0 !important;
          position: relative !important;
          top: 1px !important;
        }

        .phone-input-wrapper .phone-flag-button .arrow.up {
          border-top: none !important;
          border-bottom: 4px solid ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} !important;
          top: -1px !important;
        }

        .phone-input-wrapper .phone-dropdown {
  background-color: ${isDark ? 'rgb(2, 6, 23)' : 'white'} !important;
  border: 1px solid ${isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(226, 232, 240, 0.9)'} !important;
  border-radius: 12px !important;
  box-shadow: ${isDark ? '0 20px 60px rgba(0, 0, 0, 0.4)' : '0 20px 60px rgba(0, 0, 0, 0.15)'} !important;
  max-height: 300px !important;
  margin-top: 8px !important;
  padding: 4px !important;
  width: max(280px, 100%) !important;      /* pehle: width: 300px !important */
  max-width: calc(100vw - 40px) !important; /* screen se bahar kabhi nahi jaayega */
  left: 0 !important;                       /* container ke andar align rahega */
  right: auto !important;
  z-index: 50 !important;
  overflow: auto !important;
}
        .phone-input-wrapper .phone-dropdown .country {
          padding: 10px 12px !important;
          color: ${isDark ? 'rgb(248, 250, 252)' : 'rgb(2, 6, 23)'} !important;
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          transition: background-color 0.15s ease !important;
        }

        .phone-input-wrapper .phone-dropdown .country:hover,
        .phone-input-wrapper .phone-dropdown .country.highlight {
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgb(241, 245, 249)'} !important;
        }

        .phone-input-wrapper .phone-dropdown .country .flag {
          transform: scale(1.3) !important;
          flex-shrink: 0 !important;
        }

        .phone-input-wrapper .phone-dropdown .country .country-name {
          flex: 1 !important;
          font-size: 14px !important;
        }

        .phone-input-wrapper .phone-dropdown .country .dial-code {
          color: ${isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'} !important;
          font-size: 13px !important;
        }

        .phone-input-wrapper .react-tel-input .search {
          position: sticky !important;
          top: -4px !important; 
          z-index: 100 !important;
          background-color: ${isDark ? 'rgb(2, 6, 23)' : 'white'} !important;
          padding: 8px !important;
          margin: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          border-bottom: 1px solid ${isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(226, 232, 240, 0.9)'} !important;
        }

        .phone-input-wrapper .react-tel-input .search-box {
          padding: 10px 12px !important; 
          margin: 0 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          border-radius: 8px !important;
          border: 1px solid ${isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(226, 232, 240, 0.9)'} !important;
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgb(248, 250, 252)'} !important;
          color: ${isDark ? 'white' : 'rgb(2, 6, 23)'} !important;
          font-size: 14px !important;
        }

        .phone-input-wrapper .react-tel-input .search-box:focus {
          outline: none !important;
          border-color: ${isDark ? 'rgba(34, 211, 238, 0.7)' : 'rgba(34, 211, 238, 0.7)'} !important;
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'white'} !important;
        }
        
        .phone-input-wrapper .react-tel-input .search-emoji {
          display: none !important;
        }
      `}</style>
    </div>
  );
}