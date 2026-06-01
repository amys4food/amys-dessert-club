import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { groupOrdersByDate, getTopProducts, formatCurrency } from '../../lib/utils'

const COLORS = ['#ff8c42', '#4a89dc', '#ffd23f', '#e63946', '#6bb56b', '#a87b5a', '#9c5fb6', '#5fb6a3']

export default function AdminAnalytics({ orders }) {
  const [period, setPeriod] = useState('day') // day / month / year
  const [range, setRange] = useState('30')    // 7 / 30 / 90 / all

  // 過濾有效訂單(扣除取消)
  const validOrders = useMemo(() =>
    orders.filter(o => o.status !== 'cancelled'),
  [orders])

  // 依時間範圍過濾
  const filteredOrders = useMemo(() => {
    if (range === 'all') return validOrders
    const days = parseInt(range)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return validOrders.filter(o => new Date(o.createdAt) >= cutoff)
  }, [validOrders, range])

  // 總計
  const totalRevenue = filteredOrders.reduce((s, o) => s + o.total, 0)
  const totalCount = filteredOrders.length
  const avgOrder = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0
  const completedCount = filteredOrders.filter(o => o.status === 'completed').length

  // 時序資料
  const timeSeriesData = useMemo(() => {
    const data = groupOrdersByDate(filteredOrders, period)
    return data.map(d => ({
      ...d,
      label: period === 'year' ? d.date :
             period === 'month' ? d.date.slice(2) : d.date.slice(5)
    }))
  }, [filteredOrders, period])

  // 最熱銷商品
  const topProducts = useMemo(() => getTopProducts(filteredOrders, 8), [filteredOrders])

  // 訂單狀態分布
  const statusDistribution = useMemo(() => {
    const counts = { pending: 0, confirmed: 0, completed: 0 }
    filteredOrders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
    return [
      { name: '待處理', value: counts.pending, color: '#ffd23f' },
      { name: '已確認', value: counts.confirmed, color: '#4a89dc' },
      { name: '已完成', value: counts.completed, color: '#6bb56b' }
    ].filter(d => d.value > 0)
  }, [filteredOrders])

  return (
    <div>
      {/* 期間切換 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', gap: '4px',
          background: 'var(--cream-light)', padding: '4px',
          borderRadius: '999px'
        }}>
          {[
            { v: '7', l: '近 7 天' },
            { v: '30', l: '近 30 天' },
            { v: '90', l: '近 90 天' },
            { v: 'all', l: '全部' }
          ].map(opt => (
            <button key={opt.v} onClick={() => setRange(opt.v)}
              className="fredoka"
              style={tabStyle(range === opt.v)}>
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* 統計卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px', marginBottom: '18px'
      }}>
        <BigStat label="總營業額" value={formatCurrency(totalRevenue)} color="var(--orange-dark)" bg="#ffe5c4" icon="💰" />
        <BigStat label="訂單數" value={totalCount} color="var(--blue-dark)" bg="#dceefb" icon="📦" />
        <BigStat label="客單價" value={formatCurrency(avgOrder)} color="#a87600" bg="#fff3d6" icon="🎯" />
        <BigStat label="已完成單" value={completedCount} color="#2d6b2d" bg="#d4eed4" icon="✓" />
      </div>

      {/* 營業額趨勢 */}
      <ChartCard title="📈 營業額趨勢">
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '12px',
          justifyContent: 'flex-end', flexWrap: 'wrap'
        }}>
          {[
            { v: 'day', l: '日' },
            { v: 'month', l: '月' },
            { v: 'year', l: '年' }
          ].map(opt => (
            <button key={opt.v} onClick={() => setPeriod(opt.v)} className="fredoka"
              style={miniTab(period === opt.v)}>
              {opt.l}
            </button>
          ))}
        </div>
        {timeSeriesData.length === 0 ? (
          <Empty />
        ) : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={timeSeriesData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e2c8" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8a7560' }} />
                <YAxis tick={{ fontSize: 11, fill: '#8a7560' }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '2px solid #ff8c42', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? '營業額' : '訂單數'
                  ]}
                />
                <Line type="monotone" dataKey="revenue" stroke="#ff8c42" strokeWidth={3}
                  dot={{ fill: '#ff8c42', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      {/* 熱銷商品 */}
      <ChartCard title="🏆 熱銷商品排行">
        {topProducts.length === 0 ? (
          <Empty />
        ) : (
          <>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={topProducts} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0e2c8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8a7560' }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fontSize: 11, fill: '#8a7560' }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '2px solid #ff8c42', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value) => [value + ' 份', '數量']}
                  />
                  <Bar dataKey="qty" radius={[8, 8, 0, 0]}>
                    {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {topProducts.map((p, i) => (
                <div key={p.name} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', background: 'var(--cream-light)',
                  borderRadius: '10px', fontSize: '12px'
                }}>
                  <div className="fredoka" style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: COLORS[i % COLORS.length], color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '11px'
                  }}>{i + 1}</div>
                  <div style={{ flex: 1, fontWeight: 600, color: 'var(--brown)' }}>{p.name}</div>
                  <div className="fredoka" style={{ color: 'var(--orange-dark)', fontWeight: 700 }}>
                    {p.qty} 份 · {formatCurrency(p.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </ChartCard>

      {/* 訂單狀態分布 */}
      <ChartCard title="🥧 訂單狀態分布">
        {statusDistribution.length === 0 ? <Empty /> : (
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, value }) => `${name} ${value}`}>
                  {statusDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>
    </div>
  )
}

function tabStyle(active) {
  return {
    padding: '8px 16px',
    background: active ? 'var(--orange)' : 'transparent',
    color: active ? '#fff' : 'var(--muted)',
    border: 'none', borderRadius: '999px',
    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Fredoka, Noto Sans TC, sans-serif'
  }
}

function miniTab(active) {
  return {
    padding: '5px 12px',
    background: active ? 'var(--blue)' : 'var(--cream-light)',
    color: active ? '#fff' : 'var(--muted)',
    border: 'none', borderRadius: '999px',
    fontSize: '11px', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Fredoka, Noto Sans TC, sans-serif'
  }
}

function BigStat({ label, value, color, bg, icon }) {
  return (
    <div style={{
      background: bg, borderRadius: '16px', padding: '14px 16px'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '4px'
      }}>
        <div style={{ fontSize: '11px', color, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: '16px' }}>{icon}</div>
      </div>
      <div className="fredoka" style={{ fontSize: '20px', fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '16px',
      marginBottom: '14px', border: '2px solid var(--line)'
    }}>
      <div className="fredoka" style={{
        fontSize: '15px', fontWeight: 700, color: 'var(--brown)',
        marginBottom: '12px'
      }}>{title}</div>
      {children}
    </div>
  )
}

function Empty() {
  return (
    <div style={{
      padding: '40px 20px', textAlign: 'center',
      color: 'var(--muted)', fontSize: '13px',
      background: 'var(--cream-light)', borderRadius: '10px'
    }}>📊 此期間尚無訂單資料</div>
  )
}
