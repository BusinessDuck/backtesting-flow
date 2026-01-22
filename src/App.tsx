import { useState } from 'react'
import './App.css'

function App() {
  const [historyMode, setHistoryMode] = useState('OHLC')
  const isMagnifier = historyMode === 'LTF Ticks (Bar magnifier)'

  return (
    <div className="page">
      <aside className="panel">
        <section className="section">
          <div className="section__title">Broker simulator</div>

          <div className="field">
            <label className="field__label">Order type</label>
            <div className="field__control">
              <select className="select">
                <option>Limit</option>
                <option>Market</option>
              </select>
              <span className="info">i</span>
            </div>
          </div>

          <label className="check">
            <input className="check__input" type="checkbox" />
            <span className="check__box" />
            <span className="check__label">Immediate on close</span>
            <span className="info">i</span>
          </label>

          <label className="check">
            <input className="check__input" type="checkbox" />
            <span className="check__box" />
            <span className="check__label">Verify price for limit orders</span>
            <span className="info">i</span>
          </label>
        </section>

        <section className="section">
          <div className="section__title">Executions</div>
          <label className="check">
            <input className="check__input" type="checkbox" />
            <span className="check__box" />
            <span className="check__label">After order is filled</span>
            <span className="info">i</span>
          </label>
          <label className="check">
            <input className="check__input" type="checkbox" />
            <span className="check__box" />
            <span className="check__label">On every tick</span>
            <span className="info">i</span>
          </label>
          <label className="check">
            <input className="check__input" type="checkbox" />
            <span className="check__box" />
            <span className="check__label">On bar close</span>
            <span className="info">i</span>
          </label>
        </section>

        <section className="section">
          <div className="section__title">History quality</div>
          <div className="field">
            <label className="field__label">Mode</label>
            <div className="field__control">
              <select
                className="select"
                value={historyMode}
                onChange={(event) => setHistoryMode(event.target.value)}
              >
                <option>OHLC</option>
                <option>LTF Ticks (Bar magnifier)</option>
              </select>
              <span className="info">i</span>
            </div>
          </div>
        </section>
      </aside>

      <main className="stage">
        <section className={`diagram ${isMagnifier ? 'diagram--ltf' : ''}`}>
          <div className="diagram__title">Order Opening (Execution)</div>
          <div className="timeline-grid">
            <div className="bar bar--mini">
              <div className="bar__title">Bar N - 1</div>
              {isMagnifier ? (
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

            <div className="bar">
              <div className="bar__title">Bar N</div>
              {isMagnifier && (
                <div className="bar__subtitle">Main chart bars timeline bar</div>
              )}
              <div className="bar__cells">
                <div className="cell">Open</div>
                <div className="cell">High</div>
                <div className="cell">Low</div>
                <div className={`cell ${isMagnifier ? '' : 'cell--highlight'}`}>
                  Close
                </div>
              </div>
              {isMagnifier && (
                <>
                  <div className="bar__subtitle">Lower time frame data timeline</div>
                  <div className="ltf__bars">
                    <div className="ltf-bar ltf-bar--dots">
                      <div className="ltf-bar__title">Bar L - 2</div>
                      <div className="ltf-bar__dot">...</div>
                    </div>
                    <div className="ltf-bar ltf-bar--dots">
                      <div className="ltf-bar__title">Bar L - 1</div>
                      <div className="ltf-bar__dot">...</div>
                    </div>
                    <div className="ltf-bar">
                      <div className="ltf-bar__title">Bar L</div>
                      <div className="ltf-cells">
                        <span className="ltf-cell">O</span>
                        <span className="ltf-cell">H</span>
                        <span className="ltf-cell">L</span>
                        <span className="ltf-cell ltf-cell--close">C</span>
                      </div>
                    </div>
                    <div className="ltf-bar">
                      <div className="ltf-bar__title">Bar L + 1</div>
                      <div className="ltf-cells">
                        <span className="ltf-cell ltf-cell--open">O</span>
                        <span className="ltf-cell">H</span>
                        <span className="ltf-cell">L</span>
                        <span className="ltf-cell ltf-cell--close">C</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bar">
              <div className="bar__title">Bar N + 1</div>
              {isMagnifier && (
                <div className="bar__subtitle">Main chart bars timeline bar</div>
              )}
              <div className="bar__cells">
                <div className="cell">Open</div>
                <div className="cell">High</div>
                <div className="cell">Low</div>
                <div className={`cell ${isMagnifier ? '' : 'cell--highlight'}`}>
                  Close
                </div>
              </div>
              {isMagnifier && (
                <>
                  <div className="bar__subtitle">Lower time frame data timeline</div>
                  <div className="ltf__bars">
                    <div className="ltf-bar">
                      <div className="ltf-bar__title">Bar L + 2</div>
                      <div className="ltf-cells">
                        <span className="ltf-cell ltf-cell--open">O</span>
                        <span className="ltf-cell">H</span>
                        <span className="ltf-cell">L</span>
                        <span className="ltf-cell ltf-cell--close">C</span>
                      </div>
                    </div>
                    <div className="ltf-bar ltf-bar--dots">
                      <div className="ltf-bar__title">Bar L + 3</div>
                      <div className="ltf-bar__dot">...</div>
                    </div>
                    <div className="ltf-bar">
                      <div className="ltf-bar__title">Bar L + 4</div>
                      <div className="ltf-cells">
                        <span className="ltf-cell">O</span>
                        <span className="ltf-cell">H</span>
                        <span className="ltf-cell">L</span>
                        <span className="ltf-cell ltf-cell--close">C</span>
                      </div>
                    </div>
                    <div className="ltf-bar ltf-bar--dots">
                      <div className="ltf-bar__title">Bar L + 5</div>
                      <div className="ltf-bar__dot">...</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bar bar--mini">
              <div className="bar__title">Bar N + 2</div>
              {isMagnifier ? (
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
          </div>

          {!isMagnifier ? (
            <div className="exec-grid">
            <div className="exec-label" />
            <div className="exec-row">
                <span className="tag tag--exec">Code Exec</span>
              </div>
              <div className="exec-row">
                <span className="tag tag--exec">Code Exec</span>
              </div>
              <div className="exec-spacer" />
            </div>
          ) : (
            <div className="exec-grid exec-grid--ltf">
            <div className="exec-label" />
            <div className="exec-row exec-row--ltf">
                <span />
                <span />
                <span className="tag tag--exec">Code Exec</span>
                <span className="tag tag--exec">Code Exec</span>
              </div>
              <div className="exec-row exec-row--ltf">
                <span className="tag tag--exec">Code Exec</span>
                <span />
                <span className="tag tag--exec">Code Exec</span>
                <span />
              </div>
              <div className="exec-spacer" />
            </div>
          )}

          <div className="flow-grid">
            <div className="flow-slot" />
            <div className="flow-slot">
              <div className="flow-cells">
                <div className="tag tag--entry flow-entry">
                  strategy.entry()
                </div>
              </div>
            </div>
            <div className="flow-slot">
              <div className="flow-cells">
                <div className="tag tag--fill flow-fill">
                  Filled with open price
                </div>
              </div>
            </div>
            <div className="flow-slot" />
          </div>

          <div className="flow-position-row">
            <div className="flow-position">Position</div>
          </div>
        </section>

        <section className={`diagram ${isMagnifier ? 'diagram--ltf' : ''}`}>
          <div className="diagram__title">Order Closing (Execution)</div>
          <div className="timeline-grid">
            <div className="bar bar--mini">
              <div className="bar__title">Bar N - 1</div>
              {isMagnifier ? (
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

            <div className="bar">
              <div className="bar__title">Bar N</div>
              {isMagnifier && (
                <div className="bar__subtitle">Main chart bars timeline bar</div>
              )}
              <div className="bar__cells">
                <div className="cell">Open</div>
                <div className="cell">High</div>
                <div className="cell">Low</div>
                <div className={`cell ${isMagnifier ? '' : 'cell--highlight'}`}>
                  Close
                </div>
              </div>
              {isMagnifier && (
                <>
                  <div className="bar__subtitle">Lower time frame data timeline</div>
                  <div className="ltf__bars">
                    <div className="ltf-bar ltf-bar--dots">
                      <div className="ltf-bar__title">Bar L - 2</div>
                      <div className="ltf-bar__dot">...</div>
                    </div>
                    <div className="ltf-bar ltf-bar--dots">
                      <div className="ltf-bar__title">Bar L - 1</div>
                      <div className="ltf-bar__dot">...</div>
                    </div>
                    <div className="ltf-bar">
                      <div className="ltf-bar__title">Bar L</div>
                      <div className="ltf-cells">
                        <span className="ltf-cell">O</span>
                        <span className="ltf-cell">H</span>
                        <span className="ltf-cell">L</span>
                        <span className="ltf-cell ltf-cell--close">C</span>
                      </div>
                    </div>
                    <div className="ltf-bar">
                      <div className="ltf-bar__title">Bar L + 1</div>
                      <div className="ltf-cells">
                        <span className="ltf-cell">O</span>
                        <span className="ltf-cell">H</span>
                        <span className="ltf-cell">L</span>
                        <span className="ltf-cell ltf-cell--close">C</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bar">
              <div className="bar__title">Bar N + 1</div>
              {isMagnifier && (
                <div className="bar__subtitle">Main chart bars timeline bar</div>
              )}
              <div className="bar__cells">
                <div className="cell">Open</div>
                <div className="cell">High</div>
                <div className="cell">Low</div>
                <div className={`cell ${isMagnifier ? '' : 'cell--highlight'}`}>
                  Close
                </div>
              </div>
              {isMagnifier && (
                <>
                  <div className="bar__subtitle">Lower time frame data timeline</div>
                  <div className="ltf__bars">
                    <div className="ltf-bar">
                      <div className="ltf-bar__title">Bar L + 2</div>
                      <div className="ltf-cells">
                        <span className="ltf-cell ltf-cell--open">O</span>
                        <span className="ltf-cell">H</span>
                        <span className="ltf-cell">L</span>
                        <span className="ltf-cell ltf-cell--close">C</span>
                      </div>
                    </div>
                    <div className="ltf-bar ltf-bar--dots">
                      <div className="ltf-bar__title">Bar L + 3</div>
                      <div className="ltf-bar__dot">...</div>
                    </div>
                    <div className="ltf-bar">
                      <div className="ltf-bar__title">Bar L + 4</div>
                      <div className="ltf-cells">
                        <span className="ltf-cell">O</span>
                        <span className="ltf-cell">H</span>
                        <span className="ltf-cell">L</span>
                        <span className="ltf-cell ltf-cell--close">C</span>
                      </div>
                    </div>
                    <div className="ltf-bar ltf-bar--dots">
                      <div className="ltf-bar__title">Bar L + 5</div>
                      <div className="ltf-bar__dot">...</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bar bar--mini">
              <div className="bar__title">Bar N + 2</div>
              {isMagnifier ? (
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
          </div>

          {!isMagnifier ? (
            <div className="exec-grid">
              <div className="exec-label" />
              <div className="exec-row">
                <span className="tag tag--exec">Code Exec</span>
              </div>
              <div className="exec-row">
                <span className="tag tag--exec">Code Exec</span>
              </div>
              <div className="exec-spacer" />
            </div>
          ) : (
            <div className="exec-grid exec-grid--ltf">
              <div className="exec-label" />
              <div className="exec-row exec-row--ltf">
                <span />
                <span />
                <span className="tag tag--exec">Code Exec</span>
                <span className="tag tag--exec">Code Exec</span>
              </div>
              <div className="exec-row exec-row--ltf">
                <span className="tag tag--exec">Code Exec</span>
                <span />
                <span className="tag tag--exec">Code Exec</span>
                <span />
              </div>
              <div className="exec-spacer" />
            </div>
          )}

          <div className="flow-grid">
            <div className="flow-slot" />
            <div className="flow-slot">
              <div className="flow-cells">
                <div
                  className={`tag tag--entry flow-entry ${
                    isMagnifier ? 'flow-exit' : ''
                  }`}
                >
                  strategy.exit()
                </div>
                <div
                  className={`tag tag--fill flow-fill ${
                    isMagnifier ? 'flow-fill--closing' : ''
                  }`}
                >
                  Filled with open price
                </div>
              </div>
            </div>
            <div className="flow-slot" />
            <div className="flow-slot" />
          </div>

          <div className="flow-position-row flow-position-row--closing">
            <div className="flow-position flow-position--closing">Position</div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
