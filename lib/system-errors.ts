export type SystemError = {
  id: string;
  title: string;
  message: string;
  severity: "warning" | "error";
};

const listeners = new Set<() => void>();
let errors: SystemError[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

export function subscribeSystemErrors(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSystemErrors(): SystemError[] {
  return errors;
}

export function pushSystemError(error: Omit<SystemError, "id">) {
  const entry: SystemError = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...error,
  };
  errors = [entry, ...errors].slice(0, 3);
  emit();
}

export function dismissSystemError(id: string) {
  errors = errors.filter((entry) => entry.id !== id);
  emit();
}

export function clearSystemErrors() {
  errors = [];
  emit();
}
