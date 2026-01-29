// Типы для баров
export type BarPrice = 'open' | 'high' | 'low' | 'close'

export interface OHLCBar {
  open: number
  high: number
  low: number
  close: number
  label?: string
}

export interface LtfBar extends OHLCBar {
  label: string
}

// Типы для Executions
export type ExecutionLocation = 
  | { type: 'main'; price: 'close' }
  | { type: 'ltf'; barIndex: number; price: 'close' }
  | { type: 'main'; price: BarPrice }
  | { type: 'ltf'; barIndex: number; price: BarPrice }

export interface Execution {
  id: string
  label: string
  location: ExecutionLocation
  barIndex: number // Индекс бара в Main серии
  span?: number // Сколько ячеек вперед занимает (длительность)
}

// Типы для других слоев
export interface FunCall {
  id: string
  label: string
  barIndex: number
  cellIndex?: number // Для позиционирования в ячейке (0-3 для OHLC)
  span?: number // Сколько ячеек вперед занимает
}

export interface FillAttempt {
  id: string
  label: string
  barIndex: number
  cellIndex?: number
  span?: number // Сколько ячеек вперед занимает
}

export interface Fill {
  id: string
  label: string
  barIndex: number
  cellIndex?: number
  span?: number // Сколько ячеек вперед занимает
}

export interface Position {
  id: string
  label: string
  barIndex: number
  span?: number // Сколько ячеек вперед занимает
}

// Основной стейт для диаграммы
export interface DiagramState {
  mainBars: OHLCBar[]
  ltfBars?: LtfBar[] // Опционально, если есть LTF режим
  executions: Execution[]
  funCalls: FunCall[]
  fillAttempts: FillAttempt[]
  fills: Fill[]
  positions: Position[]
}

// Настройки конфигурации
export type PriceDataQuality = 'OHLC ticks' | 'Lower time frame ticks'
export type HistoryMode = 'OHLC' | 'LTF Ticks (Bar magnifier)' // Для обратной совместимости

export interface ExecutionSettings {
  showOnMainClose: boolean
  showOnLtfClose: boolean
  showOnOpen: boolean
  showOnHigh: boolean
  showOnLow: boolean
}

export interface AppSettings {
  priceDataQuality: PriceDataQuality // Price data quality
  historyMode?: HistoryMode // Для обратной совместимости, вычисляется из priceDataQuality
  executionSettings: ExecutionSettings
  // Additional calculations
  onBarClose: boolean // Всегда true, нельзя снять
  afterOrderIsFilled: boolean
  onEachRealtimeBarUpdate: boolean
  onEachHistoryBarUpdate: boolean
  // Broker emulator
  orderType: 'Limit' | 'Market'
  verifyLiquidity: boolean // Verify liquidity
  tryToExecuteOrderImmediately: boolean // Try to execute order immediately
  useStandardOHLC: boolean // Use standard OHLC
}
