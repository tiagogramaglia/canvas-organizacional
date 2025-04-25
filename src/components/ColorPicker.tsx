import React from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const colors = [
    '#000000', // Negro
    '#ff0000', // Rojo
    '#00ff00', // Verde
    '#0000ff', // Azul
    '#ffff00', // Amarillo
    '#ff00ff', // Magenta
    '#00ffff', // Cian
    '#ff8000', // Naranja
    '#8000ff', // Púrpura
    '#ff0080', // Rosa
  ];

  return (
    <div>
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
        {colors.map((c) => (
          <div
            key={c}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: c,
              cursor: 'pointer',
              border: color === c ? '2px solid #333' : '1px solid #ccc',
            }}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;