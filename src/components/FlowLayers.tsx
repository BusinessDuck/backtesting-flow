import type { FunCall, FillAttempt, Fill, Position, HistoryMode } from '../types'

interface FlowLayersProps {
  funCalls: FunCall[]
  fillAttempts: FillAttempt[]
  fills: Fill[]
  positions: Position[]
  historyMode: HistoryMode
  mainBarsCount: number
  diagramType?: 'opening' | 'closing'
}

export function FlowLayers({
  funCalls,
  fillAttempts,
  fills,
  positions,
  historyMode,
  mainBarsCount,
  diagramType = 'opening'
}: FlowLayersProps) {
  const isLtf = historyMode === 'LTF Ticks (Bar magnifier)'
  const isClosing = diagramType === 'closing'

  // Группируем по барам
  const funCallsByBar = groupByBar(funCalls)
  const fillAttemptsByBar = groupByBar(fillAttempts)
  const fillsByBar = groupByBar(fills)
  const positionsByBar = groupByBar(positions)

  return (
    <>
      {/* Fun Calls Layer */}
      <div className="flow-grid">
        {Array.from({ length: mainBarsCount }, (_, barIndex) => {
          const barFunCalls = funCallsByBar.get(barIndex) || []
          return (
            <div key={barIndex} className="flow-slot">
              {barFunCalls.length > 0 && (
                <div className="flow-cells">
                  {barFunCalls.map(funCall => (
                    <div 
                      key={funCall.id} 
                      className={`tag tag--entry flow-entry ${isLtf ? 'flow-exit' : ''}`}
                    >
                      {funCall.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Fill Attempts Layer */}
      <div className="flow-grid">
        {Array.from({ length: mainBarsCount }, (_, barIndex) => {
          const barFillAttempts = fillAttemptsByBar.get(barIndex) || []
          return (
            <div key={barIndex} className="flow-slot">
              {barFillAttempts.length > 0 && (
                <div className="flow-cells">
                  {barFillAttempts.map(attempt => (
                    <div key={attempt.id} className="tag tag--fill flow-fill">
                      {attempt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Fills Layer */}
      <div className="flow-grid">
        {Array.from({ length: mainBarsCount }, (_, barIndex) => {
          const barFills = fillsByBar.get(barIndex) || []
          return (
            <div key={barIndex} className="flow-slot">
              {barFills.length > 0 && (
                <div className="flow-cells">
                  {barFills.map(fill => {
                    // Для LTF режима fills показываем в той же ячейке что и fun call
                    // Для OHLC режима fills показываем в следующей ячейке
                    if (isLtf) {
                      return (
                        <div 
                          key={fill.id} 
                          className="tag tag--fill flow-fill flow-fill--closing"
                        >
                          {fill.label}
                        </div>
                      )
                    }
                    return (
                      <div key={fill.id} className="tag tag--fill flow-fill">
                        {fill.label}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Position Layer */}
      <div className={`flow-position-row ${isClosing ? (isLtf ? 'flow-position-row--closing' : 'flow-position-row--closing-ohlc') : ''}`}>
        {Array.from({ length: mainBarsCount }, (_, barIndex) => {
          const barPositions = positionsByBar.get(barIndex) || []
          if (barPositions.length === 0) {
            return <div key={barIndex} />
          }
          return barPositions.map(position => (
            <div
              key={position.id}
              className={`flow-position ${isClosing ? (isLtf ? 'flow-position--closing' : 'flow-position--closing-ohlc') : ''}`}
            >
              {position.label}
            </div>
          ))
        })}
      </div>
    </>
  )
}

function groupByBar<T extends { barIndex: number }>(items: T[]): Map<number, T[]> {
  const map = new Map<number, T[]>()
  items.forEach(item => {
    if (!map.has(item.barIndex)) {
      map.set(item.barIndex, [])
    }
    map.get(item.barIndex)!.push(item)
  })
  return map
}
