'use client';

import { useEffect, useRef } from 'react';

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stringifiedConfig = typeof config === 'string' ? config : JSON.stringify(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Skip re-injecting if container already has this configuration active
    if (
      container.getAttribute('data-loaded-config') === stringifiedConfig &&
      container.querySelector('.tradingview-widget-container__widget')
    ) {
      return;
    }

    // Clean previous widget markup
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = `${height}px`;
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = scriptUrl;
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = stringifiedConfig;
    container.appendChild(script);

    container.setAttribute('data-loaded-config', stringifiedConfig);

    return () => {
      // In React Strict Mode (dev), effects unmount and remount immediately.
      // Erasing container.innerHTML during in-flight script load detaches TradingView's script,
      // causing "Uncaught TypeError: Cannot read properties of null (reading 'querySelector')".
      // Preserving container content during remount prevents this crash.
      // If config or scriptUrl changes, the next effect run cleans up innerHTML before re-injecting.
    };
  }, [scriptUrl, stringifiedConfig, height]);

  return containerRef;
};

export default useTradingViewWidget;
