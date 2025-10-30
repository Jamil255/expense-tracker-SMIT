import { Box, Typography } from '@mui/material'
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 2,
        }}
      >
        <Typography variant="body2" fontWeight={600}>
          {payload[0].payload.name}
        </Typography>
        <Typography variant="body2" color="primary">
          ${payload[0].value.toFixed(2)}
        </Typography>
      </Box>
    )
  }
  return null
}

export default function ChartSpendingOverTime({ data }) {
  const formatted = data.map((d) => ({
    name: `${d._id.year}-${String(d._id.month).padStart(2, '0')}`,
    total: d.total,
  }))

  return (
    <Box>
      <Typography variant="h6" mb={2} fontWeight={600}>
        Spending Over Time
      </Typography>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={formatted}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1976d2" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1976d2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#666" />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#666"
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#1976d2"
            strokeWidth={3}
            fill="url(#colorTotal)"
            animationDuration={1000}
            dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}
