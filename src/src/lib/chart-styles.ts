import type { CSSProperties } from 'react';

const FONT_MONO = 'var(--font-space-mono), "Space Mono", monospace';

export const tooltipContentStyle: CSSProperties = {
  backgroundColor: '#fff',
  border: '2px solid #000',
  borderRadius: 0,
  boxShadow: '2px 2px 0px #000',
  fontFamily: FONT_MONO,
  padding: '12px',
  lineHeight: 1.5,
};

export const tooltipLabelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  marginBottom: 4,
  color: '#000',
};

export const tooltipItemStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: '#000',
};

export const tooltipCursorStroke = {
  stroke: '#000',
  strokeWidth: 2,
  strokeDasharray: '4 4',
};

export const tooltipCursorFill = { fill: '#00000010' };

export { FONT_MONO };
