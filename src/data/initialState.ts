import type { DiagramState, AppSettings } from '../types'

// Начальные настройки
export const initialSettings: AppSettings = {
  priceDataQuality: 'OHLC ticks',
  executionSettings: {
    showOnMainClose: true,
    showOnLtfClose: true,
    showOnOpen: false,
    showOnHigh: false,
    showOnLow: false,
  },
  // Additional calculations
  onBarClose: true, // Всегда включен по умолчанию
  afterOrderIsFilled: false,
  onEachRealtimeBarUpdate: false,
  onEachHistoryBarUpdate: false,
  // Broker emulator
  orderType: 'Limit',
  verifyLiquidity: false,
  tryToExecuteOrderImmediately: false,
  useStandardOHLC: false,
}

// Начальное состояние для Order Opening
export const initialOpeningState: DiagramState = {
  mainBars: [
    { label: 'Bar N - 1', open: 0, high: 0, low: 0, close: 0 },
    { label: 'Bar N', open: 100, high: 110, low: 95, close: 105 },
    { label: 'Bar N + 1', open: 105, high: 115, low: 100, close: 110 },
    { label: 'Bar N + 2', open: 0, high: 0, low: 0, close: 0 },
  ],
  ltfBars: [
    { label: 'Bar L - 2', open: 0, high: 0, low: 0, close: 0 },
    { label: 'Bar L - 1', open: 0, high: 0, low: 0, close: 0 },
    { label: 'Bar L', open: 100, high: 102, low: 99, close: 101 },
    { label: 'Bar L + 1', open: 101, high: 103, low: 100, close: 102 },
    { label: 'Bar L + 2', open: 102, high: 104, low: 101, close: 103 },
    { label: 'Bar L + 3', open: 0, high: 0, low: 0, close: 0 },
    { label: 'Bar L + 4', open: 103, high: 105, low: 102, close: 104 },
    { label: 'Bar L + 5', open: 0, high: 0, low: 0, close: 0 },
  ],
  executions: [
    {
      id: 'exec-1',
      label: 'Code Exec',
      location: { type: 'main', price: 'close' },
      barIndex: 1,
    },
    {
      id: 'exec-2',
      label: 'Code Exec',
      location: { type: 'main', price: 'close' },
      barIndex: 2,
    },
    // LTF executions для демонстрации
    {
      id: 'exec-ltf-1',
      label: 'Code Exec',
      location: { type: 'ltf', barIndex: 2, price: 'close' },
      barIndex: 1,
    },
    {
      id: 'exec-ltf-2',
      label: 'Code Exec',
      location: { type: 'ltf', barIndex: 3, price: 'close' },
      barIndex: 1,
    },
    {
      id: 'exec-ltf-3',
      label: 'Code Exec',
      location: { type: 'ltf', barIndex: 0, price: 'close' },
      barIndex: 2,
    },
    {
      id: 'exec-ltf-4',
      label: 'Code Exec',
      location: { type: 'ltf', barIndex: 2, price: 'close' },
      barIndex: 2,
    },
  ],
  funCalls: [
    {
      id: 'fun-1',
      label: 'strategy.entry()',
      barIndex: 1,
    },
  ],
  fillAttempts: [],
  fills: [
    {
      id: 'fill-1',
      label: 'Filled with open price',
      barIndex: 2,
    },
  ],
  positions: [
    {
      id: 'pos-1',
      label: 'Position',
      barIndex: 2,
    },
  ],
}

// Начальное состояние для Order Closing
export const initialClosingState: DiagramState = {
  mainBars: [
    { label: 'Bar N - 1', open: 0, high: 0, low: 0, close: 0 },
    { label: 'Bar N', open: 100, high: 110, low: 95, close: 105 },
    { label: 'Bar N + 1', open: 105, high: 115, low: 100, close: 110 },
    { label: 'Bar N + 2', open: 0, high: 0, low: 0, close: 0 },
  ],
  ltfBars: [
    { label: 'Bar L - 2', open: 0, high: 0, low: 0, close: 0 },
    { label: 'Bar L - 1', open: 0, high: 0, low: 0, close: 0 },
    { label: 'Bar L', open: 100, high: 102, low: 99, close: 101 },
    { label: 'Bar L + 1', open: 101, high: 103, low: 100, close: 102 },
    { label: 'Bar L + 2', open: 102, high: 104, low: 101, close: 103 },
    { label: 'Bar L + 3', open: 0, high: 0, low: 0, close: 0 },
    { label: 'Bar L + 4', open: 103, high: 105, low: 102, close: 104 },
    { label: 'Bar L + 5', open: 0, high: 0, low: 0, close: 0 },
  ],
  executions: [
    {
      id: 'exec-close-1',
      label: 'Code Exec',
      location: { type: 'main', price: 'close' },
      barIndex: 1,
    },
    {
      id: 'exec-close-2',
      label: 'Code Exec',
      location: { type: 'main', price: 'close' },
      barIndex: 2,
    },
    // LTF executions для демонстрации
    {
      id: 'exec-close-ltf-1',
      label: 'Code Exec',
      location: { type: 'ltf', barIndex: 2, price: 'close' },
      barIndex: 1,
    },
    {
      id: 'exec-close-ltf-2',
      label: 'Code Exec',
      location: { type: 'ltf', barIndex: 3, price: 'close' },
      barIndex: 1,
    },
    {
      id: 'exec-close-ltf-3',
      label: 'Code Exec',
      location: { type: 'ltf', barIndex: 0, price: 'close' },
      barIndex: 2,
    },
    {
      id: 'exec-close-ltf-4',
      label: 'Code Exec',
      location: { type: 'ltf', barIndex: 2, price: 'close' },
      barIndex: 2,
    },
  ],
  funCalls: [
    {
      id: 'fun-close-1',
      label: 'strategy.exit()',
      barIndex: 1,
    },
  ],
  fillAttempts: [],
  fills: [
    {
      id: 'fill-close-1',
      label: 'Filled with open price',
      barIndex: 2,
    },
  ],
  positions: [
    {
      id: 'pos-close-1',
      label: 'Position',
      barIndex: 1,
    },
  ],
}
