import { useState } from 'react';
import { BarChart3, Activity } from 'lucide-react';
import { formatINR } from '../utils/currency';

const DATA_SETS = {
  '7d': {
    label: 'Last 7 Days',
    summary: { total: 694500, orders: 146, avgDaily: 99214, peakDay: 'Saturday (₹1,56,000)' },
    points: [
      { label: 'Mon', revenue: 58000, orders: 12, date: 'Oct 21' },
      { label: 'Tue', revenue: 74500, orders: 15, date: 'Oct 22' },
      { label: 'Wed', revenue: 62000, orders: 13, date: 'Oct 23' },
      { label: 'Thu', revenue: 98000, orders: 21, date: 'Oct 24' },
      { label: 'Fri', revenue: 112000, orders: 24, date: 'Oct 25' },
      { label: 'Sat', revenue: 156000, orders: 33, date: 'Oct 26' },
      { label: 'Sun', revenue: 134000, orders: 28, date: 'Oct 27' },
    ]
  },
  '30d': {
    label: 'Last 30 Days',
    summary: { total: 3810000, orders: 742, avgDaily: 127000, peakDay: 'Week 4 (₹11.2L)' },
    points: [
      { label: 'Oct 1-5', revenue: 420000, orders: 85, date: 'Oct 1 - Oct 5' },
      { label: 'Oct 6-10', revenue: 510000, orders: 98, date: 'Oct 6 - Oct 10' },
      { label: 'Oct 11-15', revenue: 645000, orders: 128, date: 'Oct 11 - Oct 15' },
      { label: 'Oct 16-20', revenue: 580000, orders: 115, date: 'Oct 16 - Oct 20' },
      { label: 'Oct 21-25', revenue: 790000, orders: 154, date: 'Oct 21 - Oct 25' },
      { label: 'Oct 26-30', revenue: 865000, orders: 162, date: 'Oct 26 - Oct 30' },
    ]
  },
  '12m': {
    label: 'Annual (12 Months)',
    summary: { total: 42800000, orders: 8920, avgDaily: 3566666, peakDay: 'Diwali Festival (₹68.4L)' },
    points: [
      { label: 'Nov', revenue: 2800000, orders: 540, date: 'Nov 2025' },
      { label: 'Dec', revenue: 3900000, orders: 780, date: 'Dec 2025' },
      { label: 'Jan', revenue: 3100000, orders: 620, date: 'Jan 2026' },
      { label: 'Feb', revenue: 2950000, orders: 590, date: 'Feb 2026' },
      { label: 'Mar', revenue: 3400000, orders: 690, date: 'Mar 2026' },
      { label: 'Apr', revenue: 3200000, orders: 650, date: 'Apr 2026' },
      { label: 'May', revenue: 3600000, orders: 710, date: 'May 2026' },
      { label: 'Jun', revenue: 3450000, orders: 680, date: 'Jun 2026' },
      { label: 'Jul', revenue: 3800000, orders: 760, date: 'Jul 2026' },
      { label: 'Aug', revenue: 4100000, orders: 840, date: 'Aug 2026' },
      { label: 'Sep', revenue: 4400000, orders: 920, date: 'Sep 2026' },
      { label: 'Oct', revenue: 4100000, orders: 850, date: 'Oct 2026' },
    ]
  }
};

const CATEGORY_CONTRIBUTION = [
  { name: 'Mobiles & Flagships', share: 44, amount: 1676400, color: '#6366f1' },
  { name: 'Audio & Acoustics', share: 26, amount: 990600, color: '#06b6d4' },
  { name: 'Electronics & GaN Power', share: 18, amount: 685800, color: '#10b981' },
  { name: 'Home & Living', share: 8, amount: 304800, color: '#f59e0b' },
  { name: 'Fashion & Wearables', share: 4, amount: 152400, color: '#ec4899' },
];

