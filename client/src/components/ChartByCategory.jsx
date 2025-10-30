import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Sector,
} from 'recharts'
import { Typography, Box } from '@mui/material'

const COLORS = [
  '#1976d2',
  '#f57c00',
  '#d32f2f',
  '#388e3c',
  '#7b1fa2',
  '#c2185b',
  '#0097a7',
  '#f9a825',
  '#5d4037',
  '#455a64',
]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    const percentage = ((data.value / payload[0].payload.total) * 100).toFixed(
      1
    )
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
          {data.name}
        </Typography>
        <Typography variant="body2" color="primary">
          ${data.value.toFixed(2)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {percentage}%
        </Typography>
      </Box>
    )
  }
  return null
}

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  )
}

export default function ChartByCategory({ data }) {
  const [activeIndex, setActiveIndex] = useState(null)

  const total = data.reduce((sum, d) => sum + d.total, 0)

  const formatted = data.map((d, i) => ({
    name: d._id,
    value: d.total,
    color: COLORS[i % COLORS.length],
    total: total,
  }))

  return (
    <Box>
      <Typography variant="h6" mb={2} fontWeight={600}>
        Spending by Category
      </Typography>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={formatted}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={85}
            innerRadius={45}
            paddingAngle={2}
            animationDuration={800}
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {formatted.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value, entry) => (
              <span style={{ fontSize: '12px', color: '#666' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}
