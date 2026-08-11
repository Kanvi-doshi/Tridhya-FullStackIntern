"use client";

import { createContext, useContext, useState } from "react";
import { FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const ToastContext = createContext();

function Toast({ message, type, onClose }) {
  return (
    <div
      className={`fixed right-5 top-5 z-[100] flex min-w-[300px] items-center justify-between rounded-lg border px-4 py-3 shadow-lg ${
        type === "success" ? (
          <FiCheckCircle className="text-green-400" />
        ) : (
          <FiAlertCircle className="text-red-400" />
        )
      }`}
    >
      <p className="text-sm font-medium">{message}</p>

      <button
        onClick={onClose}
        className="ml-4 text-lg text-slate-400 hover:text-white"
      >
        <FiX />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({
      message,
      type,
    });

    setTimeout(() => {
      setToast(null);
    }, 3000);
  }

  function hideToast() {
    setToast(null);
  }

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
