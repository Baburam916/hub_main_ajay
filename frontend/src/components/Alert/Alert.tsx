import React, { useState } from "react";
import { BsCheckCircle, BsExclamationCircle, BsX } from "react-icons/bs";
import AlertComponent from "../../base-components/Alert";
import Lucide from "../../base-components/Lucide";

interface AlertProps {
  type: "success" | "error" | "warning";
  message: string;
}

const getIconByVariant = (variant: string) => {
  switch (variant) {
    case "success":
      return <BsCheckCircle />;
    case "error":
      return <BsExclamationCircle />;
    case "warning":
      return <BsExclamationCircle />;
    default:
      return null;
  }
};

const CommonAlert: React.FC<AlertProps> = ({ type, message }) => {
  const [isVisible, setIsVisible] = useState(true);
// const [addmessage,setAddmessage]=useState(message)
  const handleDismiss = () => {
    setIsVisible(false);
  };

  

  return (
    <>
      {isVisible && (
        <AlertComponent variant={type} className="flex items-center mb-2">
          {({ dismiss }) => (
            <>
              {getIconByVariant(type)} <div className="ml-4 mr-4">{message}</div>
              <AlertComponent.DismissButton
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={dismiss}
              >
                <Lucide icon="X" className="w-4 h-4" />
              </AlertComponent.DismissButton>
            </>
          )}
        </AlertComponent>
      )}
    </>
  );
};

export default CommonAlert;
