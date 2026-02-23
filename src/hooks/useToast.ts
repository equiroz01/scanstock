import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastAction {
  label: string;
  onPress: () => void;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  action?: ToastAction;
  show: (message: string, type?: ToastType, action?: ToastAction) => void;
  hide: () => void;
  success: (message: string, action?: ToastAction) => void;
  error: (message: string, action?: ToastAction) => void;
  warning: (message: string, action?: ToastAction) => void;
  info: (message: string, action?: ToastAction) => void;
}

export const useToast = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  action: undefined,

  show: (message, type = 'info', action) => {
    set({ visible: true, message, type, action });
  },

  hide: () => {
    set({ visible: false });
  },

  success: (message, action) => {
    set({ visible: true, message, type: 'success', action });
  },

  error: (message, action) => {
    set({ visible: true, message, type: 'error', action });
  },

  warning: (message, action) => {
    set({ visible: true, message, type: 'warning', action });
  },

  info: (message, action) => {
    set({ visible: true, message, type: 'info', action });
  },
}));
