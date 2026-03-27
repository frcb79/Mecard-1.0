import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Component', () => {
  it('should render without crashing', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    // Basic smoke test - app should render
    expect(document.body).toBeTruthy();
  });
});
