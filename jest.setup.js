import '@testing-library/jest-dom';

// Mock ResizeObserver for cmdk component testing
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollIntoView for cmdk component testing
Element.prototype.scrollIntoView = jest.fn();
