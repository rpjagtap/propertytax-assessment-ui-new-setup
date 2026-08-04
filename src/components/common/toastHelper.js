import { Slide, toast } from "react-toastify";
import { errorMsg } from "../../utils/constants";

const data = {
  position: "top-center",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: false,
  draggable: true,
  progress: undefined,
  theme: "light",
  transition: Slide,
  className: "custom-toast",
};
// Reusable function to show error toast
export const showToastError = (message) => {
  toast.dismiss();
  toast.error(message || errorMsg, {
    ...data,
    pauseOnHover: true,
    autoClose: 5000,
  });
};

export const showToastWarn = (message) => {
  toast.dismiss();
  toast.warn(message || "Warning", {
    ...data,
    pauseOnHover: true,
  });
};

export const showToastSuccess = (message) => {
  toast.dismiss();
  toast.success(message || "Success", {
    ...data,
    autoClose: 6000,
  });
};

export const showToastInfo = (message) => {
  toast.dismiss();
  toast.info(message || "Info", data);
};
