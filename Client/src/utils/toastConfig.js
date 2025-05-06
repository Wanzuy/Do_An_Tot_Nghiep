import { toast } from "react-toastify";

const toastConfig = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
        fontSize: "16px",
    },
};

export const successToast = (message) => toast.success(message, toastConfig);
export const errorToast = (message) => toast.error(message, toastConfig);
export const infoToast = (message) => toast.info(message, toastConfig);
export const warningToast = (message) => toast.warning(message, toastConfig);
