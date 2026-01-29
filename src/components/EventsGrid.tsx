import type { Execution, FunCall, FillAttempt, Fill, Position, ExecutionSettings, HistoryMode, DiagramState } from '../types'
import type { LtfBar } from '../types'

interface EventsGridProps {
  state: DiagramState
  executionSettings: ExecutionSettings
  historyMode: HistoryMode
  mainBarsCount: number
  ltfBarsPerMainBar?: number
  diagramType?: 'opening' | 'closing'
  getLtfBarsForMainBar: (mainBarIndex: number) => LtfBar[]
}

interface GridEvent {
  row: number
  col: number
  span: number
  label: string
  fullLabel: string // Полное название для tooltip
  type: 'execution' | 'funCall' | 'fillAttempt' | 'fill' | 'position'
}

interface BarGroup {
  mainBarIndex: number
  startCol: number
  endCol: number
  cells: Array<{
    col: number
    label: string
    isDots: boolean
  }>
}

export function EventsGrid({
  state,
  executionSettings,
  historyMode,
  mainBarsCount,
  ltfBarsPerMainBar = 4,
  diagramType = 'opening',
  getLtfBarsForMainBar
}: EventsGridProps) {
  const isLtf = historyMode === 'LTF Ticks (Bar magnifier)'
  const isClosing = diagramType === 'closing'

  // Вычисляем структуру баров и общее количество колонок
  // Порядок баров определяется порядком в state.mainBars
  // Пустые бары занимают 2 ячейки, полные бары - 4 ячейки (O, H, L, C)
  const barGroups: BarGroup[] = []
  let totalColumns = 0

  // Обрабатываем все бары в порядке их появления в state.mainBars
  for (let i = 0; i < mainBarsCount; i++) {
    const mainBar = state.mainBars[i]
    const startCol = totalColumns
    let endCol = startCol
    const isDots = !mainBar.open && !mainBar.high && !mainBar.low && !mainBar.close

    if (isLtf) {
      // В LTF режиме: полный LTF бар занимает 4 ячейки (O, H, L, C)
      // Пустой LTF бар = 2 ячейки (уже для экономии места)
      const ltfBars = getLtfBarsForMainBar(i)
      const cells: BarGroup['cells'] = []

      if (ltfBars.length > 0) {
        ltfBars.forEach((ltfBar, ltfIndex) => {
          const ltfIsDots = !ltfBar.open && !ltfBar.high && !ltfBar.low && !ltfBar.close
          const span = ltfIsDots ? 2 : 4 // Пустой = 2 ячейки, полный = 4 ячейки
          
          cells.push({
            col: endCol,
            label: ltfBar.label || '',
            isDots: ltfIsDots
          })
          endCol += span
        })
      } else {
        // Если нет LTF баров, используем пустой бар
        endCol += isDots ? 2 : 4
      }

      barGroups.push({
        mainBarIndex: i,
        startCol,
        endCol,
        cells: cells.length > 0 ? cells : [{ col: startCol, label: mainBar.label || '...', isDots }]
      })
      totalColumns = endCol
    } else {
      // В OHLC режиме: полный бар = 4 ячейки (O, H, L, C)
      // Пустой бар = 2 ячейки (уже для экономии места)
      const span = isDots ? 2 : 4

      barGroups.push({
        mainBarIndex: i,
        startCol,
        endCol: startCol + span,
        cells: [{ col: startCol, label: mainBar.label || 'Bar N', isDots }]
      })
      totalColumns = startCol + span
    }
  }

  // Функция для вычисления колонки события в Main баре
  const getColForMainBarCell = (mainBarIndex: number, cellIndex: number): number => {
    const group = barGroups.find(g => g.mainBarIndex === mainBarIndex)
    if (!group) return 0
    
    if (isLtf) {
      // В LTF режиме Main bar cells не используются для событий
      return group.startCol
    } else {
      // В OHLC режиме: cellIndex 0-3 соответствует O, H, L, C
      const isDots = group.cells[0]?.isDots
      if (isDots) return group.startCol
      return group.startCol + cellIndex
    }
  }

  // Функция для вычисления колонки события в LTF баре
  const getColForLtfCell = (mainBarIndex: number, ltfBarIndex: number, ohlcIndex: number): number => {
    const group = barGroups.find(g => g.mainBarIndex === mainBarIndex)
    if (!group || !isLtf) return 0

    // Находим LTF бар в группе
    const ltfBarCell = group.cells[ltfBarIndex]
    if (!ltfBarCell) return group.startCol

    // Колонка = начало LTF бара + индекс O/H/L/C
    return ltfBarCell.col + ohlcIndex
  }

  // Собираем все события в сетку
  const events: GridEvent[] = []
  let currentRow = 0

  // 1. Executions
  const visibleExecutions = state.executions.filter(exec => {
    if (exec.location.type === 'main') {
      if (exec.location.price === 'close') return executionSettings.showOnMainClose
      if (exec.location.price === 'open') return executionSettings.showOnOpen
      if (exec.location.price === 'high') return executionSettings.showOnHigh
      if (exec.location.price === 'low') return executionSettings.showOnLow
    } else if (exec.location.type === 'ltf') {
      if (exec.location.price === 'close') return executionSettings.showOnLtfClose
      if (exec.location.price === 'open') return executionSettings.showOnOpen
      if (exec.location.price === 'high') return executionSettings.showOnHigh
      if (exec.location.price === 'low') return executionSettings.showOnLow
    }
    return false
  })

  visibleExecutions.forEach(exec => {
    let col = 0
    if (isLtf && exec.location.type === 'ltf' && 'barIndex' in exec.location) {
      // Преобразуем глобальный индекс LTF бара в локальный индекс внутри Main бара
      let ltfBarIndexInMain = -1
      if (exec.barIndex === 1) {
        if (exec.location.barIndex >= 0 && exec.location.barIndex < 4) {
          ltfBarIndexInMain = exec.location.barIndex
        }
      } else if (exec.barIndex === 2) {
        if (exec.location.barIndex >= 4 && exec.location.barIndex < 8) {
          ltfBarIndexInMain = exec.location.barIndex - 4
        }
      }
      
      if (ltfBarIndexInMain >= 0) {
        const priceIndex = exec.location.price === 'open' ? 0 : 
                          exec.location.price === 'high' ? 1 :
                          exec.location.price === 'low' ? 2 : 3
        col = getColForLtfCell(exec.barIndex, ltfBarIndexInMain, priceIndex)
      }
    } else if (exec.location.type === 'main') {
      const priceIndex = exec.location.price === 'open' ? 0 : 
                        exec.location.price === 'high' ? 1 :
                        exec.location.price === 'low' ? 2 : 3
      col = getColForMainBarCell(exec.barIndex, priceIndex)
    }

    events.push({
      row: currentRow,
      col,
      span: exec.span ?? 1,
      label: 'Exec',
      fullLabel: exec.label,
      type: 'execution'
    })
  })

  if (visibleExecutions.length > 0) currentRow++

  // 2. Fun Calls
  state.funCalls.forEach(funCall => {
    let col = 0
    if (isLtf) {
      const ltfBarIndex = Math.floor((funCall.cellIndex ?? 12) / 4)
      const ohlcIndex = (funCall.cellIndex ?? 12) % 4
      col = getColForLtfCell(funCall.barIndex, ltfBarIndex, ohlcIndex)
    } else {
      col = getColForMainBarCell(funCall.barIndex, funCall.cellIndex ?? 3)
    }
    
    events.push({
      row: currentRow,
      col,
      span: funCall.span ?? 1,
      label: 'Fn',
      fullLabel: funCall.label,
      type: 'funCall'
    })
  })

  if (state.funCalls.length > 0) currentRow++

  // 3. Fill Attempts
  state.fillAttempts.forEach(attempt => {
    let col = 0
    if (isLtf) {
      const ltfBarIndex = Math.floor((attempt.cellIndex ?? 0) / 4)
      const ohlcIndex = (attempt.cellIndex ?? 0) % 4
      col = getColForLtfCell(attempt.barIndex, ltfBarIndex, ohlcIndex)
    } else {
      col = getColForMainBarCell(attempt.barIndex, attempt.cellIndex ?? 0)
    }
    events.push({
      row: currentRow,
      col,
      span: attempt.span ?? 1,
      label: 'Fill Att',
      fullLabel: attempt.label,
      type: 'fillAttempt'
    })
  })

  if (state.fillAttempts.length > 0) currentRow++

  // 4. Fills
  state.fills.forEach(fill => {
    let col = 0
    if (isLtf) {
      const ltfBarIndex = Math.floor((fill.cellIndex ?? 0) / 4)
      const ohlcIndex = (fill.cellIndex ?? 0) % 4
      col = getColForLtfCell(fill.barIndex, ltfBarIndex, ohlcIndex)
    } else {
      col = getColForMainBarCell(fill.barIndex, fill.cellIndex ?? 0)
    }
    
    events.push({
      row: currentRow,
      col,
      span: fill.span ?? 1,
      label: 'Fill',
      fullLabel: fill.label,
      type: 'fill'
    })
  })

  if (state.fills.length > 0) currentRow++

  // 5. Positions
  state.positions.forEach(position => {
    const group = barGroups.find(g => g.mainBarIndex === position.barIndex)
    let startCol = group?.startCol || 0
    
    if (!isLtf && !isClosing) {
      // В OHLC режиме позиция начинается со 2-й ячейки (High)
      startCol += 2
    }
    
    events.push({
      row: currentRow,
      col: startCol,
      span: position.span ?? (isClosing ? (isLtf ? 2 : 3) : 2),
      label: 'Pos',
      fullLabel: position.label,
      type: 'position'
    })
  })

  // Бары занимают 1 строку по высоте + 1 строка для заголовков
  // В LTF режиме добавляем еще одну строку для заголовков LTF баров
  const totalRows = currentRow + (state.positions.length > 0 ? 1 : 0) + 2 + (isLtf ? 2 : 0) // +2 для строки заголовков (1) и баров (1), +2 для LTF баров (1 строка заголовков + 1 строка баров) если LTF режим

  // Функция для получения типа события в ячейке (для подсветки баров)
  const getEventTypeForBarCell = (col: number): GridEvent['type'] | null => {
    // Проверяем все события, которые могут быть в этой колонке
    const event = events.find(e => {
      return e.col <= col && col < e.col + e.span
    })
    
    // Для позиций: подсвечиваем только первую ячейку (где позиция начинается)
    if (event?.type === 'position' && event.col !== col) {
      return null
    }
    
    return event?.type || null
  }

  // Цвета для обводки и фона ячеек
  const getCellStyle = (eventType: GridEvent['type'] | null): { borderColor: string; backgroundColor: string } => {
    if (!eventType) {
      return { borderColor: '#e8e8e8', backgroundColor: 'transparent' } // Минимально видимая сетка для пустых ячеек
    }
    
    switch (eventType) {
      case 'execution': return { borderColor: '#ff3b1f', backgroundColor: 'rgba(255, 59, 31, 0.15)' }
      case 'funCall': return { borderColor: '#3d8eea', backgroundColor: 'rgba(61, 142, 234, 0.15)' }
      case 'fillAttempt': return { borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.15)' }
      case 'fill': return { borderColor: '#3aa655', backgroundColor: 'rgba(58, 166, 85, 0.15)' }
      case 'position': return { borderColor: '#63d26f', backgroundColor: 'rgba(99, 210, 111, 0.15)' }
      default: return { borderColor: '#e0e0e0', backgroundColor: 'rgba(250, 250, 250, 0.05)' }
    }
  }

  // Вычисляем размер ячейки так, чтобы вся сетка помещалась в 1000px
  // Ширина метки уменьшена до минимума, gap между колонками увеличен для лучшей видимости
  // Максимальная ширина ячейки = (1000 - labelWidth - gap) / totalColumns
  const labelWidth = 40 // Уменьшена ширина метки
  const gapSize = 5 // Базовый gap между ячейками (нечетное число)
  const barGapSize = 9 // Увеличенный gap там, где проходят разделители баров (линии) - нечетное число, чтобы линии делили пространство пополам
  const totalGaps = (totalColumns + 1) * gapSize
  const maxCellSize = Math.floor((1000 - labelWidth - totalGaps) / totalColumns)
  // В LTF режиме делаем клетки немного шире, чтобы текст "Exec" влез
  const minCellSize = isLtf ? 35 : 30
  const cellSize = `${Math.max(minCellSize, Math.min(50, maxCellSize))}px` // Не меньше minCellSize, не больше 50px

  return (
    <div 
      className="events-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `${labelWidth}px repeat(${totalColumns}, ${cellSize})`,
        gridTemplateRows: `repeat(${totalRows}, ${cellSize})`,
        gap: `${gapSize}px`,
        columnGap: `${gapSize}px`,
        rowGap: `${gapSize}px`,
        marginTop: '16px',
        maxWidth: '1000px',
        position: 'relative'
      }}
    >
      {/* Метка для Main баров (занимает 2 строки: заголовок + 1 строка баров) */}
      <div 
        className="events-grid-label"
        style={{ 
          gridRow: '1 / 3', 
          gridColumn: 1,
          padding: '4px 8px',
          fontSize: '11px',
          color: '#6a6a71',
          display: 'flex',
          alignItems: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontWeight: 500
        }}
      >
        Bars
      </div>

      {/* Заголовки баров - над барами */}
      {barGroups.map((group) => {
        const mainBar = state.mainBars[group.mainBarIndex]
        return (
          <div
            key={`bar-title-${group.mainBarIndex}`}
            style={{
              gridRow: 1,
              gridColumn: group.startCol + 2, // +2 потому что первая колонка - метка
              gridColumnEnd: group.endCol + 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              color: '#2a2a2f',
              fontSize: '12px'
            }}
          >
            {mainBar.label || (group.mainBarIndex === 0 || group.mainBarIndex === mainBarsCount - 1 ? '...' : 'Bar N')}
          </div>
        )
      })}

      {/* Main бары - рендерим каждую ячейку напрямую в основной сетке */}
      {barGroups.map((group) => {
        const mainBar = state.mainBars[group.mainBarIndex]
        const isFirstBar = group.mainBarIndex === 0
        const isLastBar = group.mainBarIndex === barGroups.length - 1

        // Пустой бар
        if (group.cells[0]?.isDots) {
          return (
            <div
              key={`bar-empty-${group.mainBarIndex}`}
              style={{
                gridRow: 2,
                gridColumn: group.startCol + 2,
                gridColumnEnd: group.endCol + 2,
                textAlign: 'center',
                fontSize: '13px',
                color: '#2a2a2f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                backgroundColor: '#f5f5f5',
                border: '1px solid #d0d0d0',
                borderRadius: '3px',
                padding: 0,
                boxSizing: 'border-box',
                alignSelf: 'stretch',
                width: '100%',
                minHeight: 0,
                lineHeight: '1',
                margin: 0
              }}
            >
              ...
            </div>
          )
        }

        // Полный бар
        if (isLtf) {
          // В LTF режиме: Main бар занимает все ячейки внутри бара, O/H/L/C группируют их
          const barWidth = group.endCol - group.startCol
          // Убеждаемся, что barWidth достаточно большой
          if (barWidth < 4) {
            // Если ширина меньше 4, рендерим как пустой бар
            return (
              <div
                key={`bar-empty-${group.mainBarIndex}`}
                style={{
                  gridRow: 2,
                  gridColumn: group.startCol + 2,
                  gridColumnEnd: group.endCol + 2,
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#2a2a2f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                backgroundColor: '#f5f5f5',
                border: '1px solid #d0d0d0',
                borderRadius: '3px',
                padding: 0,
                boxSizing: 'border-box',
                alignSelf: 'stretch',
                width: '100%',
                minHeight: 0,
                lineHeight: '1',
                margin: 0
              }}
            >
              ...
            </div>
          )
        }
          
          const cellsPerOhlc = Math.floor(barWidth / 4) // Сколько ячеек на каждую O/H/L/C
          const remainder = barWidth % 4 // Остаток для распределения
          
          // В LTF режиме рендерим каждую ячейку напрямую в основной grid
          return (
            <>
              {[0, 1, 2, 3].map((cellIndex) => {
                // Распределяем остаток между первыми ячейками
                const extraCell = cellIndex < remainder ? 1 : 0
                const cellSpan = cellsPerOhlc + extraCell
                const col = group.startCol + (cellIndex === 0 ? 0 : 
                  [0, 1, 2, 3].slice(0, cellIndex).reduce((sum, idx) => {
                    const extra = idx < remainder ? 1 : 0
                    return sum + cellsPerOhlc + extra
                  }, 0))
                
                const eventType = getEventTypeForBarCell(col)
                const cellStyle = getCellStyle(eventType)
                const cellLabels = ['Open', 'High', 'Low', 'Close']
                
                return (
                  <div
                    key={`bar-cell-${group.mainBarIndex}-${cellIndex}`}
                    className="cell"
                    style={{
                      gridRow: 2,
                      gridColumn: col + 2,
                      gridColumnEnd: col + cellSpan + 2,
                      border: `1px solid ${cellStyle.borderColor}`,
                      borderRadius: '3px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: cellStyle.backgroundColor,
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#2a2a2f',
                      boxSizing: 'border-box',
                      alignSelf: 'stretch',
                      width: '100%',
                      minHeight: 0,
                      lineHeight: '1',
                      margin: 0
                    }}
                  >
                    {cellLabels[cellIndex]}
                  </div>
                )
              })}
            </>
          )
        } else {
          // В OHLC режиме: рендерим каждую ячейку (O, H, L, C) напрямую в основной сетке
          return (
            <>
              {[0, 1, 2, 3].map((cellIndex) => {
                const col = group.startCol + cellIndex
                const eventType = getEventTypeForBarCell(col)
                const cellStyle = getCellStyle(eventType)
                const cellLabels = ['Open', 'High', 'Low', 'Close']
                
                return (
                  <div
                    key={`bar-cell-${group.mainBarIndex}-${cellIndex}`}
                    className="cell"
                    style={{
                      gridRow: 2,
                      gridColumn: col + 2,
                      border: `1px solid ${cellStyle.borderColor}`,
                      borderRadius: '3px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: cellStyle.backgroundColor,
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#2a2a2f',
                      boxSizing: 'border-box',
                      alignSelf: 'stretch',
                      width: '100%',
                      minHeight: 0,
                      lineHeight: '1',
                      margin: 0
                    }}
                  >
                    {cellLabels[cellIndex]}
                  </div>
                )
              })}
            </>
          )
        }
      })}

      {/* Строка LTF баров (только для LTF режима) - занимает 2 строки + 1 строка для заголовков */}
      {isLtf && (
        <>
          <div 
            className="events-grid-label"
            style={{ 
              gridRow: '3 / 5', 
              gridColumn: 1,
              padding: '4px 2px',
              fontSize: '10px',
              color: '#6a6a71',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500
            }}
          >
            LTF
          </div>

          {/* Заголовки LTF баров - над LTF барами */}
          {barGroups.map((group) => {
            const isMini = group.mainBarIndex === 0 || group.mainBarIndex === mainBarsCount - 1
            if (isMini) return null
            
            return group.cells.map((ltfCell, ltfIndex) => {
              const isFirstLtfInGroup = ltfIndex === 0
              const isLastLtfInGroup = ltfIndex === group.cells.length - 1
              const isFirstBar = group.mainBarIndex === 0
              const isLastBar = group.mainBarIndex === barGroups.length - 1
              
              const span = ltfCell.isDots ? 2 : 4
              
              return (
                <div
                  key={`ltf-title-${group.mainBarIndex}-${ltfIndex}`}
                  style={{
                    gridRow: 3,
                    gridColumn: ltfCell.col + 2,
                    gridColumnEnd: ltfCell.col + span + 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    color: '#2a2a2f',
                    fontSize: '10px',
                    alignSelf: 'stretch',
                    width: '100%',
                    boxSizing: 'border-box',
                    margin: 0
                  }}
                >
                  {ltfCell.label}
                </div>
              )
            })
          })}

          {/* LTF бары в сетке */}
          {barGroups.map((group) => {
            const isMini = group.mainBarIndex === 0 || group.mainBarIndex === mainBarsCount - 1
            const isFirstBar = group.mainBarIndex === 0
            const isLastBar = group.mainBarIndex === barGroups.length - 1
            
            if (isMini) {
              return (
                <div
                  key={`ltf-mini-${group.mainBarIndex}`}
                  style={{
                    gridRow: 4, // Занимает 1 строку, начинается с 4-й строки (после заголовков), без отступа снизу
                    gridColumn: group.startCol + 2,
                    gridColumnEnd: group.endCol + 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                    border: '1px solid #d0d0d0',
                    borderRadius: '3px',
                    fontSize: '12px',
                    color: '#2a2a2f',
                    fontWeight: 600,
                    padding: 0,
                    boxSizing: 'border-box',
                    alignSelf: 'stretch',
                    width: '100%',
                    minHeight: 0,
                    lineHeight: '1',
                    margin: 0
                  }}
                >
                  ...
                </div>
              )
            }

            // LTF бары для основных баров
            return group.cells.map((ltfCell, ltfIndex) => {
              const ltfBars = getLtfBarsForMainBar(group.mainBarIndex)
              const ltfBar = ltfBars[ltfIndex]
              const isFirstLtfInGroup = ltfIndex === 0
              const isLastLtfInGroup = ltfIndex === group.cells.length - 1
              const isFirstBar = group.mainBarIndex === 0
              const isLastBar = group.mainBarIndex === barGroups.length - 1
              
              if (ltfCell.isDots) {
                return (
                  <div
                    key={`ltf-dots-${group.mainBarIndex}-${ltfIndex}`}
                    style={{
                      gridRow: 4, // Занимает 1 строку, начинается с 4-й строки (после заголовков), без отступа снизу
                      gridColumn: ltfCell.col + 2,
                      gridColumnEnd: ltfCell.col + 4, // 2 ячейки для пустого бара
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f5f5f5',
                      border: '1px solid #d0d0d0',
                      borderRadius: '3px',
                      padding: 0,
                      boxSizing: 'border-box',
                      alignSelf: 'stretch',
                      width: '100%',
                      minHeight: 0,
                      lineHeight: '1',
                      margin: 0
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#2a2a2f', fontWeight: 600, lineHeight: '1' }}>...</div>
                  </div>
                )
              }

              // Полный LTF бар - 4 ячейки O, H, L, C, рендерим каждую напрямую в основной grid
              return (
                <>
                  {[0, 1, 2, 3].map((ohlcIndex) => {
                    const col = ltfCell.col + ohlcIndex
                    const eventType = getEventTypeForBarCell(col)
                    const cellStyle = getCellStyle(eventType)
                    
                    return (
                      <div
                        key={`ltf-cell-${group.mainBarIndex}-${ltfIndex}-${ohlcIndex}`}
                        className="ltf-cell"
                        style={{
                          gridRow: 4,
                          gridColumn: col + 2,
                          border: `1px solid ${cellStyle.borderColor}`,
                          borderRadius: '3px',
                          padding: 0,
                          backgroundColor: cellStyle.backgroundColor,
                          fontSize: '9px',
                          fontWeight: 600,
                          color: '#2a2a2f',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: 'stretch',
                          width: '100%',
                          minHeight: 0,
                          boxSizing: 'border-box',
                          lineHeight: '1',
                          margin: 0
                        }}
                      >
                        {['O', 'H', 'L', 'C'][ohlcIndex]}
                      </div>
                    )
                  })}
                </>
              )
            })
          })}
        </>
      )}

      {/* Метки строк для событий */}
      {Array.from({ length: totalRows - 2 - (isLtf ? 2 : 0) }, (_, row) => (
        <div 
          key={`label-${row + (isLtf ? 6 : 3)}`} 
          className="events-grid-label"
          style={{ 
            gridRow: row + (isLtf ? 5 : 3), 
            gridColumn: 1,
            padding: '4px 2px',
            fontSize: '10px',
            color: '#6a6a71',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 500
          }}
        >
          {row === 0 && visibleExecutions.length > 0 && 'Exec'}
          {row === (visibleExecutions.length > 0 ? 1 : 0) && state.funCalls.length > 0 && 'Fn'}
          {row === (visibleExecutions.length > 0 ? 1 : 0) + (state.funCalls.length > 0 ? 1 : 0) && state.fillAttempts.length > 0 && 'Fill Att'}
          {row === (visibleExecutions.length > 0 ? 1 : 0) + (state.funCalls.length > 0 ? 1 : 0) + (state.fillAttempts.length > 0 ? 1 : 0) && state.fills.length > 0 && 'Fill'}
          {row === totalRows - 3 - (isLtf ? 2 : 0) && state.positions.length > 0 && 'Pos'}
        </div>
      ))}

      {/* Позиции - рендерим отдельно как объединенные элементы */}
      {events.filter(e => e.type === 'position').map((positionEvent) => {
        const cellStyle = getCellStyle('position')
        // Проверяем, что позиция не выходит за пределы grid
        const maxCol = totalColumns - 1
        const actualCol = Math.min(positionEvent.col, maxCol)
        const actualSpan = Math.min(positionEvent.span, maxCol - actualCol + 1)
        const actualRow = positionEvent.row + (isLtf ? 5 : 3)
        // Проверяем, что строка не выходит за пределы grid
        const maxRow = totalRows - 1
        if (actualRow > maxRow || actualRow < 1) {
          return null
        }
        
        // Проверяем, что колонки не выходят за пределы grid
        if (actualCol + actualSpan > totalColumns) {
          return null
        }
        
        return (
          <div
            key={`position-${positionEvent.col}-${positionEvent.row}`}
            className="events-grid-cell"
            title={positionEvent.fullLabel}
            style={{
              gridRow: actualRow,
              gridColumn: actualCol + 2,
              gridColumnEnd: actualCol + actualSpan + 2,
              border: `1px solid ${cellStyle.borderColor}`,
              borderRadius: '3px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: cellStyle.backgroundColor,
              fontSize: '11px',
              fontWeight: 600,
              color: '#2a2a2f',
              boxSizing: 'border-box',
              alignSelf: 'stretch',
              width: '100%',
              minHeight: 0,
              lineHeight: '1',
              margin: 0,
              zIndex: 5, // Позиция должна быть поверх других элементов
              position: 'relative' // Для z-index
            }}
          >
            {positionEvent.label}
          </div>
        )
      })}

      {/* Ячейки событий (кроме позиций) */}
      {Array.from({ length: totalColumns }, (_, col) => {
        return Array.from({ length: totalRows - 2 - (isLtf ? 2 : 0) }, (_, row) => {
          // Проверяем, не занята ли эта ячейка позицией
          const positionEvent = events.find(e => {
            return e.type === 'position' && e.row === row && e.col <= col && col < e.col + e.span
          })
          // Если ячейка занята позицией, не рендерим её
          if (positionEvent) {
            return null
          }
          
          const event = events.find(e => {
            return e.type !== 'position' && e.row === row && e.col <= col && col < e.col + e.span
          })
          const isFirstCell = event && event.col === col
          
          // Определяем, находится ли эта колонка на границе между Main барами
          // Последняя колонка каждого Main бара (кроме последнего)
          const isLastColOfBar = barGroups.some((group, idx) => {
            return idx < barGroups.length - 1 && col === group.endCol - 1
          })
          // Первая колонка каждого Main бара (кроме первого)
          const isFirstColOfBar = barGroups.some((group, idx) => {
            return idx > 0 && col === group.startCol
          })
          
          // Определяем, находится ли эта колонка на границе между LTF барами
          let isLtfBarBoundaryLeft = false
          let isLtfBarBoundaryRight = false
          if (isLtf) {
            barGroups.forEach((group) => {
              const isMini = group.mainBarIndex === 0 || group.mainBarIndex === mainBarsCount - 1
              if (isMini) return
              
              group.cells.forEach((ltfCell, ltfIndex) => {
                const isLastLtfInGroup = ltfIndex === group.cells.length - 1
                const span = ltfCell.isDots ? 2 : 4
                
                // Граница после LTF бара (кроме последнего в группе) - это колонка после последней колонки LTF бара
                if (!isLastLtfInGroup && col === ltfCell.col + span) {
                  isLtfBarBoundaryRight = true
                }
                // Граница перед LTF баром (кроме первого в группе) - это колонка перед первой колонкой LTF бара
                if (ltfIndex > 0 && col === ltfCell.col) {
                  isLtfBarBoundaryLeft = true
                }
              })
            })
          }
          
          const cellStyle = getCellStyle(event?.type || null)
          
          return (
            <div
              key={`event-cell-${col}-${row}`}
              className="events-grid-cell"
              title={event && isFirstCell ? event.fullLabel : undefined}
              style={{
                gridRow: row + (isLtf ? 5 : 3),
                gridColumn: col + 2,
                border: `1px solid ${cellStyle.borderColor}`,
                borderRadius: '3px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: cellStyle.backgroundColor,
                fontSize: '11px',
                fontWeight: 600,
                color: '#2a2a2f',
                boxSizing: 'border-box',
                alignSelf: 'stretch',
                width: '100%',
                minHeight: 0,
                lineHeight: '1',
                margin: 0
              }}
            >
              {isFirstCell && event?.label}
            </div>
          )
        })
      })}

      {/* Вертикальные линии-разделители от баров основной серии - черные линии */}
      {/* Линия перед первым баром */}
      <div
        style={{
          gridRow: `1 / ${totalRows + 1}`,
          gridColumn: 2,
          width: '1px',
          background: '#000000',
          pointerEvents: 'none',
          zIndex: 10,
          marginLeft: `${-((barGapSize - gapSize) / 2) - 1}px`
        }}
      />
      {/* Линии между Main барами */}
      {barGroups.map((group) => {
        // Добавляем линии после каждого Main бара
        return (
          <div
            key={`divider-${group.mainBarIndex}`}
            style={{
              gridRow: `1 / ${totalRows + 1}`,
              gridColumn: group.endCol + 2,
              width: '1px',
              background: '#000000',
              pointerEvents: 'none',
              zIndex: 10,
              marginLeft: `${-((barGapSize - gapSize) / 2) - 1}px`
            }}
          />
        )
      })}

      {/* Вертикальные линии-разделители для LTF баров (от тайтлов до низа сетки) */}
      {isLtf && barGroups.map((group) => {
        const isMini = group.mainBarIndex === 0 || group.mainBarIndex === mainBarsCount - 1
        if (isMini) return null
        
        const dividers = []
        
        group.cells.forEach((ltfCell, ltfIndex) => {
          const isFirstLtfInGroup = ltfIndex === 0
          const isLastLtfInGroup = ltfIndex === group.cells.length - 1
          const span = ltfCell.isDots ? 2 : 4
          
          // Линия после каждого LTF бара (кроме последнего в группе)
          if (!isLastLtfInGroup) {
            dividers.push(
              <div
                key={`ltf-divider-right-${group.mainBarIndex}-${ltfIndex}`}
                style={{
                  gridRow: `3 / ${totalRows + 1}`,
                  gridColumn: ltfCell.col + span + 2,
                  width: '1px',
                  background: '#808080',
                  pointerEvents: 'none',
                  zIndex: 9,
                  marginLeft: `${-((barGapSize - gapSize) / 2) - 1}px`
                }}
              />
            )
          }
        })
        
        return dividers
      })}

    </div>
  )
}
