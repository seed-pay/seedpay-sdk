import { describe, expect, test } from 'bun:test'
import { logger, setLogger } from '../src/logger'

describe('Logger', () => {
  test('Uses provided logger methods', () => {
    const log = () => {}
    const error = () => {}
    const warn = () => {}
    const table = () => {}
    const time = (_label: string) => {}
    const timeEnd = (_label: string) => {}

    setLogger({ log, error, warn, table, time, timeEnd })

    expect(logger.log).toBeDefined()
    expect(logger.error).toBeDefined()
    expect(logger.warn).toBeDefined()
    expect(logger.table).toBeDefined()
    expect(logger.time).toBeDefined()
    expect(logger.timeEnd).toBeDefined()
  })

  test('Falls back to noop for missing methods', () => {
    setLogger({})

    logger.log('test')
    logger.error('test')
    logger.warn('test')
    logger.table([])
    logger.time('test')
    logger.timeEnd('test')
  })
})
