import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ContractGraph } from './ContractGraph';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
    };
  },
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContractGraph', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('renders loading state and then error state on failed fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: "not found" } })
    });

    render(<ContractGraph contractId="CAAA" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load graph data/i)).toBeInTheDocument();
    });
  });

  it('renders graph nodes on successful fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        nodes: [{ id: 'C1', label: 'C1...' }],
        edges: [],
        metadata: { heuristic_used: true, warning: 'test warning' }
      })
    });

    const { container } = render(<ContractGraph contractId="C1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/test warning/i)).toBeInTheDocument();
    });
    
    // ReactFlow nodes are rendered
    expect(container.querySelector('.react-flow')).toBeInTheDocument();
  });
});
