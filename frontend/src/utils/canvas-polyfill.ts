// Canvas polyfill for environments where canvas is not available
// This provides a basic fallback for chart libraries that might need canvas

if (typeof window !== 'undefined' && !window.HTMLCanvasElement) {
  // Basic canvas polyfill for environments without canvas support
  console.warn('Canvas not available, using polyfill');
  
  // Create a minimal canvas polyfill
  const CanvasPolyfill = function() {
    return {
      getContext: () => ({
        fillRect: () => {},
        clearRect: () => {},
        getImageData: () => ({ data: new Uint8ClampedArray(0) }),
        putImageData: () => {},
        createImageData: () => ({ data: new Uint8ClampedArray(0) }),
        setTransform: () => {},
        drawImage: () => {},
        save: () => {},
        fillText: () => {},
        restore: () => {},
        beginPath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        closePath: () => {},
        stroke: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        arc: () => {},
        fill: () => {},
        measureText: () => ({ width: 0 }),
        transform: () => {},
        rect: () => {},
        clip: () => {},
      }),
      toDataURL: () => 'data:image/png;base64,',
      width: 0,
      height: 0,
    };
  };
  
  // Mock HTMLCanvasElement
  (window as any).HTMLCanvasElement = CanvasPolyfill;
}

export {};
