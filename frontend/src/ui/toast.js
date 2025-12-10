// frontend/src/ui/toast.js

let toastId = 0;

export function showToast(message, type = "success", duration = 3000) {
  const event = new CustomEvent("app-toast", {
    detail: {
      id: ++toastId,
      message,
      type,     // "success" | "error" | "info"
      duration, // ms
    },
  });

  window.dispatchEvent(event);
}
