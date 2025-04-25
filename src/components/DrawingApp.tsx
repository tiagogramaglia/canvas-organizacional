import React, { useRef, useState } from 'react';

const DrawingApp = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState<string>('#000000');
  const [selectedObject, setSelectedObject] = useState<null | any>(null);

  // Inicia el dibujo
  const startDrawing = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    setLastPosition({ x: offsetX, y: offsetY });

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
  };

  // Dibuja mientras el mouse se mueve
  const draw = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { offsetX, offsetY } = e.nativeEvent;
    if (lastPosition) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    }

    setLastPosition({ x: offsetX, y: offsetY });
  };

  // Termina el dibujo
  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Cambiar color de pincel
  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  // Guardar como imagen
  const handleSaveImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const imageUrl = canvas.toDataURL('image/png');

    // Crear un enlace de descarga
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'dibujo.png'; // Nombre del archivo
    link.click();
  };

  // Limpiar canvas
  const handleClearCanvas = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          border: '1px solid black',
          display: 'block',
          marginBottom: '20px',
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: '#fff',
          borderRadius: 8,
          padding: 8,
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 1000,
        }}
      >
        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
        />
        <button onClick={handleSaveImage}>
          Guardar como Imagen
        </button>
        <button onClick={handleClearCanvas} style={{ background: '#ff4d4d', color: 'white' }}>
          Limpiar Canvas
        </button>
      </div>
    </div>
  );
};

export default DrawingApp;