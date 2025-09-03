'use client';

import { useDevice, useTouchDevice, useReducedMotion } from '../lib/device';
import { ResponsiveLayout, ResponsiveGrid, ResponsiveText } from './Responsive';

/**
 * Demo component showing responsive design capabilities
 * Displays current device information and demonstrates responsive layouts
 */
export function ResponsiveDemo() {
  const device = useDevice();
  const isTouch = useTouchDevice();
  const reducedMotion = useReducedMotion();

  return (
    <ResponsiveLayout>
      <div className="demo-header">
        <ResponsiveText size="xl">Responsive Design Demo</ResponsiveText>
        <ResponsiveText size="medium">
          Current device: <strong>{device.type}</strong> |
          Orientation: <strong>{device.orientation}</strong> |
          Touch: <strong>{isTouch ? 'Yes' : 'No'}</strong> |
          Reduced Motion: <strong>{reducedMotion ? 'Yes' : 'No'}</strong>
        </ResponsiveText>
      </div>

      <ResponsiveGrid minColumnWidth={280}>
        <div className="demo-card">
          <h3>Device Info</h3>
          <ul>
            <li>Screen: {device.width} × {device.height}px</li>
            <li>Type: {device.type}</li>
            <li>Orientation: {device.orientation}</li>
            <li>Touch Support: {isTouch ? '✅' : '❌'}</li>
            <li>Reduced Motion: {reducedMotion ? '✅' : '❌'}</li>
          </ul>
        </div>

        <div className="demo-card">
          <h3>Breakpoints</h3>
          <ul>
            <li>Mobile: &lt; 768px</li>
            <li>Tablet: 768px - 1023px</li>
            <li>Desktop: ≥ 1024px</li>
          </ul>
          <p>Current: <strong>{device.type}</strong></p>
        </div>

        <div className="demo-card">
          <h3>Responsive Features</h3>
          <ul>
            <li>Automatic grid columns</li>
            <li>Adaptive font sizes</li>
            <li>Touch-friendly buttons</li>
            <li>Motion preferences</li>
          </ul>
        </div>
      </ResponsiveGrid>

      <style jsx>{`
        .demo-header {
          text-align: center;
          margin-bottom: 32px;
          padding: 20px;
          background: linear-gradient(135deg, #1e2a4d 0%, #172554 100%);
          color: #e6edf5;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .demo-card {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          backdrop-filter: blur(8px);
        }

        .demo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
          border-color: rgba(255,255,255,0.16);
        }

        .demo-card h3 {
          margin: 0 0 16px 0;
          color: #e6edf5;
          font-size: 18px;
        }

        .demo-card ul {
          margin: 0;
          padding-left: 20px;
        }

        .demo-card li {
          margin-bottom: 8px;
          color: #9aa7bd;
        }

        .demo-card p {
          margin: 16px 0 0 0;
          font-weight: 600;
          color: #e6edf5;
        }

        /* Mobile-specific styles */
        @media (max-width: 767px) {
          .demo-header {
            margin-bottom: 20px;
            padding: 16px;
          }

          .demo-card {
            padding: 16px;
          }

          .demo-card h3 {
            font-size: 16px;
          }
        }
      `}</style>
    </ResponsiveLayout>
  );
}
