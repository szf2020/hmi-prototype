import { useEffect, useState, useRef } from 'react';
import { useHMI } from '../contexts/HMIContext';
import StatusBar from './central/StatusBar';
import BottomNav from './central/BottomNav';
import NavigationApp from './central/NavigationApp';
import CameraApp from './central/CameraApp';
import SettingsApp from './central/SettingsApp';
import WidgetsContainer from './central/WidgetsContainer';
import Vehicle3D from './central/Vehicle3D';
import './CentralDisplay.css';
import './central/NavigationApp.css';

function CentralDisplay() {
  const { registerDisplay } = useHMI();
  const [activeView, setActiveView] = useState('home');
  const [canvasExpanded, setCanvasExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(null);
  const dragHandleRef = useRef(null);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const rafRef = useRef(null);
  const pendingWidthRef = useRef(null);
  const MIN_DRAG_DISTANCE = 50; // Minimum pixels to drag before triggering collapse/expand

  useEffect(() => {
    registerDisplay('central');
  }, []);

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    hasDraggedRef.current = false;
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    dragDistanceRef.current = 0;
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      startWidthRef.current = rect.width;
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startXRef.current;
    dragDistanceRef.current = Math.abs(deltaX);
    
    // Mark that dragging has occurred
    if (dragDistanceRef.current > 5) {
      hasDraggedRef.current = true;
    }
    
    // Only update width if user has actually dragged
    if (!hasDraggedRef.current) return;
    
    // Get the viewport width and widgets width
    const viewportWidth = window.innerWidth;
    const widgetsWidth = 610; // WidgetsContainer width
    const rightPadding = 24; // padding-right on home-vehicle-view
    const maxWidth = viewportWidth - rightPadding;
    
    // Calculate min width (leave space for widgets)
    const minWidth = viewportWidth - widgetsWidth - rightPadding;
    
    const newWidth = startWidthRef.current + deltaX;
    
    // Prevent dragging left when already at minimum width (collapsed)
    // Check if we're trying to go below min width
    if (newWidth <= minWidth && deltaX < 0) {
      return; // Block leftward drag when already at minimum
    }
    
    // Clamp the width between min and max
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    
    // Store pending width for next frame
    pendingWidthRef.current = clampedWidth;
    
    // Use requestAnimationFrame for smooth updates
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingWidthRef.current !== null) {
          const width = pendingWidthRef.current;
          setCanvasWidth(width);
          
          // Update expanded state
          if (width >= maxWidth - 50) {
            setCanvasExpanded(true);
          } else {
            setCanvasExpanded(false);
          }
        }
        rafRef.current = null;
      });
    }
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Cancel any pending animation frame
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // Check if drag distance meets minimum threshold
    if (dragDistanceRef.current < MIN_DRAG_DISTANCE) {
      // If drag distance is too small, don't change anything
      // Only revert if we actually set a width during drag
      if (canvasWidth !== null) {
        setCanvasWidth(null);
      }
      // Reset drag tracking
      hasDraggedRef.current = false;
      dragDistanceRef.current = 0;
      pendingWidthRef.current = null;
      return;
    }
    
    // Snap to expanded or collapsed state
    const viewportWidth = window.innerWidth;
    const rightPadding = 24;
    const maxWidth = viewportWidth - rightPadding;
    const widgetsWidth = 610;
    const minWidth = viewportWidth - widgetsWidth - rightPadding;
    const draggableRange = maxWidth - minWidth;
    
    if (canvasWidth) {
      if (canvasExpanded) {
        // When expanded: drag left 50% from max to collapse
        const collapseThreshold = maxWidth - (draggableRange * 0.50);
        if (canvasWidth < collapseThreshold) {
          setCanvasExpanded(false);
          setCanvasWidth(null);
        } else {
          setCanvasWidth(maxWidth);
        }
      } else {
        // When collapsed: drag right 50% from min to expand
        const expandThreshold = minWidth + (draggableRange * 0.50);
        if (canvasWidth > expandThreshold) {
          setCanvasExpanded(true);
          setCanvasWidth(maxWidth);
        } else {
          setCanvasExpanded(false);
          setCanvasWidth(null);
        }
      }
    }
    
    // Reset drag tracking
    hasDraggedRef.current = false;
    dragDistanceRef.current = 0;
    pendingWidthRef.current = null;
  };

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      document.addEventListener('touchmove', handleDragMove);
      document.addEventListener('touchend', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging, canvasWidth]);

  return (
    <div className="central-display">
      <StatusBar />
      
      {/* Home View - Vehicle Image and Widgets */}
      {activeView === 'home' && (
        <div className="home-vehicle-view">
          <div 
            ref={containerRef}
            className="home-vehicle-container"
            style={{
              width: canvasWidth ? `${canvasWidth}px` : undefined,
              flex: canvasWidth ? 'none' : 1,
              transition: isDragging ? 'none' : 'width 0.3s ease, flex 0.3s ease',
            }}
          >
            <Vehicle3D />
            
            {/* Drag Handle */}
            <div 
              ref={dragHandleRef}
              className={`canvas-drag-handle ${isDragging ? 'dragging' : ''} ${canvasExpanded ? 'expanded' : 'collapsed'}`}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className="drag-handle-line"></div>
            </div>
          </div>
          
          {!canvasExpanded && <WidgetsContainer setActiveView={setActiveView} />}
        </div>
      )}
      
      {/* Navigation App */}
      {activeView === 'navigation' && <NavigationApp key="navigation-map" />}
      
      {/* Camera App */}
      {activeView === 'camera' && <CameraApp />}
      
      {/* Settings App */}
      {activeView === 'settings' && <SettingsApp />}
      
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
}

export default CentralDisplay;
