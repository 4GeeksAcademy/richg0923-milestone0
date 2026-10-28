/**
 * validation.js — Brasa Points Application Form Validation
 *
 * Full client-side form validation with inline error messages.
 * All fields are validated on blur and on submit.
 * On successful validation, the form shows a success message.
 */

(function () {
  'use strict';

  // ============================================================
  // Validation Rules
  // ============================================================

  var RULES = {
    fullName: {
      required: true,
      minLength: 2,
      pattern: /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/,
      message: 'Please enter your full name (at least 2 characters, letters only).'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address (e.g., name@example.com).'
    },
    phone: {
      required: true,
      minLength: 7,
      pattern: /^[\d\s\-\+\(\)]+$/,
      message: 'Please enter a valid phone number (digits, spaces, +, -, parentheses).'
    },
    country: {
      required: true,
      message: 'Please select your country.'
    },
    city: {
      required: true,
      minLength: 2,
      message: 'Please enter your city (at least 2 characters).'
    },
    favoriteLocation: {
      required: true,
      message: 'Please select your favorite Brasaland location.'
    },
    dateOfBirth: {
      required: true,
      minAge: 18,
      message: 'You must be at least 18 years old to join Brasa Points.',
      requiredMessage: 'Please enter your date of birth.'
    },
    terms: {
      required: true,
      message: 'You must accept the terms and conditions to continue.'
    },
    referral: {
      required: true,
      message: 'Please tell us how you found us.'
    }
  };

  // ============================================================
  // Location data — maps country to available restaurant cities
  // ============================================================

  var LOCATIONS = {
    'Colombia': [
      { value: 'medellin-centro', label: 'Medellín — Centro' },
      { value: 'medellin-poblado', label: 'Medellín — El Poblado' },
      { value: 'bogota-chapinero', label: 'Bogotá — Chapinero' },
      { value: 'bogota-usaquen', label: 'Bogotá — Usaquén' },
      { value: 'bogota-centro', label: 'Bogotá — Centro' },
      { value: 'cali-norte', label: 'Cali — Norte' },
      { value: 'cali-sur', label: 'Cali — Sur' },
      { value: 'medellin-envigado', label: 'Medellín — Envigado' },
      { value: 'bogota-fontibon', label: 'Bogotá — Fontibón' },
      { value: 'medellin-bello', label: 'Medellín — Bello' }
    ],
    'United States': [
      { value: 'miami-downtown', label: 'Miami — Downtown' },
      { value: 'miami-doral', label: 'Miami — Doral' },
      { value: 'orlando-iusp', label: 'Orlando — IUSP' },
      { value: 'orlando-kissimmee', label: 'Orlando — Kissimmee' }
    ]
  };

  // ============================================================
  // DOM References
  // ============================================================

  var form = document.getElementById('application-form');
  var successBanner = document.getElementById('form-success');

  var fields = {
    fullName: document.getElementById('full-name'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    dateOfBirth: document.getElementById('date-of-birth'),
    country: document.getElementById('country'),
    city: document.getElementById('city'),
    favoriteLocation: document.getElementById('favorite-location'),
    referral: document.getElementById('referral'),
    terms: document.getElementById('terms'),
    offersOptIn: document.getElementById('offers-opt-in')
  };

  /**
   * Convert a camelCase string to kebab-case so object keys
   * map to HTML ids (e.g. fullName -> full-name).
   */
  function toKebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  var errorEls = {};
  Object.keys(fields).forEach(function (key) {
    errorEls[key] = document.getElementById(toKebabCase(key) + '-error');
  });

  // ============================================================
  // Utility Functions
  // ============================================================

  /**
   * Validate a single field value against its rules.
   * @param {string} value - The field value to validate.
   * @param {object} rules - The rules object for this field.
   * @returns {string|null} Error message or null if valid.
   */
  function validateField(value, rules) {
    var trimmed = (typeof value === 'string') ? value.trim() : String(value || '');

    if (rules.required && trimmed === '') {
      return rules.requiredMessage || rules.message;
    }

    if (trimmed === '') {
      return null; // not required and empty = valid
    }

    if (rules.minLength && trimmed.length < rules.minLength) {
      return rules.message;
    }

    if (rules.pattern && !rules.pattern.test(trimmed)) {
      return rules.message;
    }

    if (rules.minAge) {
      var age = calculateAge(trimmed);
      if (age < rules.minAge) {
        return rules.message;
      }
    }

    return null;
  }

  /**
   * Calculate age from a date string (YYYY-MM-DD or MM/DD/YYYY).
   * @param {string} dateStr - The date of birth value.
   * @returns {number} Age in years, or Infinity if invalid.
   */
  function calculateAge(dateStr) {
    var date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return Infinity; // invalid date — let pattern/required handle messaging
    }
    var today = new Date();
    var age = today.getFullYear() - date.getFullYear();
    var monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Show an error message for a specific field.
   * @param {string} fieldId - The field's identifier key.
   * @param {string} message - The error message to display.
   */
  function showError(fieldId, message) {
    var field = fields[fieldId];
    var errorEl = errorEls[fieldId];

    if (field) {
      field.classList.add('border-red-500', 'bg-red-50');
      field.classList.remove('border-gray-300');
    }

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    }
  }

  /**
   * Clear the error state for a specific field.
   * @param {string} fieldId - The field's identifier key.
   */
  function clearError(fieldId) {
    var field = fields[fieldId];
    var errorEl = errorEls[fieldId];

    if (field) {
      field.classList.remove('border-red-500', 'bg-red-50');
      field.classList.add('border-gray-300');
    }

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  }

  /**
   * Validate a single field by its ID and show/clear error.
   * @param {string} fieldId - The field identifier key.
   * @returns {boolean} True if valid.
   */
  function checkField(fieldId) {
    var field = fields[fieldId];
    var rules = RULES[fieldId];

    if (!field || !rules) return true;

    // Checkboxes use .checked, not .value
    var value = (field.type === 'checkbox') ? (field.checked ? 'true' : '') : field.value;
    var error = validateField(value, rules);

    if (error) {
      showError(fieldId, error);
      return false;
    } else {
      clearError(fieldId);
      return true;
    }
  }

  /**
   * Dynamic location dropdown — updates favorite-location options based on country.
   */
  function updateLocationOptions() {
    var countrySelect = fields.country;
    var locationSelect = fields.favoriteLocation;
    var selectedCountry = countrySelect.value;

    // Clear current options
    locationSelect.innerHTML = '';

    if (!selectedCountry || !LOCATIONS[selectedCountry]) {
      var defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select a country first';
      defaultOption.disabled = true;
      defaultOption.selected = true;
      locationSelect.appendChild(defaultOption);
      return;
    }

    // Add placeholder
    var placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select a location';
    placeholder.disabled = true;
    placeholder.selected = true;
    locationSelect.appendChild(placeholder);

    // Add location options
    var locations = LOCATIONS[selectedCountry];
    locations.forEach(function (loc) {
      var option = document.createElement('option');
      option.value = loc.value;
      option.textContent = loc.label;
      locationSelect.appendChild(option);
    });
  }

  // ============================================================
  // Form Submission Handler
  // ============================================================

  /**
   * Handle form submission — validate all fields, show success if valid.
   * @param {Event} event - The form submit event.
   */
  function handleSubmit(event) {
    event.preventDefault();

    // Hide previous success banner
    if (successBanner) {
      successBanner.classList.add('hidden');
    }

    // Validate all fields
    var fieldIds = Object.keys(fields);
    var isValid = true;

    fieldIds.forEach(function (id) {
      if (!checkField(id)) {
        isValid = false;
      }
    });

    if (!isValid) {
      // Scroll to the first error
      var firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus({ preventScroll: true });
      }
      return;
    }

    // ============================================================
    // All validations passed — show success message
    // ============================================================

    if (successBanner) {
      successBanner.classList.remove('hidden');
      successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Optional: reset button state to show success
    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Submitted!';
      submitBtn.classList.remove('bg-red-700', 'hover:bg-red-800');
      submitBtn.classList.add('bg-green-600', 'cursor-not-allowed');
    }

    // Reset form after 5 seconds
    setTimeout(function () {
      resetForm();
    }, 5000);
  }

  /**
   * Clear all field error states.
   */
  function clearAllErrors() {
    Object.keys(fields).forEach(function (id) {
      clearError(id);
    });
  }

  /**
   * Reset the entire form to its initial state:
   * clears inputs, errors, the success banner, and restores
   * the submit button.
   */
  function resetForm() {
    form.reset();
    updateLocationOptions(); // restore the "Select a country first" placeholder
    clearAllErrors();

    var submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-gift mr-2"></i> Submit Application';
      submitBtn.classList.remove('bg-green-600', 'cursor-not-allowed');
      submitBtn.classList.add('bg-red-700', 'hover:bg-red-800');
    }

    if (successBanner) {
      successBanner.classList.add('hidden');
    }

    // Move focus to the first field for accessibility
    var firstField = document.getElementById('full-name');
    if (firstField) {
      firstField.focus();
    }
  }

  // ============================================================
  // Event Binding
  // ============================================================

  /**
   * Initialize the form — bind events and set initial state.
   */
  function init() {
    if (!form) {
      console.warn('Form with id "application-form" not found.');
      return;
    }

    // Validate on blur for each field
    Object.keys(fields).forEach(function (id) {
      var field = fields[id];
      if (field) {
        field.addEventListener('blur', function () {
          checkField(id);
        });
      }
    });

    // Update location dropdown when country changes
    if (fields.country) {
      fields.country.addEventListener('change', function () {
        updateLocationOptions();
        // Clear and re-validate favorite location
        clearError('favoriteLocation');
        checkField('favoriteLocation');
      });
    }

    // Form submit handler
    form.addEventListener('submit', handleSubmit);

    // Reset button — clears the whole form
    var resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        resetForm();
      });
    }

    // Validate terms checkbox on change
    if (fields.terms) {
      fields.terms.addEventListener('change', function () {
        checkField('terms');
      });
    }

    // Initialize location dropdown
    updateLocationOptions();
  }

  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();