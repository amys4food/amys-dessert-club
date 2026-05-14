export default function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--ink)', color: 'var(--paper)',
      padding: '10px 20px', borderRadius: '999px',
      fontSize: '13px', zIndex: 1000, fontWeight: 500,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
    }}>
      {message}
    </div>
  )
}