export default function RevenueAnalyticsCharts({ liveTotalRevenue = 0, liveTotalOrders = 0 }) {
  const [timeRange, setTimeRange] = useState('7d');
  const [activePoint, setActivePoint] = useState(null);

  const activeData = DATA_SETS[timeRange];
  const points = activeData.points;

  // Chart Dimensions & Coordinate calculations
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const usableWidth = svgWidth - paddingX * 2;
  const usableHeight = svgHeight - paddingY * 2;

  const maxVal = Math.max(...points.map((p) => p.revenue)) * 1.15;
  const minVal = 0;

  const getCoords = (index, val) => {
    const x = paddingX + (index / (points.length - 1)) * usableWidth;
    const y = svgHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * usableHeight;
    return { x, y };
  };

  // Generate SVG Cubic Bézier Path
  const coordsList = points.map((p, idx) => getCoords(idx, p.revenue));

  let linePath = `M ${coordsList[0].x} ${coordsList[0].y}`;
  for (let i = 0; i < coordsList.length - 1; i++) {
    const p0 = coordsList[i];
    const p1 = coordsList[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 2;
    const cp1y = p0.y;
    const cp2x = p0.x + (p1.x - p0.x) / 2;
    const cp2y = p1.y;
    linePath += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }

  const areaPath = `${linePath} L ${coordsList[coordsList.length - 1].x} ${svgHeight - paddingY} L ${coordsList[0].x} ${svgHeight - paddingY} Z`;

  // Status breakdown calculations for Donut Chart
  const statusSlices = [
    { label: 'Delivered', pct: 52, count: 386, color: '#10b981' },
    { label: 'In Transit / BlueDart', pct: 24, count: 178, color: '#06b6d4' },
    { label: 'Processing Atelier', pct: 16, count: 119, color: '#6366f1' },
    { label: 'Pending Dispatches', pct: 8, count: 59, color: '#f59e0b' }
  ];

  // Circumference for 2 * PI * r (r = 42)
  const donutR = 42;
  const circumference = 2 * Math.PI * donutR;
  let accumulatedOffset = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
      {/* 1. Main Interactive Revenue Trend Chart */}
      <div className="admin-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                <Activity size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>
                  Revenue & Sales Velocity
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                  Real-time gross merchandise volume and transaction trajectory
                </p>
              </div>
            </div>
          </div>

          {/* Timeframe Selectors */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '8px', padding: '3px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: '12m', label: '12 Months' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTimeRange(t.id);
                  setActivePoint(null);
                }}
                style={{
                  background: timeRange === t.id ? 'var(--primary)' : 'transparent',
                  color: timeRange === t.id ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: timeRange === t.id ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Metric Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Period Gross</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#c7d2fe', marginTop: '0.15rem' }}>
              {formatINR(activeData.summary.total)}
            </div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Orders Volume</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginTop: '0.15rem' }}>
              {activeData.summary.orders} transactions
            </div>
          </div>
          <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Daily Average</span>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.15rem' }}>
              {formatINR(activeData.summary.avgDaily)}
            </div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '0.65rem 0.85rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Peak Velocity</span>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.35rem' }}>
              {activeData.summary.peakDay}
            </div>
          </div>
        </div>

        {/* SVG Interactive Area Chart */}
        <div style={{ position: 'relative', width: '100%', height: '230px', userSelect: 'none' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%', overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="revenueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Grid lines */}
            {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
              const y = svgHeight - paddingY - ratio * usableHeight;
              const val = Math.round(minVal + ratio * (maxVal - minVal));
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="rgba(148, 163, 184, 0.6)"
                    fontSize="9"
                    fontWeight="600"
                  >
                    ₹{(val / 1000).toFixed(0)}k
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill */}
            <path d={areaPath} fill="url(#revenueGrad)" />

            {/* Stroke Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              filter="url(#glow)"
            />

            {/* Data Points and Interaction Circles */}
            {points.map((p, idx) => {
              const coords = coordsList[idx];
              const isHovered = activePoint?.index === idx;

              return (
                <g key={idx} style={{ cursor: 'pointer' }}>
                  {/* Vertical Crosshair Line when hovered */}
                  {isHovered && (
                    <line
                      x1={coords.x}
                      y1={paddingY}
                      x2={coords.x}
                      y2={svgHeight - paddingY}
                      stroke="rgba(99, 102, 241, 0.5)"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Outer glow ring on hover */}
                  {isHovered && (
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="9"
                      fill="rgba(99, 102, 241, 0.25)"
                      stroke="#818cf8"
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Inner Solid Point */}
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r={isHovered ? 5 : 3.5}
                    fill={isHovered ? '#38bdf8' : '#6366f1'}
                    stroke="#0f172a"
                    strokeWidth="2"
                    onMouseEnter={() => setActivePoint({ ...p, index: idx, coords })}
                  />

                  {/* X-Axis Label */}
                  <text
                    x={coords.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    fill={isHovered ? '#c7d2fe' : 'rgba(148, 163, 184, 0.8)'}
                    fontSize="9.5"
                    fontWeight={isHovered ? '700' : '500'}
                  >
                    {p.label}
                  </text>

                  {/* Invisible Hit Area for easier touch/hover */}
                  <rect
                    x={coords.x - 20}
                    y={paddingY}
                    width={40}
                    height={usableHeight}
                    fill="transparent"
                    onMouseEnter={() => setActivePoint({ ...p, index: idx, coords })}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Tooltip Card */}
          {activePoint && (
            <div
              style={{
                position: 'absolute',
                left: `${(activePoint.coords.x / svgWidth) * 100}%`,
                top: `${(activePoint.coords.y / svgHeight) * 100}%`,
                transform: 'translate(-50%, -125%)',
                background: 'rgba(15, 23, 42, 0.94)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(99, 102, 241, 0.3)',
                pointerEvents: 'none',
                zIndex: 10,
                whiteSpace: 'nowrap'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>{activePoint.date}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.1rem' }}>
                {formatINR(activePoint.revenue)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span>• {activePoint.orders} completed orders</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Secondary Analytics Grid: Donut Status & Category Contribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.5rem' }}>
        {/* A. Fulfillment Health Donut Chart */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Fulfillment Distribution</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>Active parcel progression pipeline</p>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
              98.4% On-Time SLA
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '130px', height: '130px', flexShrink: 0 }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track */}
                <circle
                  cx="50"
                  cy="50"
                  r={donutR}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="12"
                />
                {statusSlices.map((slice, i) => {
                  const dashLength = (slice.pct / 100) * circumference;
                  const dashOffset = -accumulatedOffset;
                  accumulatedOffset += dashLength;

                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r={donutR}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="12"
                      strokeDasharray={`${dashLength} ${circumference - dashLength}`}
                      strokeDashoffset={dashOffset}
                      strokeLinecap="round"
                    />
                  );
                })}
              </svg>

              {/* Center Donut Label */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                  {liveTotalOrders || 742}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '2px' }}>
                  Total Orders
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {statusSlices.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                    <span style={{ color: '#cbd5e1' }}>{s.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: '#f8fafc' }}>{s.pct}%</span>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>({s.count})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* B. Category Revenue Breakdown */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Category Contribution</h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>Revenue share by product department</p>
            </div>
            <BarChart3 size={16} color="var(--primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {CATEGORY_CONTRIBUTION.map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{cat.name}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ color: '#94a3b8' }}>{formatINR(cat.amount)}</span>
                    <span style={{ fontWeight: 800, color: cat.color }}>{cat.share}%</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: '7px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${cat.share}%`,
                      height: '100%',
                      background: cat.color,
                      borderRadius: '999px',
                      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
