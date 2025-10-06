"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface AlertContextProps {
  error: string | null;
  success: string | null;

  setError: (message: string | null) => void;
  setSuccess: (message: string | null) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  return (
    <AlertContext.Provider value={{ error, setError, success, setSuccess}}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};
