/** Maps a pointer event to canvas pixel space; the canvas is CSS-scaled, so scale by its ratio. */
export function eventToCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

/** Canvas pixels per CSS pixel. */
export function canvasPixelScale(canvas) {
  const { width } = canvas.getBoundingClientRect();
  return width > 0 ? canvas.width / width : 1;
}
