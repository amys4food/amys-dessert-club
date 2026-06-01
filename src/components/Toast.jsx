export default function Toast({ message }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--ink)', color: '#fff',
      padding: '12px 22px', borderRadius: '999px',
      fontSize: '14px', zIndex: 9999, fontWeight: 500,
      boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
      maxWidth: 'calc(100vw - 32px)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }}>
      {message}
    </div>
  )
}
