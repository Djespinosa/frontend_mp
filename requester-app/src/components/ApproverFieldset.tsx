import { ApproverFieldErrors, ApproverFormValue } from '../utils/validation';

interface ApproverFieldsetProps {
  index: number;
  value: ApproverFormValue;
  errors?: ApproverFieldErrors;
  onChange: (value: ApproverFormValue) => void;
}

export function ApproverFieldset({ index, value, errors, onChange }: ApproverFieldsetProps) {
  return (
    <fieldset>
      <legend>Aprobador {index + 1}</legend>

      <label htmlFor={`approver-${index}-name`}>Nombre</label>
      <input
        id={`approver-${index}-name`}
        type="text"
        value={value.name}
        onChange={(event) => onChange({ ...value, name: event.target.value })}
      />
      {errors?.name && <p role="alert">{errors.name}</p>}

      <label htmlFor={`approver-${index}-email`}>Email</label>
      <input
        id={`approver-${index}-email`}
        type="email"
        value={value.email}
        onChange={(event) => onChange({ ...value, email: event.target.value })}
      />
      {errors?.email && <p role="alert">{errors.email}</p>}

      <label htmlFor={`approver-${index}-role`}>Rol</label>
      <input
        id={`approver-${index}-role`}
        type="text"
        value={value.role}
        onChange={(event) => onChange({ ...value, role: event.target.value })}
      />
      {errors?.role && <p role="alert">{errors.role}</p>}
    </fieldset>
  );
}
