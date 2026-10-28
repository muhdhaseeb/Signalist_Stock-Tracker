'use client'
import { useEffect, useRef, useMemo } from "react"

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600
) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stringifiedConfig = useMemo(() => JSON.stringify(config), [config])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (container.dataset.loaded === stringifiedConfig) return

    container.innerHTML = `<div class="tradingview-widget-container__widget" style="width: 100%; height: ${height}px;"></div>`

    const script = document.createElement("script")
    script.src = scriptUrl
    script.async = true
    script.innerHTML = stringifiedConfig

    container.appendChild(script)
    container.dataset.loaded = stringifiedConfig

    return () => {
      if (container) {
        container.innerHTML = ""
        delete container.dataset.loaded
      }
    }
  }, [scriptUrl, stringifiedConfig, height])

  return containerRef
}

export default useTradingViewWidget
