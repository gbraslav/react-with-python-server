import { useState, useEffect } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const PAGE_SIZE = 12

export default function Dashboard() {
  const [data, setData] = useState<Record[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)

  useEffect(() => {
    fetch('/api/chart-data')
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
  }, [])

  if (loading) return <p className="p-8 text-center">Loading...</p>
  if (error) return <p className="p-8 text-center text-red-500">Error: {error}</p>
  if (data.length === 0) return <p className="p-8 text-center">No data</p>

  const totalPages = Math.ceil(data.length / PAGE_SIZE)
  const pageData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Venn diagram data: count categories in current page
  const vennCounts = { A: 0, B: 0, AB: 0 }
  for (const r of pageData) {
    if (r.data_field4 === 'A') vennCounts.A++
    else if (r.data_field4 === 'B') vennCounts.B++
    else if (r.data_field4 === 'AB') vennCounts.AB++
  }

  return (
    <div className="min-h-screen bg-white p-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Field 1</TableHead>
                <TableHead>Field 2</TableHead>
                <TableHead>Field 3</TableHead>
                <TableHead>Field 4</TableHead>
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
