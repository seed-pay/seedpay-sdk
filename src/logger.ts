export type Logger = {
  log: (...args: Parameters<typeof console.log>) => void
  error: (...args: Parameters<typeof console.error>) => void
  warn: (...args: Parameters<typeof console.warn>) => void
  table: (...args: Parameters<typeof console.table>) => void
  time: (label: string) => void
  timeEnd: (label: string) => void
}

const noop = () => {}

let current: Logger = {
  log: noop,
  error: noop,
  warn: noop,
  table: noop,
  time: noop,
  timeEnd: noop,
}

export const logger: Logger = {
  log: (...args) => current.log(...args),
  error: (...args) => current.error(...args),
  warn: (...args) => current.warn(...args),
  table: (...args) => current.table(...args),
  time: (label) => current.time(label),
  timeEnd: (label) => current.timeEnd(label),
}

export function setLogger(next: Partial<Logger>) {
  current = {
    log: next.log ?? noop,
    error: next.error ?? noop,
    warn: next.warn ?? noop,
    table: next.table ?? noop,
    time: next.time ?? noop,
    timeEnd: next.timeEnd ?? noop,
  }
}
