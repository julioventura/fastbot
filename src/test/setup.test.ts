import { describe, it, expect } from 'vitest'

describe('Setup de Testes', () => {
  it('deve estar funcionando corretamente', () => {
    expect(true).toBe(true)
  })

  it('deve conseguir fazer operações matemáticas básicas', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 4).toBe(12)
  })
})
