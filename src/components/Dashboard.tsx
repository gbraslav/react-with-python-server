import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Record {
  id: number
  month: string
  data_field1: number
  data_field2: number
  data_field3: number
  data_field4: string
}

type SortKey = keyof Record
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 12

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'id', label: 'ID' },
  { key: 'month', label: 'Month' },
  { key: 'data_field1', label: 'Field 1' },
  { key: 'data_field2', label: 'Field 2' },
  { key: 'data_field3', label: 'Field 3' },
  { key: 'data_field4', label: 'Field 4' },
]

export default function Dashboard() {
  const { logout, token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<Record[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [sortKey, setSortKey] = useState<SortKey>('id')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [filters, setFilters] = useState<Partial<{ [K in SortKey]: string }>>({})

  useEffect(() => {
    if (!token) return
    fetch('/api/chart-data', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((records: Record[]) => {
        setData(records)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [token])

  const filtered = useMemo(() => {
    return data.filter((row) =>
      COLUMNS.every(({ key }) => {
        const f = filters[key]
        if (!f) return true
        return String(row[key]).toLowerCase().includes(f.toLowerCase())
      })
    )
  }, [data, filters])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  const handleFilter = (key: SortKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0)
  }

  if (loading) return <p className="p-8 text-center">Loading...</p>
  if (error) return <p className="p-8 text-center text-red-500">Error: {error}</p>
  if (data.length === 0) return <p className="p-8 text-center">No data</p>

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Venn diagram data: count categories in current page
  const vennCounts = { A: 0, B: 0, AB: 0 }
  for (const r of pageData) {
    if (r.data_field4 === 'A') vennCounts.A++
    else if (r.data_field4 === 'B') vennCounts.B++
    else if (r.data_field4 === 'AB') vennCounts.AB++
  }

  return (
    <div className="min-h-screen bg-white p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Button
          variant="outline"
          onClick={async () => {
            await logout()
            navigate('/login')
          }}
        >
          Logout
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg"
            style={{
              borderTop: '2px solid #d1d5db',
              borderLeft: '2px solid #d1d5db',
              borderRight: '2px solid #9ca3af',
              borderBottom: '2px solid #9ca3af',
              boxShadow: '3px 3px 6px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.4)',
            }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map(({ key, label }) => (
                    <TableHead key={key}>
                      <div className="space-y-1">
                        <button
                          className="font-semibold hover:text-black flex items-center gap-1"
                          onClick={() => handleSort(key)}
                        >
                          {label}
                          {sortKey === key ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : ''}
                        </button>
                        <input
                          type="text"
                          placeholder="Filter..."
                          className="w-full text-xs px-1.5 py-0.5 border rounded bg-white font-normal"
                          value={filters[key] ?? ''}
                          onChange={(e) => handleFilter(key, e.target.value)}
                        />
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.data_field1}</TableCell>
                    <TableCell>{row.data_field2}</TableCell>
                    <TableCell>{row.data_field3}</TableCell>
                    <TableCell>{row.data_field4}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="px-3 py-1 rounded border disabled:opacity-50"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts 2x2 Grid */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Field 1 (Line)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={pageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="data_field1" stroke="#e74c3c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Field 2 (Bar)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={pageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="data_field2" fill="#3498db" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Field 3 (Line)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={pageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="data_field3" stroke="#2ecc71" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Venn Diagram (Field 4 Categories)</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[250px]">
              <svg viewBox="0 0 300 200" className="w-full h-full max-w-[300px]">
                {/* Circle A */}
                <circle cx="115" cy="100" r="70" fill="#e74c3c" opacity="0.4" />
                <text x="85" y="95" textAnchor="middle" className="text-sm font-semibold" fill="#c0392b">
                  A
                </text>
                <text x="85" y="115" textAnchor="middle" className="text-sm" fill="#333">
                  {vennCounts.A}
                </text>
                {/* Circle B */}
                <circle cx="185" cy="100" r="70" fill="#3498db" opacity="0.4" />
                <text x="215" y="95" textAnchor="middle" className="text-sm font-semibold" fill="#2980b9">
                  B
                </text>
                <text x="215" y="115" textAnchor="middle" className="text-sm" fill="#333">
                  {vennCounts.B}
                </text>
                {/* Overlap */}
                <text x="150" y="95" textAnchor="middle" className="text-sm font-semibold" fill="#8e44ad">
                  AB
                </text>
                <text x="150" y="115" textAnchor="middle" className="text-sm" fill="#333">
                  {vennCounts.AB}
                </text>
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
