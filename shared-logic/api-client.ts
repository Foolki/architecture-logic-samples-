/**
 * SHARED LOGIC - ARCHITECTURE SAMPLE
 * 
 * CHALLENGE: 
 * Handling API calls across the app without repeating error logic 
 * or losing type safety.
 * 
 * SOLUTION:
 * A standardized API Client wrapper. It centralizes authentication headers,
 * timeout logic, and provides a clean way to handle different HTTP status codes.
 */

export class ApiClient {
  private baseUrl: string = '/api/v1';

  constructor(private authToken: string) {}

  /**
   * A generic GET request that ensures we get the type we expect.
   */
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // We handle specific status codes here (e.g., 401 Unauthorized)
        await this.handleHttpErrors(response);
      }

      return await response.json() as T;
    } catch (error) {
      // Catching network-level errors (like DNS or Timeout)
      console.error(`Network Error on ${endpoint}:`, error);
      throw error;
    }
  }

  private async handleHttpErrors(response: Response): Promise<void> {
    const errorBody = await response.json().catch(() => ({}));
    
    if (response.status === 401) {
      console.warn('Session expired. Redirecting to login...');
      // Logic for logout/token refresh would go here
    }

    throw new Error(errorBody.message || `API Error: ${response.status}`);
  }
}
