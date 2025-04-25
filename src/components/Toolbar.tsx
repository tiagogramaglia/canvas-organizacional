import React from 'react';

// Definimos el tipo de herramienta usado en App.tsx
export type Tool = 'select' | 'line' | 'rectangle' | 'circle' | 'arrow' | 'text';

export interface ToolbarProps {
  tool: Tool;
  setTool: React.Dispatch<React.SetStateAction<Tool>>;
}

const Toolbar: React.FC<ToolbarProps> = ({ tool, setTool }) => {
  // Función para renderizar iconos SVG simples para cada herramienta
  const renderIcon = (toolType: Tool) => {
    const size = 24;
    const selected = tool === toolType;
    const color = selected ? '#3498db' : '#333';
    const style = {
      display: 'block',
      margin: '0 auto',
      marginBottom: '4px'
    };

    switch (toolType) {
      case 'select':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
            <path d="M7,14 L14,7 L16,9 L11,14 L16,19 L14,21 L9,16 L7,18 Z" fill={color} />
          </svg>
        );
      case 'line':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
            <line x1="5" y1="19" x2="19" y2="5" stroke={color} strokeWidth="2" />
          </svg>
        );
      case 'rectangle':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
            <rect x="4" y="4" width="16" height="16" stroke={color} strokeWidth="2" fill="none" />
          </svg>
        );
      case 'circle':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
            <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="2" fill="none" />
          </svg>
        );
      case 'arrow':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
            <path d="M5,19 L16,8 M16,8 L10,8 M16,8 L16,14" stroke={color} strokeWidth="2" fill="none" />
          </svg>
        );
      case 'text':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
            <text x="6" y="16" fontSize="12" fontWeight="bold" fill={color}>Aa</text>
          </svg>
        );
      default:
        return null;
    }
  };

  // Texto descriptivo para los botones de herramientas
  const getToolName = (toolType: Tool): string => {
    switch (toolType) {
      case 'select':
        return 'Seleccionar';
      case 'line':
        return 'Línea';
      case 'rectangle':
        return 'Rectángulo';
      case 'circle':
        return 'Círculo';
      case 'arrow':
        return 'Flecha';
      case 'text':
        return 'Texto';
      default:
        return toolType;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: '#fff',
        borderRadius: 8,
        padding: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 1000
      }}
    >
      {(['select', 'line', 'rectangle', 'circle', 'arrow', 'text'] as Tool[]).map((toolType) => (
        <button
          key={toolType}
          onClick={() => setTool(toolType)}
          title={getToolName(toolType)}
          style={{
            padding: '8px',
            borderRadius: '4px',
            background: tool === toolType ? '#e6f2ff' : 'transparent',
            border: tool === toolType ? '1px solid #3498db' : '1px solid #ddd',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '70px',
            transition: 'background 0.2s, border 0.2s'
          }}
        >
          {renderIcon(toolType)}
          <span>{getToolName(toolType)}</span>
        </button>
      ))}
    </div>
  );
};

export default Toolbar;