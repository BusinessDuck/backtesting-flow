import { useState } from 'react'
import './App.css'
import type { AppSettings, DiagramState } from './types'
import { SettingsPanel } from './components/SettingsPanel'
import { Diagram } from './components/Diagram'
import { initialSettings, initialOpeningState, initialClosingState } from './data/initialState'

function App() {
  const [settings, setSettings] = useState<AppSettings>(initialSettings)
  const [openingState, setOpeningState] = useState<DiagramState>(initialOpeningState)
  const [closingState, setClosingState] = useState<DiagramState>(initialClosingState)

  // Обновляем LTF бары при изменении режима истории
  const updateStateForHistoryMode = (newQuality: AppSettings['priceDataQuality']) => {
    const newMode = newQuality === 'Lower time frame ticks' 
      ? 'LTF Ticks (Bar magnifier)' 
      : 'OHLC'
    if (newMode === 'LTF Ticks (Bar magnifier)') {
      // Если переключаемся на LTF, убеждаемся что есть LTF бары
      if (!openingState.ltfBars) {
        setOpeningState({
          ...openingState,
          ltfBars: initialOpeningState.ltfBars,
        })
      }
      if (!closingState.ltfBars) {
        setClosingState({
          ...closingState,
          ltfBars: initialClosingState.ltfBars,
        })
      }
    }
  }

  const handleSettingsChange = (newSettings: AppSettings) => {
    if (newSettings.priceDataQuality !== settings.priceDataQuality) {
      updateStateForHistoryMode(newSettings.priceDataQuality)
    }
    setSettings(newSettings)
  }

  return (
    <div className="page">
      <SettingsPanel settings={settings} onSettingsChange={handleSettingsChange} />

      <main className="stage">
        <Diagram title="Order Opening (Execution)" state={openingState} settings={settings} type="opening" />
        <Diagram title="Order Closing (Execution)" state={closingState} settings={settings} type="closing" />
      </main>
    </div>
  )
}

export default App
