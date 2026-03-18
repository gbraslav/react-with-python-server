import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from '@/components/Dashboard'

// Mock recharts ResponsiveContainer (it needs a real DOM size)
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 250 }}>{children}</div>
    ),
  }
})

const mockData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  month: `2024-${String((i % 12) + 1).padStart(2, '0')}`,
  data_field1: 10 + i,
  data_field2: 200 + i * 10,
  data_field3: 5 + i,
  data_field4: ['A', 'B', 'AB'][i % 3],
}))

function mockFetchSuccess() {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockData),
  })
}

function mockFetchError() {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: false,
    status: 500,
    json: () => Promise.resolve({}),
  })
}

function mockFetchEmpty() {
  global.fetch = vi.fn().mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve([]),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Dashboard', () => {
  it('calls API once on page load', async () => {
    mockFetchSuccess()
    render(<Dashboard />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1))
    expect(global.fetch).toHaveBeenCalledWith('/api/chart-data')
  })

  it('renders up to 10 rows per page', async () => {
    mockFetchSuccess()
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())
    const rows = screen.getAllByRole('row')
    // 1 header + 10 data rows
    expect(rows).toHaveLength(11)
  })

  it('pagination navigates between pages', async () => {
    mockFetchSuccess()
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByText('Page 1 of 3')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
    // Row 11 should be visible
    expect(screen.getByText('11')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Previous'))
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })

  it('renders all four charts without crashing', async () => {
    mockFetchSuccess()
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByText('Field 1 (Line)')).toBeInTheDocument())
    expect(screen.getByText('Field 2 (Bar)')).toBeInTheDocument()
    expect(screen.getByText('Field 3 (Line)')).toBeInTheDocument()
    expect(screen.getByText('Venn Diagram (Field 4 Categories)')).toBeInTheDocument()
  })

  it('shows error state on API failure', async () => {
    mockFetchError()
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByText(/Error:/)).toBeInTheDocument())
  })

  it('shows empty state when no data', async () => {
    mockFetchEmpty()
    render(<Dashboard />)
    await waitFor(() => expect(screen.getByText('No data')).toBeInTheDocument())
  })
})
