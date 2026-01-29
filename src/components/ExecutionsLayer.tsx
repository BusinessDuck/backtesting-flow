import type { Execution, ExecutionSettings, HistoryMode } from '../types'

interface ExecutionsLayerProps {
  executions: Execution[]
  settings: ExecutionSettings
  historyMode: HistoryMode
  mainBarsCount: number
  ltfBarsPerMainBar?: number
}

export function ExecutionsLayer({
  executions,
  settings,
  historyMode,
  mainBarsCount,
  ltfBarsPerMainBar = 4
}: ExecutionsLayerProps) {
  const isLtf = historyMode === 'LTF Ticks (Bar magnifier)'
  
  // Фильтруем executions по настройкам
  const visibleExecutions = executions.filter(exec => {
    if (exec.location.type === 'main') {
      if (exec.location.price === 'close') {
        return settings.showOnMainClose
      }
      if (exec.location.price === 'open') return settings.showOnOpen
      if (exec.location.price === 'high') return settings.showOnHigh
      if (exec.location.price === 'low') return settings.showOnLow
    } else if (exec.location.type === 'ltf') {
      if (exec.location.price === 'close') {
        return settings.showOnLtfClose
      }
      if (exec.location.price === 'open') return settings.showOnOpen
      if (exec.location.price === 'high') return settings.showOnHigh
      if (exec.location.price === 'low') return settings.showOnLow
    }
    return false
  })

  // Группируем executions по барам
  const executionsByBar = new Map<number, Execution[]>()
  visibleExecutions.forEach(exec => {
    const barIndex = exec.barIndex
    if (!executionsByBar.has(barIndex)) {
      executionsByBar.set(barIndex, [])
    }
    executionsByBar.get(barIndex)!.push(exec)
  })

  if (isLtf) {
    // Для LTF режима группируем executions по Main барам и LTF индексам
    const executionsByBarAndLtf = new Map<string, Execution[]>()
    visibleExecutions.forEach(exec => {
      if (exec.location.type === 'ltf' && 'barIndex' in exec.location) {
        const key = `${exec.barIndex}-${exec.location.barIndex}`
        if (!executionsByBarAndLtf.has(key)) {
          executionsByBarAndLtf.set(key, [])
        }
        executionsByBarAndLtf.get(key)!.push(exec)
      } else if (exec.location.type === 'main') {
        // Main executions тоже показываем в LTF режиме
        const key = `${exec.barIndex}-main`
        if (!executionsByBarAndLtf.has(key)) {
          executionsByBarAndLtf.set(key, [])
        }
        executionsByBarAndLtf.get(key)!.push(exec)
      }
    })

    return (
      <div className="exec-grid exec-grid--ltf">
        <div className="exec-label" />
        {Array.from({ length: mainBarsCount }, (_, barIndex) => {
          const cells = Array.from({ length: ltfBarsPerMainBar }, (_, ltfIndex) => {
            // Проверяем LTF executions
            const ltfKey = `${barIndex}-${ltfIndex}`
            const ltfExecutions = executionsByBarAndLtf.get(ltfKey) || []
            
            // Если нет LTF executions, проверяем main executions для этого бара
            const mainKey = `${barIndex}-main`
            const mainExecutions = ltfExecutions.length === 0 
              ? executionsByBarAndLtf.get(mainKey) || []
              : []
            
            const execs = ltfExecutions.length > 0 ? ltfExecutions : mainExecutions
            
            return (
              <span key={ltfIndex}>
                {execs.length > 0 ? (
                  <span className="tag tag--exec">{execs[0].label}</span>
                ) : (
                  <span />
                )}
              </span>
            )
          })
          
          return (
            <div key={barIndex} className="exec-row exec-row--ltf">
              {cells}
            </div>
          )
        })}
        <div className="exec-spacer" />
      </div>
    )
  }

  return (
    <div className="exec-grid">
      <div className="exec-label" />
      {Array.from({ length: mainBarsCount }, (_, barIndex) => {
        const barExecutions = executionsByBar.get(barIndex) || []
        const mainCloseExecutions = barExecutions.filter(
          exec => exec.location.type === 'main' && exec.location.price === 'close'
        )
        
        return (
          <div key={barIndex} className="exec-row">
            {mainCloseExecutions.map(exec => (
              <span key={exec.id} className="tag tag--exec">
                {exec.label}
              </span>
            ))}
          </div>
        )
      })}
      <div className="exec-spacer" />
    </div>
  )
}
