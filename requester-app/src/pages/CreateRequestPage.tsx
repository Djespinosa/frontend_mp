import { useNavigate } from 'react-router-dom';
import { ErrorMessage, useAsync, getErrorMessage, CreateRequestPayload } from '@mp/shared';
import { CreateRequestForm } from '../components/CreateRequestForm';
import { createRequest } from '../services/requestService';
import { CreateRequestFormValues } from '../utils/validation';

export function CreateRequestPage() {
  const navigate = useNavigate();
  const { status, error, run } = useAsync(createRequest);

  async function handleSubmit(values: CreateRequestFormValues) {
    const payload: CreateRequestPayload = {
      title: values.title.trim(),
      description: values.description.trim(),
      amount: Number(values.amount),
      requester: { name: values.requesterName.trim() },
      approvers: values.approvers.map((approver) => ({
        name: approver.name.trim(),
        email: approver.email.trim(),
        role: approver.role.trim(),
      })),
    };

    const result = await run(payload);
    if (result) {
      navigate(`/requests/${result.requestId}`);
    }
  }

  return (
    <section>
      <h2>Crear solicitud de compra</h2>
      {status === 'error' && <ErrorMessage message={getErrorMessage(error)} />}
      <CreateRequestForm onSubmit={handleSubmit} submitting={status === 'loading'} />
    </section>
  );
}
