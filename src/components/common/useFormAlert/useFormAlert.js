import { useCallback, useRef, useState } from "react";

/**
 * Keeps the state needed for "red field errors + glossy alert".
 * Save as: src/components/common/useFormAlert.js
 *
 * const { fieldErrors, alertState, showErrors, closeAlert, clearFieldError, registerRef } = useFormAlert();
 */
export default function useFormAlert() {
  const [fieldErrors, setFieldErrors] = useState({});
  const [alertState, setAlertState] = useState({ open: false, messages: [], firstField: null });
  const fieldRefs = useRef({});

  // use as: inputRef={registerRef("remark")}
  const registerRef = useCallback(
    (name) => (el) => {
      fieldRefs.current[name] = el;
    },
    []
  );

  const clearFieldError = useCallback((name) => {
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  /** Pass { field: "message" }. Returns true (and opens the alert) when there are errors. */
  const showErrors = useCallback((errors) => {
    const keys = Object.keys(errors || {});
    if (keys.length === 0) {
      setFieldErrors({});
      return false;
    }
    setFieldErrors(errors);
    setAlertState({ open: true, messages: keys.map((k) => errors[k]), firstField: keys[0] });
    return true;
  }, []);

  const closeAlert = useCallback(() => {
    const first = alertState.firstField;
    setAlertState((prev) => ({ ...prev, open: false }));
    setTimeout(() => {
      const el = fieldRefs.current[first];
      if (el && el.focus) el.focus();
    }, 150);
  }, [alertState.firstField]);

  return { fieldErrors, alertState, showErrors, closeAlert, clearFieldError, registerRef };
}
