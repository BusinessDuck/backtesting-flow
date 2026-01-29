import type { DiagramState, AppSettings } from '../types'
import { EventsGrid } from './EventsGrid'

interface DiagramProps {
  title: string
  state: DiagramState
  settings: AppSettings
  type?: 'opening' | 'closing'
}

export function Diagram({ title, state, settings, type = 'opening' }: DiagramProps) {
  // Вычисляем historyMode из priceDataQuality для обратной совместимости
  const historyMode = settings.priceDataQuality === 'Lower time frame ticks' 
    ? 'LTF Ticks (Bar magnifier)' 
    : 'OHLC'
  const isLtf = historyMode === 'LTF Ticks (Bar magnifier)'
  const mainBarsCount = state.mainBars.length

  // Функция для получения LTF баров для конкретного Main бара
  const getLtfBarsForMainBar = (mainBarIndex: number) => {
    if (!isLtf || !state.ltfBars || state.ltfBars.length === 0) {
      return []
    }

    const isMini = mainBarIndex === 0 || mainBarIndex === mainBarsCount - 1
    
    // Для mini баров не показываем детали LTF
    if (isMini) {
      return []
    }

    // Для Bar N (index 1): показываем 4 LTF бара: Bar L - 2, Bar L - 1, Bar L, Bar L + 1 (индексы 0-3)
    // Для Bar N + 1 (index 2): показываем 4 LTF бара: Bar L + 2, Bar L + 3, Bar L + 4, Bar L + 5 (индексы 4-7)
    if (mainBarIndex === 1) {
      // Показываем 4 LTF бара: Bar L - 2, Bar L - 1, Bar L, Bar L + 1
      return state.ltfBars.slice(0, 4)
    } else if (mainBarIndex === 2) {
      // Показываем 4 LTF бара: Bar L + 2, Bar L + 3, Bar L + 4, Bar L + 5
      return state.ltfBars.slice(4, 8)
    }

    return []
  }

  // Количество LTF баров на Main бар для ExecutionsLayer
  const ltfBarsPerMainBar = isLtf ? 4 : 0

  return (
    <section className={`diagram ${isLtf ? 'diagram--ltf' : ''}`}>
      <div className="diagram__title">{title}</div>
      
      {/* Unified Grid - бары и события в одной сетке */}
      <EventsGrid
        state={state}
        executionSettings={settings.executionSettings}
        historyMode={historyMode}
        mainBarsCount={mainBarsCount}
        ltfBarsPerMainBar={ltfBarsPerMainBar}
        diagramType={type}
        getLtfBarsForMainBar={getLtfBarsForMainBar}
      />
    </section>
  )
}
