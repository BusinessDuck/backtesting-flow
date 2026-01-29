import type { OHLCBar, LtfBar } from '../types'

interface BarProps {
  bar: OHLCBar
  isMini?: boolean
  showLtf?: boolean
  ltfBars?: LtfBar[]
  highlightClose?: boolean
  highlightOpen?: boolean
}

export function Bar({ 
  bar, 
  isMini = false, 
  showLtf = false, 
  ltfBars = [],
  highlightClose = false,
  highlightOpen = false
}: BarProps) {
  if (isMini) {
    return (
      <div className="bar bar--mini">
        <div className="bar__title">{bar.label || '...'}</div>
        {showLtf ? (
          <>
            <div className="bar__subtitle">Main</div>
            <div className="bar__cells bar__cells--mini">
              <div className="cell cell--dot">...</div>
            </div>
            <div className="bar__subtitle">Ltf</div>
            <div className="ltf__bars ltf__bars--mini">
              <div className="ltf-bar ltf-bar--dots">
                <div className="ltf-bar__dot">...</div>
              </div>
            </div>
          </>
        ) : (
          <div className="bar__dot">...</div>
        )}
      </div>
    )
  }

  return (
    <div className="bar">
      <div className="bar__title">{bar.label || 'Bar N'}</div>
      {showLtf && (
        <div className="bar__subtitle">Main chart bars timeline bar</div>
      )}
      <div className="bar__cells">
        <div className={`cell ${highlightOpen ? 'cell--open' : ''}`}>
          Open
        </div>
        <div className="cell">High</div>
        <div className="cell">Low</div>
        <div className={`cell ${highlightClose ? 'cell--highlight' : ''}`}>
          Close
        </div>
      </div>
      {showLtf && ltfBars.length > 0 && (
        <>
          <div className="bar__subtitle">Lower time frame data timeline</div>
          <div className="ltf__bars">
            {ltfBars.map((ltfBar, index) => (
              <LtfBarComponent key={index} bar={ltfBar} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function LtfBarComponent({ bar }: { bar: LtfBar }) {
  const isDots = !bar.open && !bar.high && !bar.low && !bar.close

  if (isDots) {
    return (
      <div className="ltf-bar ltf-bar--dots">
        <div className="ltf-bar__title">{bar.label}</div>
        <div className="ltf-bar__dot">...</div>
      </div>
    )
  }

  // Определяем, нужно ли выделять open (обычно для первого бара в Main баре)
  const highlightOpen = bar.label?.includes('L + 1') || bar.label?.includes('L + 2')

  return (
    <div className="ltf-bar">
      <div className="ltf-bar__title">{bar.label}</div>
      <div className="ltf-cells">
        <span className={`ltf-cell ${highlightOpen ? 'ltf-cell--open' : ''}`}>O</span>
        <span className="ltf-cell">H</span>
        <span className="ltf-cell">L</span>
        <span className="ltf-cell ltf-cell--close">C</span>
      </div>
    </div>
  )
}
