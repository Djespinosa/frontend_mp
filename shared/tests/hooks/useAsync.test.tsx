import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAsync } from '../../src/hooks/useAsync';

function TestHarness({ fn }: { fn: (arg: string) => Promise<string> }) {
  const { status, data, error, run } = useAsync(fn);
  return (
    <div>
      <p>status: {status}</p>
      <p>data: {data ?? ''}</p>
      <p>error: {error instanceof Error ? error.message : ''}</p>
      <button onClick={() => run('input')}>run</button>
    </div>
  );
}

describe('useAsync', () => {
  it('transiciona idle -> loading -> success y pasa los argumentos recibidos', async () => {
    const fn = jest.fn().mockResolvedValue('resultado');
    render(<TestHarness fn={fn} />);

    expect(screen.getByText('status: idle')).toBeInTheDocument();
    fireEvent.click(screen.getByText('run'));

    await waitFor(() => expect(screen.getByText('status: success')).toBeInTheDocument());
    expect(screen.getByText('data: resultado')).toBeInTheDocument();
    expect(fn).toHaveBeenCalledWith('input');
  });

  it('transiciona idle -> loading -> error', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fallo'));
    render(<TestHarness fn={fn} />);

    fireEvent.click(screen.getByText('run'));

    await waitFor(() => expect(screen.getByText('status: error')).toBeInTheDocument());
    expect(screen.getByText('error: fallo')).toBeInTheDocument();
  });

  it('no lanza errores de estado tras desmontar antes de que la promesa resuelva', async () => {
    let resolvePromise: (value: string) => void = () => undefined;
    const fn = jest.fn(
      () =>
        new Promise<string>((resolve) => {
          resolvePromise = resolve;
        })
    );
    const { unmount } = render(<TestHarness fn={fn} />);

    fireEvent.click(screen.getByText('run'));
    unmount();
    resolvePromise('resultado tardío');

    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
