import { CreateRequestFormValues, hasFormErrors, validateCreateRequestForm } from '../../src/utils/validation';

function buildValidValues(overrides: Partial<CreateRequestFormValues> = {}): CreateRequestFormValues {
  return {
    title: 'Compra de laptops',
    description: 'Laptops para el equipo',
    amount: '1000',
    requesterName: 'Laura Martínez',
    approvers: [
      { name: 'Juan Pérez', email: 'juan@example.com', role: 'Gerente' },
      { name: 'Ana Gómez', email: 'ana@example.com', role: 'Finanzas' },
      { name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'Compras' },
    ],
    ...overrides,
  };
}

describe('validateCreateRequestForm', () => {
  it('no produce errores con un formulario válido', () => {
    const errors = validateCreateRequestForm(buildValidValues());
    expect(hasFormErrors(errors)).toBe(false);
  });

  it('exige título, descripción y nombre del solicitante', () => {
    const errors = validateCreateRequestForm(buildValidValues({ title: '  ', description: '', requesterName: '' }));
    expect(errors.title).toBeTruthy();
    expect(errors.description).toBeTruthy();
    expect(errors.requesterName).toBeTruthy();
  });

  it('rechaza monto vacío, no numérico, cero o negativo', () => {
    expect(validateCreateRequestForm(buildValidValues({ amount: '' })).amount).toBeTruthy();
    expect(validateCreateRequestForm(buildValidValues({ amount: 'abc' })).amount).toBeTruthy();
    expect(validateCreateRequestForm(buildValidValues({ amount: '0' })).amount).toBeTruthy();
    expect(validateCreateRequestForm(buildValidValues({ amount: '-100' })).amount).toBeTruthy();
  });

  it('acepta un monto positivo', () => {
    expect(validateCreateRequestForm(buildValidValues({ amount: '0.01' })).amount).toBeUndefined();
  });

  it('exige nombre, email y rol en cada aprobador', () => {
    const values = buildValidValues();
    values.approvers[1] = { name: '', email: '', role: '' };

    const errors = validateCreateRequestForm(values);

    expect(errors.approvers?.[0]).toBeUndefined();
    expect(errors.approvers?.[1]).toEqual({
      name: 'El nombre es obligatorio',
      email: 'El email es obligatorio',
      role: 'El rol es obligatorio',
    });
  });

  it('rechaza un email con formato inválido', () => {
    const values = buildValidValues();
    values.approvers[2] = { ...values.approvers[2], email: 'no-es-un-email' };

    const errors = validateCreateRequestForm(values);

    expect(errors.approvers?.[2]?.email).toBe('El email no es válido');
  });

  it('rechaza aprobadores con emails duplicados', () => {
    const values = buildValidValues();
    values.approvers[1] = { ...values.approvers[1], email: values.approvers[0].email.toUpperCase() };

    const errors = validateCreateRequestForm(values);

    expect(errors.approversGeneral).toBe('Los tres aprobadores deben tener emails distintos');
  });

  it('hasFormErrors detecta errores anidados en approvers aunque los campos top-level estén bien', () => {
    const values = buildValidValues();
    values.approvers[0] = { ...values.approvers[0], name: '' };

    const errors = validateCreateRequestForm(values);

    expect(hasFormErrors(errors)).toBe(true);
  });
});
