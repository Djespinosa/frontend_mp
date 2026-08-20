import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '@mp/shared';
import { listMail } from '../../src/services/mockMailService';

const mock = new MockAdapter(httpClient);

afterEach(() => mock.reset());

describe('mockMailService.listMail', () => {
  it('hace GET a /mock-mail sin filtro cuando no se pasa requestId', async () => {
    mock.onGet('/mock-mail').reply(200, []);

    const result = await listMail();

    expect(result).toEqual([]);
  });

  it('pasa requestId como query param cuando se indica', async () => {
    mock.onGet('/mock-mail', { params: { requestId: 'req-1' } }).reply(200, [{ mailId: 'm1' }]);

    const result = await listMail('req-1');

    expect(result).toEqual([{ mailId: 'm1' }]);
  });
});
