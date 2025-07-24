import { apiClient } from './client';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should make a GET request successfully', async () => {
    const mockResponse = { data: { message: 'Success' } };
    mockedAxios.get.mockResolvedValueOnce(mockResponse);

    const result = await apiClient.get('/test-endpoint');

    expect(mockedAxios.get).toHaveBeenCalledWith('/test-endpoint', undefined);
    expect(result).toEqual(mockResponse.data);
  });

  it('should make a POST request successfully', async () => {
    const mockResponse = { data: { id: 1, name: 'New Item' } };
    const postData = { name: 'New Item' };
    mockedAxios.post.mockResolvedValueOnce(mockResponse);

    const result = await apiClient.post('/items', postData);

    expect(mockedAxios.post).toHaveBeenCalledWith('/items', postData, undefined);
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle API errors', async () => {
    const errorMessage = 'Network Error';
    mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

    await expect(apiClient.get('/error-endpoint')).rejects.toThrow(errorMessage);
  });
});
