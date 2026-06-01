import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeBox({ text, size = 180 }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(canvasRef.current, text, {
        width: size, margin: 1,
        color: { dark: '#2d1a10', light: '#ffffff' }
      }, (err) => { if (err) console.error(err) })
    }
  }, [text, size])
  return <canvas ref={canvasRef} style={{ display: 'block', maxWidth: '100%', height: 'auto' }} />
}
