import type { AppSettings } from '../types'

interface SettingsPanelProps {
  settings: AppSettings
  onSettingsChange: (settings: AppSettings) => void
}

export function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const updateSettings = (updates: Partial<AppSettings>) => {
    onSettingsChange({ ...settings, ...updates })
  }

  return (
    <aside className="panel">
      {/* Price data quality */}
      <section className="section">
        <div className="section__title">Price data quality</div>
        <div className="field">
          <div className="field__control">
            <select
              className="select"
              value={settings.priceDataQuality}
              onChange={(e) => {
                const newQuality = e.target.value as AppSettings['priceDataQuality']
                updateSettings({ priceDataQuality: newQuality })
              }}
            >
              <option>OHLC ticks</option>
              <option>Lower time frame ticks</option>
            </select>
          </div>
        </div>
      </section>

      {/* Script executions */}
      <section className="section">
        <div className="section__title">Script executions</div>
        
        <label className="check">
          <input
            className="check__input"
            type="checkbox"
            checked={settings.onBarClose}
            disabled // Всегда включен, нельзя снять
            onChange={() => {}} // Нельзя изменить
          />
          <span className="check__box" />
          <span className="check__label">On bar close</span>
        </label>

        <label className="check">
          <input
            className="check__input"
            type="checkbox"
            checked={settings.afterOrderIsFilled}
            onChange={(e) => updateSettings({ afterOrderIsFilled: e.target.checked })}
          />
          <span className="check__box" />
          <span className="check__label">After order is filled</span>
        </label>

        <label className="check">
          <input
            className="check__input"
            type="checkbox"
            checked={settings.onEachRealtimeBarUpdate}
            onChange={(e) => updateSettings({ onEachRealtimeBarUpdate: e.target.checked })}
          />
          <span className="check__box" />
          <span className="check__label">On each realtime bar update</span>
        </label>

        <label className="check">
          <input
            className="check__input"
            type="checkbox"
            checked={settings.onEachHistoryBarUpdate}
            onChange={(e) => updateSettings({ onEachHistoryBarUpdate: e.target.checked })}
          />
          <span className="check__box" />
          <span className="check__label">On each history bar update</span>
        </label>
      </section>

      {/* Broker emulator */}
      <section className="section">
        <div className="section__title">Broker emulator</div>

        <div className="field">
          <label className="field__label">Order type</label>
          <div className="field__control">
            <select
              className="select"
              value={settings.orderType}
              onChange={(e) => updateSettings({ orderType: e.target.value as 'Limit' | 'Market' })}
            >
              <option>Limit</option>
              <option>Market</option>
            </select>
          </div>
        </div>

        <label className="check">
          <input
            className="check__input"
            type="checkbox"
            checked={settings.verifyLiquidity}
            onChange={(e) => updateSettings({ verifyLiquidity: e.target.checked })}
          />
          <span className="check__box" />
          <span className="check__label">Verify liquidity</span>
        </label>

        <label className="check">
          <input
            className="check__input"
            type="checkbox"
            checked={settings.tryToExecuteOrderImmediately}
            onChange={(e) => updateSettings({ tryToExecuteOrderImmediately: e.target.checked })}
          />
          <span className="check__box" />
          <span className="check__label">Try to execute order immediately</span>
        </label>

        <label className="check">
          <input
            className="check__input"
            type="checkbox"
            checked={settings.useStandardOHLC}
            onChange={(e) => updateSettings({ useStandardOHLC: e.target.checked })}
          />
          <span className="check__box" />
          <span className="check__label">Use standard OHLC</span>
        </label>
      </section>
    </aside>
  )
}
