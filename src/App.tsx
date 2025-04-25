import React, { useState, useRef, useEffect } from 'react';
import Toolbar, { Tool } from './components/Toolbar';
import ColorPicker from './components/ColorPicker';

// Tipos de figuras que podemos dibujar
type ShapeType = 'select' | 'line' | 'rectangle' | 'circle' | 'arrow' | 'text';

// Interfaz para cada objeto dibujado
interface DrawObject {
  id: string;
  type: ShapeType;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  text?: string;
  isSelected?: boolean;
}

const App: React.FC = () => {
  // Estados
  const [tool, setTool] = useState<Tool>('select'); // Cambiado a 'select' como herramienta predeterminada
  const [color, setColor] = useState<string>('#000000');
  const [drawing, setDrawing] = useState<boolean>(false);
  const [objects, setObjects] = useState<DrawObject[]>([]);
  const [currentObject, setCurrentObject] = useState<DrawObject | null>(null);
  const [selectedObject, setSelectedObject] = useState<DrawObject | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [textPosition, setTextPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [lastMousePos, setLastMousePos] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Referencias
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textInputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Efecto para actualizar el tamaño del canvas cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setCanvasSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Inicializar tamaño

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Efecto para redibujar el canvas cuando cambian los objetos
  useEffect(() => {
    redrawCanvas();
  }, [objects, selectedObject, canvasSize]);

  // Efecto para el input de texto - MEJORADO
  useEffect(() => {
    if (showTextInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextInput]);

  // Función para redibujar el canvas completo
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar todos los objetos
    objects.forEach((obj) => {
      drawShape(ctx, obj);
      
      // Dibujar el borde de selección si el objeto está seleccionado
      if (obj.isSelected) {
        drawSelectionBorder(ctx, obj);
      }
    });
  };

  // Función para dibujar un objeto específico
  const drawShape = (ctx: CanvasRenderingContext2D, obj: DrawObject) => {
    // No dibujamos objetos de tipo 'select'
    if (obj.type === 'select') return;
    
    ctx.strokeStyle = obj.color;
    ctx.fillStyle = obj.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    switch (obj.type) {
      case 'line':
        ctx.moveTo(obj.startX, obj.startY);
        ctx.lineTo(obj.endX, obj.endY);
        ctx.stroke();
        break;
      
      case 'rectangle':
        ctx.strokeRect(
          Math.min(obj.startX, obj.endX),
          Math.min(obj.startY, obj.endY),
          Math.abs(obj.endX - obj.startX),
          Math.abs(obj.endY - obj.startY)
        );
        break;
      
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(obj.endX - obj.startX, 2) + Math.pow(obj.endY - obj.startY, 2)
        );
        ctx.arc(obj.startX, obj.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      
      case 'arrow':
        drawArrow(ctx, obj.startX, obj.startY, obj.endX, obj.endY, obj.color);
        break;
      
      case 'text':
        if (obj.text) {
          ctx.font = '16px Arial';
          ctx.fillText(obj.text, obj.startX, obj.startY);
        }
        break;
    }
  };

  // Función para dibujar flechas
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) => {
    const headLength = 10;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    // Línea
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Punta de flecha
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };

  // Función para dibujar el borde de selección
  const drawSelectionBorder = (ctx: CanvasRenderingContext2D, obj: DrawObject) => {
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1;
    
    let x, y, width, height;
    
    switch (obj.type) {
      case 'line':
      case 'arrow':
        // Para líneas y flechas, dibujamos un rectángulo alrededor
        const padding = 5;
        x = Math.min(obj.startX, obj.endX) - padding;
        y = Math.min(obj.startY, obj.endY) - padding;
        width = Math.abs(obj.endX - obj.startX) + padding * 2;
        height = Math.abs(obj.endY - obj.startY) + padding * 2;
        ctx.strokeRect(x, y, width, height);
        
        // Dibujar controles de redimensionamiento
        drawResizeHandles(ctx, x, y, width, height);
        break;
      
      case 'rectangle':
        x = Math.min(obj.startX, obj.endX);
        y = Math.min(obj.startY, obj.endY);
        width = Math.abs(obj.endX - obj.startX);
        height = Math.abs(obj.endY - obj.startY);
        ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
        
        // Dibujar controles de redimensionamiento
        drawResizeHandles(ctx, x - 2, y - 2, width + 4, height + 4);
        break;
      
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(obj.endX - obj.startX, 2) + Math.pow(obj.endY - obj.startY, 2)
        );
        ctx.beginPath();
        ctx.arc(obj.startX, obj.startY, radius + 2, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Dibujar controles de redimensionamiento para el círculo
        const circleX = obj.startX - radius - 2;
        const circleY = obj.startY - radius - 2;
        const circleDiameter = (radius + 2) * 2;
        drawResizeHandles(ctx, circleX, circleY, circleDiameter, circleDiameter);
        break;
      
      case 'text':
        if (obj.text) {
          ctx.font = '16px Arial';
          const metrics = ctx.measureText(obj.text);
          const textX = obj.startX - 2;
          const textY = obj.startY - 16 - 2;
          const textWidth = metrics.width + 4;
          const textHeight = 20;
          
          ctx.strokeRect(textX, textY, textWidth, textHeight);
          
          // Dibujar controles de redimensionamiento
          drawResizeHandles(ctx, textX, textY, textWidth, textHeight);
        }
        break;
    }
    
    ctx.setLineDash([]);  // Restaurar línea normal
  };

  // Función para dibujar los controles de redimensionamiento
  const drawResizeHandles = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
    const handleSize = 8;
    ctx.fillStyle = '#3498db';
    ctx.setLineDash([]);
    
    // Esquinas
    ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize); // top-left
    ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize); // top-right
    ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize); // bottom-left
    ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize); // bottom-right
    
    // Centros de los lados
    ctx.fillRect(x + width/2 - handleSize/2, y - handleSize/2, handleSize, handleSize); // top-center
    ctx.fillRect(x + width/2 - handleSize/2, y + height - handleSize/2, handleSize, handleSize); // bottom-center
    ctx.fillRect(x - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize); // left-center
    ctx.fillRect(x + width - handleSize/2, y + height/2 - handleSize/2, handleSize, handleSize); // right-center
  };

  // Función para encontrar un objeto en una posición dada
  const findObjectAtPosition = (x: number, y: number): DrawObject | null => {
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      let boundingBox = { x: 0, y: 0, width: 0, height: 0 };

      switch (obj.type) {
        case 'line':
        case 'arrow':
          const padding = 5;
          boundingBox = {
            x: Math.min(obj.startX, obj.endX) - padding,
            y: Math.min(obj.startY, obj.endY) - padding,
            width: Math.abs(obj.endX - obj.startX) + padding * 2,
            height: Math.abs(obj.endY - obj.startY) + padding * 2
          };
          break;

        case 'rectangle':
          boundingBox = {
            x: Math.min(obj.startX, obj.endX),
            y: Math.min(obj.startY, obj.endY),
            width: Math.abs(obj.endX - obj.startX),
            height: Math.abs(obj.endY - obj.startY)
          };
          break;

        case 'circle':
          const radius = Math.sqrt(Math.pow(obj.endX - obj.startX, 2) + Math.pow(obj.endY - obj.startY, 2));
          boundingBox = {
            x: obj.startX - radius,
            y: obj.startY - radius,
            width: radius * 2,
            height: radius * 2
          };
          break;

        case 'text':
          if (obj.text) {
            const canvas = canvasRef.current;
            if (!canvas) return null;

            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            ctx.font = '16px Arial';
            const metrics = ctx.measureText(obj.text);

            boundingBox = {
              x: obj.startX,
              y: obj.startY - 16,
              width: metrics.width,
              height: 20
            };
          }
          break;
      }

      if (
        x >= boundingBox.x &&
        x <= boundingBox.x + boundingBox.width &&
        y >= boundingBox.y &&
        y <= boundingBox.y + boundingBox.height
      ) {
        return obj;
      }
    }
    return null;
  };

  // Manejador para iniciar el dibujo - ACTUALIZADO PARA MOVER Y REDIMENSIONAR
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Si la herramienta es texto, mostramos el input
    if (tool === 'text') {
      setTextPosition({ x, y });
      setShowTextInput(true);
      setTextInput(''); // Reset text input when starting new text
      return;
    }
    
    // Guardar la posición actual del ratón
    setLastMousePos({ x, y });
    
    // Comprobar si se está intentando redimensionar un objeto seleccionado
    if (selectedObject) {
      const resizeHandleType = getResizeHandleAtPosition(x, y, selectedObject);
      if (resizeHandleType) {
        setIsResizing(true);
        setResizeHandle(resizeHandleType);
        return;
      }
    }
    
    // Comprobar si se ha hecho clic en un objeto existente (para selección o movimiento)
    const clickedObject = findObjectAtPosition(x, y);
    
    if (clickedObject) {
      // Si ya está seleccionado, preparar para mover
      if (clickedObject.isSelected) {
        setIsDragging(true);
        // Calcular el offset para el arrastre
        setDragOffset({
          x: x - (clickedObject.type === 'circle' ? clickedObject.startX : Math.min(clickedObject.startX, clickedObject.endX)),
          y: y - (clickedObject.type === 'circle' ? clickedObject.startY : Math.min(clickedObject.startY, clickedObject.endY))
        });
      } else {
        // Deseleccionar objeto anterior
        if (selectedObject) {
          setObjects(objects.map(obj => 
            obj.id === selectedObject.id ? { ...obj, isSelected: false } : obj
          ));
        }
        
        // Seleccionar el nuevo objeto
        setSelectedObject(clickedObject);
        setObjects(objects.map(obj => 
          obj.id === clickedObject.id ? { ...obj, isSelected: true } : obj
        ));
      }
      return; // No continuamos con el dibujo si hemos seleccionado un objeto
    } else {
      // Deseleccionar si se hace clic en un área vacía
      if (selectedObject) {
        setObjects(objects.map(obj => 
          obj.id === selectedObject.id ? { ...obj, isSelected: false } : obj
        ));
        setSelectedObject(null);
      }
      
      // No iniciamos un nuevo dibujo si estamos en modo selección
      if (tool === 'select') {
        return;
      }
      
      // Iniciar nuevo dibujo para otras herramientas
      const newObject: DrawObject = {
        id: Date.now().toString(),
        type: tool,
        startX: x,
        startY: y,
        endX: x,
        endY: y,
        color: color
      };
      
      setCurrentObject(newObject);
      setDrawing(true);
    }
  };

  // Función para detectar si se está haciendo clic en un control de redimensionamiento
  const getResizeHandleAtPosition = (x: number, y: number, obj: DrawObject): string | null => {
    const handleSize = 8;
    let boundingBox = { x: 0, y: 0, width: 0, height: 0 };
    
    // Calcular el bounding box según el tipo de objeto
    switch (obj.type) {
      case 'line':
      case 'arrow':
        const padding = 5;
        boundingBox = {
          x: Math.min(obj.startX, obj.endX) - padding,
          y: Math.min(obj.startY, obj.endY) - padding,
          width: Math.abs(obj.endX - obj.startX) + padding * 2,
          height: Math.abs(obj.endY - obj.startY) + padding * 2
        };
        break;
      
      case 'rectangle':
        boundingBox = {
          x: Math.min(obj.startX, obj.endX) - 2,
          y: Math.min(obj.startY, obj.endY) - 2,
          width: Math.abs(obj.endX - obj.startX) + 4,
          height: Math.abs(obj.endY - obj.startY) + 4
        };
        break;
      
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(obj.endX - obj.startX, 2) + Math.pow(obj.endY - obj.startY, 2)
        );
        boundingBox = {
          x: obj.startX - radius - 2,
          y: obj.startY - radius - 2,
          width: (radius + 2) * 2,
          height: (radius + 2) * 2
        };
        break;
      
      case 'text':
        if (obj.text) {
          const canvas = canvasRef.current;
          if (!canvas) return null;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          
          ctx.font = '16px Arial';
          const metrics = ctx.measureText(obj.text);
          
          boundingBox = {
            x: obj.startX - 2,
            y: obj.startY - 16 - 2,
            width: metrics.width + 4,
            height: 20
          };
        }
        break;
    }
    
    // Comprobar si el punto está dentro de alguno de los controles
    // Esquinas
    if (isPointInRect(x, y, boundingBox.x - handleSize/2, boundingBox.y - handleSize/2, handleSize, handleSize)) {
      return 'top-left';
    }
    if (isPointInRect(x, y, boundingBox.x + boundingBox.width - handleSize/2, boundingBox.y - handleSize/2, handleSize, handleSize)) {
      return 'top-right';
    }
    if (isPointInRect(x, y, boundingBox.x - handleSize/2, boundingBox.y + boundingBox.height - handleSize/2, handleSize, handleSize)) {
      return 'bottom-left';
    }
    if (isPointInRect(x, y, boundingBox.x + boundingBox.width - handleSize/2, boundingBox.y + boundingBox.height - handleSize/2, handleSize, handleSize)) {
      return 'bottom-right';
    }
    
    // Centros de los lados
    if (isPointInRect(x, y, boundingBox.x + boundingBox.width/2 - handleSize/2, boundingBox.y - handleSize/2, handleSize, handleSize)) {
      return 'top-center';
    }
    if (isPointInRect(x, y, boundingBox.x + boundingBox.width/2 - handleSize/2, boundingBox.y + boundingBox.height - handleSize/2, handleSize, handleSize)) {
      return 'bottom-center';
    }
    if (isPointInRect(x, y, boundingBox.x - handleSize/2, boundingBox.y + boundingBox.height/2 - handleSize/2, handleSize, handleSize)) {
      return 'left-center';
    }
    if (isPointInRect(x, y, boundingBox.x + boundingBox.width - handleSize/2, boundingBox.y + boundingBox.height/2 - handleSize/2, handleSize, handleSize)) {
      return 'right-center';
    }
    
    return null;
  };

  // Función auxiliar para comprobar si un punto está dentro de un rectángulo
  const isPointInRect = (x: number, y: number, rectX: number, rectY: number, rectWidth: number, rectHeight: number): boolean => {
    return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
  };

  // Manejador para dibujar mientras se mueve el ratón
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calcular el desplazamiento del ratón desde la última posición
    const deltaX = x - lastMousePos.x;
    const deltaY = y - lastMousePos.y;
    
    // Actualizar la última posición del ratón
    setLastMousePos({ x, y });
    
    // Si estamos redimensionando un objeto
    if (isResizing && selectedObject && resizeHandle) {
      const updatedObject = resizeObject(selectedObject, resizeHandle, x, y);
      
      // Actualizar el objeto en la lista
      setObjects(objects.map(obj => 
        obj.id === selectedObject.id ? updatedObject : obj
      ));
      
      // Actualizar el objeto seleccionado
      setSelectedObject(updatedObject);
      
      redrawCanvas();
      return;
    }
    
    // Si estamos arrastrando un objeto
    if (isDragging && selectedObject) {
      const updatedObject = moveObject(selectedObject, x, y);
      
      // Actualizar el objeto en la lista
      setObjects(objects.map(obj => 
        obj.id === selectedObject.id ? updatedObject : obj
      ));
      
      // Actualizar el objeto seleccionado
      setSelectedObject(updatedObject);
      
      redrawCanvas();
      return;
    }
    
    // Si estamos dibujando un nuevo objeto
    if (drawing && currentObject) {
      setCurrentObject({
        ...currentObject,
        endX: x,
        endY: y
      });
      
      // Dibujar el objeto actual
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      redrawCanvas();
      drawShape(ctx, { ...currentObject, endX: x, endY: y });
    }
  };

  // Función para mover un objeto
  const moveObject = (obj: DrawObject, mouseX: number, mouseY: number): DrawObject => {
    switch (obj.type) {
      case 'circle':
        // Para círculos, movemos el centro
        return {
          ...obj,
          startX: mouseX - dragOffset.x,
          startY: mouseY - dragOffset.y,
          // Mantener el radio ajustando el punto final relativo al nuevo centro
          endX: mouseX - dragOffset.x + (obj.endX - obj.startX),
          endY: mouseY - dragOffset.y + (obj.endY - obj.startY)
        };
      
      case 'line':
      case 'arrow':
        // Para líneas y flechas, calculamos el desplazamiento
        const dx = Math.min(obj.startX, obj.endX);
        const dy = Math.min(obj.startY, obj.endY);
        const width = Math.abs(obj.endX - obj.startX);
        const height = Math.abs(obj.endY - obj.startY);
        
        // Calculamos la nueva posición
        const newX = mouseX - dragOffset.x;
        const newY = mouseY - dragOffset.y;
        
        // Si la línea va de izquierda a derecha
        if (obj.startX <= obj.endX) {
          return {
            ...obj,
            startX: newX,
            startY: newY,
            endX: newX + width,
            endY: newY + height
          };
        } else {
          // Si la línea va de derecha a izquierda
          return {
            ...obj,
            startX: newX + width,
            startY: newY,
            endX: newX,
            endY: newY + height
          };
        }
      
      default:
        // Para otros objetos, movemos la esquina superior izquierda
        const minX = Math.min(obj.startX, obj.endX);
        const minY = Math.min(obj.startY, obj.endY);
        const maxX = Math.max(obj.startX, obj.endX);
        const maxY = Math.max(obj.startY, obj.endY);
        
        const newMinX = mouseX - dragOffset.x;
        const newMinY = mouseY - dragOffset.y;
        const newMaxX = newMinX + (maxX - minX);
        const newMaxY = newMinY + (maxY - minY);
        
        // Si el objeto va de izquierda a derecha y de arriba a abajo
        if (obj.startX <= obj.endX && obj.startY <= obj.endY) {
          return {
            ...obj,
            startX: newMinX,
            startY: newMinY,
            endX: newMaxX,
            endY: newMaxY
          };
        } 
        // Si el objeto va de derecha a izquierda y de arriba a abajo
        else if (obj.startX > obj.endX && obj.startY <= obj.endY) {
          return {
            ...obj,
            startX: newMaxX,
            startY: newMinY,
            endX: newMinX,
            endY: newMaxY
          };
        }
        // Si el objeto va de izquierda a derecha y de abajo a arriba
        else if (obj.startX <= obj.endX && obj.startY > obj.endY) {
          return {
            ...obj,
            startX: newMinX,
            startY: newMaxY,
            endX: newMaxX,
            endY: newMinY
          };
        }
        // Si el objeto va de derecha a izquierda y de abajo a arriba
        else {
          return {
            ...obj,
            startX: newMaxX,
            startY: newMaxY,
            endX: newMinX,
            endY: newMinY
          };
        }
    }
  };

  // Función para redimensionar un objeto
  const resizeObject = (obj: DrawObject, handle: string, mouseX: number, mouseY: number): DrawObject => {
    let minX = Math.min(obj.startX, obj.endX);
    let minY = Math.min(obj.startY, obj.endY);
    let maxX = Math.max(obj.startX, obj.endX);
    let maxY = Math.max(obj.startY, obj.endY);
    
    switch (obj.type) {
      case 'circle':
        // Para círculos, ajustamos el radio
        const centerX = obj.startX;
        const centerY = obj.startY;
        const newRadius = Math.sqrt(Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2));
        
        return {
          ...obj,
          endX: centerX + newRadius,
          endY: centerY
        };
      
      default:
        // Para otros objetos, ajustamos las coordenadas según el control que se está arrastrando
        switch (handle) {
          case 'top-left':
            minX = mouseX;
            minY = mouseY;
            break;
          case 'top-right':
            maxX = mouseX;
            minY = mouseY;
            break;
          case 'bottom-left':
            minX = mouseX;
            maxY = mouseY;
            break;
          case 'bottom-right':
            maxX = mouseX;
            maxY = mouseY;
            break;
          case 'top-center':
            minY = mouseY;
            break;
          case 'bottom-center':
            maxY = mouseY;
            break;
          case 'left-center':
            minX = mouseX;
            break;
          case 'right-center':
            maxX = mouseX;
            break;
        }
        
        // Si el objeto va de izquierda a derecha y de arriba a abajo
        if (obj.startX <= obj.endX && obj.startY <= obj.endY) {
          return {
            ...obj,
            startX: minX,
            startY: minY,
            endX: maxX,
            endY: maxY
          };
        } 
        // Si el objeto va de derecha a izquierda y de arriba a abajo
        else if (obj.startX > obj.endX && obj.startY <= obj.endY) {
          return {
            ...obj,
            startX: maxX,
            startY: minY,
            endX: minX,
            endY: maxY
          };
        }
        // Si el objeto va de izquierda a derecha y de abajo a arriba
        else if (obj.startX <= obj.endX && obj.startY > obj.endY) {
          return {
            ...obj,
            startX: minX,
            startY: maxY,
            endX: maxX,
            endY: minY
          };
        }
        // Si el objeto va de derecha a izquierda y de abajo a arriba
        else {
          return {
            ...obj,
            startX: maxX,
            startY: maxY,
            endX: minX,
            endY: minY
          };
        }
    }
  };

  // Manejador para finalizar el dibujo
  const handleMouseUp = () => {
    // Si estamos dibujando un nuevo objeto
    if (drawing && currentObject) {
      setObjects([...objects, currentObject]);
      setCurrentObject(null);
      setDrawing(false);
    }
    
    // Si estamos moviendo o redimensionando
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    }
  };

  // Función para confirmar el texto ingresado - CORREGIDA
  const handleTextInputConfirm = () => {
    if (textPosition && textInput.trim()) {
      const newTextObject: DrawObject = {
        id: Date.now().toString(),
        type: 'text',
        startX: textPosition.x,
        startY: textPosition.y,
        endX: textPosition.x,
        endY: textPosition.y,
        color: color,
        text: textInput.trim()
      };
      
      setObjects([...objects, newTextObject]);
    }
    
    // Siempre limpiamos el estado del texto al finalizar
    setTextInput('');
    setTextPosition(null);
    setShowTextInput(false);
  };

  // Función para eliminar el objeto seleccionado
  const handleDelete = () => {
    if (!selectedObject) return;
    
    setObjects(objects.filter(obj => obj.id !== selectedObject.id));
    setSelectedObject(null);
  };

  // Función para cambiar el color del objeto seleccionado
  const handleChangeColor = (newColor: string) => {
    if (!selectedObject) return;
    
    setObjects(objects.map(obj => 
      obj.id === selectedObject.id ? { ...obj, color: newColor } : obj
    ));
    
    setSelectedObject({ ...selectedObject, color: newColor });
  };

  // Función para guardar el canvas como imagen PNG
  const handleSaveImage = () => {
    if (!canvasRef.current) return;
    
    // Asegurar que no haya ningún objeto seleccionado al guardar
    const prevSelectedObject = selectedObject;
    
    if (prevSelectedObject) {
      setObjects(objects.map(obj => 
        obj.id === prevSelectedObject.id ? { ...obj, isSelected: false } : obj
      ));
      setSelectedObject(null);
    }
    
    // Esperar a que se actualice el canvas
    setTimeout(() => {
      if (!canvasRef.current) return;
      
      try {
        // Crear un enlace para descargar
        const link = document.createElement('a');
        link.download = `dibujo-${new Date().toISOString().slice(0, 10)}.png`;
        
        // Convertir canvas a imagen
        link.href = canvasRef.current.toDataURL('image/png');
        
        // Simular clic para iniciar descarga
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Restaurar selección si existía
        if (prevSelectedObject) {
          setSelectedObject(prevSelectedObject);
          setObjects(objects.map(obj => 
            obj.id === prevSelectedObject.id ? { ...obj, isSelected: true } : obj
          ));
        }
      } catch (error) {
        console.error('Error al guardar la imagen:', error);
        alert('No se pudo guardar la imagen. Intente de nuevo.');
      }
    }, 100);
  };

  // Función para manejar la cancelación del texto
  const handleTextCancel = () => {
    setTextInput('');
    setTextPosition(null);
    setShowTextInput(false);
  };

  // Cambia a la herramienta de selección después de añadir un objeto
  useEffect(() => {
    // Si acabamos de añadir un objeto (se incrementó la cantidad de objetos)
    // y la herramienta no es 'select' o 'text', cambiamos a modo de selección
    const shouldSwitchToSelect = 
      tool !== 'select' && 
      tool !== 'text' && 
      !drawing && 
      !currentObject;
    
    if (shouldSwitchToSelect) {
      setTool('select');
    }
  }, [objects.length, drawing, currentObject]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        margin: 0,
        padding: 0
      }}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <Toolbar tool={tool} setTool={setTool} />
      
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
          zIndex: 1000
        }}
      >
        <ColorPicker color={color} onChange={setColor} />
        
        {selectedObject && (
          <>
            <button 
              onClick={() => handleChangeColor(color)}
              style={{ 
                padding: '8px', 
                cursor: 'pointer', 
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: '#f0f0f0',
                transition: 'background 0.2s'
              }}
            >
              Aplicar color
            </button>
            
            <button 
              onClick={handleDelete} 
              style={{ 
              background: '#ff4d4d', 
              color: 'white',
              padding: '8px',
              cursor: 'pointer',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              transition: 'background 0.2s'
              }}
              >
              Eliminar
              </button>
              </>
              )}

              <button
              onClick={handleSaveImage}
              style={{ 
              padding: '8px', 
              cursor: 'pointer', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#4CAF50',
              color: 'white',
              fontWeight: 'bold',
              transition: 'background 0.2s'
              }}
              >
              Guardar imagen
              </button>
              </div>

              {/* Input para texto cuando la herramienta de texto está activa */}
              {showTextInput && textPosition && (
              <div
              style={{
              position: 'absolute',
              left: textPosition.x,
              top: textPosition.y,
              zIndex: 1001
              }}
              >
              <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
              if (e.key === 'Enter') {
              handleTextInputConfirm();
              } else if (e.key === 'Escape') {
              handleTextCancel();
              }
              }}
              style={{
              padding: '5px',
              border: `2px solid ${color}`,
              borderRadius: '4px',
              outline: 'none',
              fontSize: '16px'
              }}
              placeholder="Escriba texto y presione Enter"
              autoFocus
              />
              <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
              <button 
              onClick={handleTextInputConfirm}
              style={{ 
              flex: 1, 
              padding: '5px', 
              background: '#4CAF50', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
              }}
              >
              Confirmar
              </button>
              <button 
              onClick={handleTextCancel}
              style={{ 
              flex: 1, 
              padding: '5px', 
              background: '#f44336', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
              }}
              >
              Cancelar
              </button>
              </div>
              </div>
              )}

              {/* Mejora: Instrucciones de uso */}
              <div
              style={{
              position: 'absolute',
              bottom: 10,
              left: 10,
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '5px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#555'
              }}
              >
              {tool === 'select' 
                ? 'Haga clic en un objeto para seleccionarlo. Arrastre para mover. Use los controles para redimensionar.' 
                : tool === 'text' 
                  ? 'Haga clic para añadir texto' 
                  : 'Haga clic y arrastre para dibujar'}
              </div>
              </div>
              );
              };

              export default App;