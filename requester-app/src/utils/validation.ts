export interface ApproverFormValue {
  name: string;
  email: string;
  role: string;
}

export interface ApproverFieldErrors {
  name?: string;
  email?: string;
  role?: string;
}

export interface CreateRequestFormValues {
  title: string;
  description: string;
  amount: string;
  requesterName: string;
  approvers: ApproverFormValue[];
}

export interface CreateRequestFormErrors {
  title?: string;
  description?: string;
  amount?: string;
  requesterName?: string;
  approvers?: (ApproverFieldErrors | undefined)[];
  approversGeneral?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCreateRequestForm(values: CreateRequestFormValues): CreateRequestFormErrors {
  const errors: CreateRequestFormErrors = {};

  if (!values.title.trim()) {
    errors.title = 'El título es obligatorio';
  }
  if (!values.description.trim()) {
    errors.description = 'La descripción es obligatoria';
  }
  if (!values.requesterName.trim()) {
    errors.requesterName = 'El nombre del solicitante es obligatorio';
  }

  const amountNumber = Number(values.amount);
  if (!values.amount.trim() || Number.isNaN(amountNumber) || amountNumber <= 0) {
    errors.amount = 'El monto debe ser un número mayor a 0';
  }

  const approverErrors: (ApproverFieldErrors | undefined)[] = values.approvers.map((approver) => {
    const fieldErrors: ApproverFieldErrors = {};
    if (!approver.name.trim()) {
      fieldErrors.name = 'El nombre es obligatorio';
    }
    if (!approver.email.trim()) {
      fieldErrors.email = 'El email es obligatorio';
    } else if (!EMAIL_REGEX.test(approver.email.trim())) {
      fieldErrors.email = 'El email no es válido';
    }
    if (!approver.role.trim()) {
      fieldErrors.role = 'El rol es obligatorio';
    }
    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
  });

  if (approverErrors.some((e) => e)) {
    errors.approvers = approverErrors;
  }

  const emails = values.approvers.map((a) => a.email.trim().toLowerCase()).filter(Boolean);
  const uniqueEmails = new Set(emails);
  if (emails.length === values.approvers.length && uniqueEmails.size !== emails.length) {
    errors.approversGeneral = 'Los tres aprobadores deben tener emails distintos';
  }

  return errors;
}

export function hasFormErrors(errors: CreateRequestFormErrors): boolean {
  return Boolean(
    errors.title ||
      errors.description ||
      errors.amount ||
      errors.requesterName ||
      errors.approversGeneral ||
      errors.approvers?.some((e) => e)
  );
}
