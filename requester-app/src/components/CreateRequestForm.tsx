import { ChangeEvent, FormEvent, useState } from 'react';
import { ApproverFieldset } from './ApproverFieldset';
import {
  ApproverFormValue,
  CreateRequestFormErrors,
  CreateRequestFormValues,
  hasFormErrors,
  validateCreateRequestForm,
} from '../utils/validation';

interface CreateRequestFormProps {
  onSubmit: (values: CreateRequestFormValues) => void;
  submitting: boolean;
}

const EMPTY_APPROVER: ApproverFormValue = { name: '', email: '', role: '' };

const INITIAL_VALUES: CreateRequestFormValues = {
  title: '',
  description: '',
  amount: '',
  requesterName: '',
  approvers: [{ ...EMPTY_APPROVER }, { ...EMPTY_APPROVER }, { ...EMPTY_APPROVER }],
};

export function CreateRequestForm({ onSubmit, submitting }: CreateRequestFormProps) {
  const [values, setValues] = useState<CreateRequestFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<CreateRequestFormErrors>({});

  // Importante: siempre se captura event.target.value en una variable local
  // ANTES de llamar a setValues. Si se lee event.target.value dentro del
  // callback funcional de setValues, React puede haber re-renderizado el
  // input controlado con el valor anterior antes de que el callback se
  // ejecute, y para entonces event.target.value ya no refleja lo tipeado.
  function handleFieldChange(field: keyof Omit<CreateRequestFormValues, 'approvers'>) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
    };
  }

  function handleApproverChange(index: number, approver: ApproverFormValue) {
    setValues((prev) => {
      const approvers = [...prev.approvers];
      approvers[index] = approver;
      return { ...prev, approvers };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateCreateRequestForm(values);
    setErrors(validationErrors);
    if (hasFormErrors(validationErrors)) {
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="title">Título</label>
      <input id="title" type="text" value={values.title} onChange={handleFieldChange('title')} />
      {errors.title && <p role="alert">{errors.title}</p>}

      <label htmlFor="description">Descripción</label>
      <textarea id="description" value={values.description} onChange={handleFieldChange('description')} />
      {errors.description && <p role="alert">{errors.description}</p>}

      <label htmlFor="amount">Monto</label>
      <input id="amount" type="number" value={values.amount} onChange={handleFieldChange('amount')} />
      {errors.amount && <p role="alert">{errors.amount}</p>}

      <label htmlFor="requesterName">Nombre del solicitante</label>
      <input
        id="requesterName"
        type="text"
        value={values.requesterName}
        onChange={handleFieldChange('requesterName')}
      />
      {errors.requesterName && <p role="alert">{errors.requesterName}</p>}

      {values.approvers.map((approver, index) => (
        <ApproverFieldset
          key={index}
          index={index}
          value={approver}
          errors={errors.approvers?.[index]}
          onChange={(value) => handleApproverChange(index, value)}
        />
      ))}
      {errors.approversGeneral && <p role="alert">{errors.approversGeneral}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creando...' : 'Crear solicitud'}
      </button>
    </form>
  );
}
