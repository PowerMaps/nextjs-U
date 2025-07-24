import { apiClient } from './client';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client Error Handling', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw an error for network issues', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(apiClient.get('/some-endpoint')).rejects.toThrow('Network Error');
  });

  it('should throw an error with response data for 4xx errors', async () => {
    const errorResponse = {
      response: {
        status: 404,
        data: { message: 'Not Found' },
      },
    };
    mockedAxios.post.mockRejectedValueOnce(errorResponse);

    await expect(apiClient.post('/non-existent', {})).rejects.toEqual({
      status: 404,
      message: 'Not Found',
    });
  });

  it('should throw a generic error for 5xx errors', async () => {
    const errorResponse = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    };
    mockedAxios.put.mockRejectedValueOnce(errorResponse);

    await expect(apiClient.put('/server-error', {})).rejects.toEqual({
      status: 500,
      message: 'Internal Server Error',
    });
  });

  it('should throw a default error message if no specific message is provided', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: {},
      },
    };
    mockedAxios.delete.mockRejectedValueOnce(errorResponse);

    await expect(apiClient.delete('/bad-request')).rejects.toEqual({
      status: 400,
      message: 'An unknown error occurred.',
    });
  });
});
