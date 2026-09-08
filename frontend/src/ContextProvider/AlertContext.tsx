// AlertContext.tsx
import React, { createContext, useContext, ReactNode, useState } from "react";
import CommonAlert from "../components/Alert/Alert";

interface AlertContextProps {
  showAlert: (message: string, type?: "success" | "warning" | "error") => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);
interface objtype {
  message: string;
  type: "success" | "warning" | "error";
}
export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<objtype>({ message: "", type: "success" });

  const showAlert = (
    message: string,
    type: "success" | "warning" | "error" = "success"
  ) => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert({ message: "", type: "success" });
    }, 10000);
  };
  const { message } = alert;

  

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {message && (
        <div
          className={`fixed bottom-0 right-5 z-[100] p-4 m-4 bg-${alert.type}-500 text-white rounded`}
        >
          <CommonAlert type={alert.type} message={alert.message} />
        </div>
      )}
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
