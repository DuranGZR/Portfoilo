export function getPageScale() {
  return Number(getComputedStyle(document.documentElement).zoom) || 1;
}

// DOM rectangles use screen pixels; CSS positions use pixels before page zoom.
export function getLayoutRect(element: Element | Range) {
  const rect = element.getBoundingClientRect();
  const scale = getPageScale();
  return new DOMRect(rect.x / scale, rect.y / scale, rect.width / scale, rect.height / scale);
}
