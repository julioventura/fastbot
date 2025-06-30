import {
  formatDateTime,
  formatDate,
  formatPhone,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  formatName,
  truncateText,
  generateId,
  isValidUUID,
  slugify,
  daysBetween
} from './format-utils'

describe('Format Utils Functions', () => {
  describe('formatDateTime', () => {
    it('deve formatar data válida corretamente', () => {
      const date = '2023-12-25T15:30:00.000Z'
      const result = formatDateTime(date)
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/)
    })

    it('deve retornar "-" para string nula', () => {
      expect(formatDateTime(null)).toBe('-')
    })

    it('deve retornar "-" para string vazia', () => {
      expect(formatDateTime('')).toBe('-')
    })

    it('deve retornar string original para data inválida', () => {
      const invalidDate = 'invalid-date'
      expect(formatDateTime(invalidDate)).toBe(invalidDate)
    })

    it('deve tratar diferentes formatos de data', () => {
      const isoDate = '2023-01-01T12:00:00.000Z'
      const result = formatDateTime(isoDate)
      expect(result).toMatch(/01\/01\/2023/)
    })
  })

  describe('formatDate', () => {
    it('deve formatar apenas a data', () => {
      const date = '2023-12-25T15:30:00.000Z'
      const result = formatDate(date)
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
      expect(result).not.toMatch(/\d{2}:\d{2}/)
    })

    it('deve retornar "-" para valores nulos', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate('')).toBe('-')
    })

    it('deve tratar datas inválidas', () => {
      expect(formatDate('invalid')).toBe('invalid')
    })
  })

  describe('formatPhone', () => {
    it('deve formatar celular (11 dígitos)', () => {
      expect(formatPhone('11999887766')).toBe('(11) 99988-7766')
    })

    it('deve formatar telefone fixo (10 dígitos)', () => {
      expect(formatPhone('1133334444')).toBe('(11) 3333-4444')
    })

    it('deve remover caracteres não numéricos', () => {
      expect(formatPhone('(11) 99988-7766')).toBe('(11) 99988-7766')
      expect(formatPhone('11.99988.7766')).toBe('(11) 99988-7766')
    })

    it('deve retornar string vazia para entrada vazia', () => {
      expect(formatPhone('')).toBe('')
    })

    it('deve retornar número original se não for 10 ou 11 dígitos', () => {
      expect(formatPhone('123')).toBe('123')
      expect(formatPhone('123456789012')).toBe('123456789012')
    })
  })

  describe('isValidEmail', () => {
    it('deve validar emails corretos', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.org')).toBe(true)
    })

    it('deve rejeitar emails inválidos', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('user@domain')).toBe(false)
    })

    it('deve tratar valores nulos', () => {
      expect(isValidEmail('')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('deve validar telefones com 10 dígitos', () => {
      expect(isValidPhone('1133334444')).toBe(true)
      expect(isValidPhone('(11) 3333-4444')).toBe(true)
    })

    it('deve validar celulares com 11 dígitos', () => {
      expect(isValidPhone('11999887766')).toBe(true)
      expect(isValidPhone('(11) 99988-7766')).toBe(true)
    })

    it('deve rejeitar números inválidos', () => {
      expect(isValidPhone('123')).toBe(false)
      expect(isValidPhone('123456789012')).toBe(false)
      expect(isValidPhone('')).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('deve validar senhas com 6+ caracteres', () => {
      expect(isValidPassword('123456')).toBe(true)
      expect(isValidPassword('minhasenha')).toBe(true)
      expect(isValidPassword('senha123!')).toBe(true)
    })

    it('deve rejeitar senhas muito curtas', () => {
      expect(isValidPassword('12345')).toBe(false)
      expect(isValidPassword('abc')).toBe(false)
      expect(isValidPassword('')).toBe(false)
    })

    it('deve tratar valores nulos', () => {
      expect(isValidPassword(null as any)).toBe(false)
      expect(isValidPassword(undefined as any)).toBe(false)
    })
  })

  describe('formatName', () => {
    it('deve capitalizar nomes corretamente', () => {
      expect(formatName('joão silva')).toBe('João Silva')
      expect(formatName('MARIA DA SILVA')).toBe('Maria Da Silva')
      expect(formatName('pedro')).toBe('Pedro')
    })

    it('deve tratar espaços extras', () => {
      expect(formatName('  joão   silva  ')).toBe('João Silva')
    })

    it('deve retornar string vazia para entrada vazia', () => {
      expect(formatName('')).toBe('')
      expect(formatName(null as any)).toBe('')
    })

    it('deve tratar caracteres especiais', () => {
      expect(formatName('josé-carlos')).toBe('José-Carlos')
      expect(formatName("d'angelo")).toBe("D'Angelo")
    })
  })

  describe('truncateText', () => {
    it('deve truncar texto longo', () => {
      const longText = 'Este é um texto muito longo que precisa ser truncado'
      expect(truncateText(longText, 20)).toBe('Este é um texto...')
    })

    it('deve manter texto curto inalterado', () => {
      expect(truncateText('Texto curto', 20)).toBe('Texto curto')
    })

    it('deve tratar limite exato', () => {
      expect(truncateText('Exatamente 10', 13)).toBe('Exatamente 10')
    })

    it('deve retornar string vazia para entrada vazia', () => {
      expect(truncateText('', 10)).toBe('')
      expect(truncateText(null as any, 10)).toBe('')
    })

    it('deve tratar espaços no final', () => {
      expect(truncateText('Texto com espaços   ', 10)).toBe('Texto...')
    })
  })

  describe('generateId', () => {
    it('deve gerar IDs únicos', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('deve gerar IDs de tamanho consistente', () => {
      const id = generateId()
      expect(id).toHaveLength(9)
    })

    it('deve gerar IDs alfanuméricos', () => {
      const id = generateId()
      expect(id).toMatch(/^[a-z0-9]+$/)
    })

    it('deve gerar múltiplos IDs únicos', () => {
      const ids = Array.from({ length: 100 }, () => generateId())
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(100)
    })
  })

  describe('isValidUUID', () => {
    it('deve validar UUIDs v4 corretos', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true)
      expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true)
    })

    it('deve rejeitar UUIDs inválidos', () => {
      expect(isValidUUID('')).toBe(false)
      expect(isValidUUID('invalid-uuid')).toBe(false)
      expect(isValidUUID('550e8400-e29b-41d4-a716')).toBe(false)
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false)
    })

    it('deve ser case-insensitive', () => {
      expect(isValidUUID('550E8400-E29B-41D4-A716-446655440000')).toBe(true)
    })

    it('deve tratar valores nulos', () => {
      expect(isValidUUID(null as any)).toBe(false)
      expect(isValidUUID(undefined as any)).toBe(false)
    })
  })

  describe('slugify', () => {
    it('deve converter texto para slug', () => {
      expect(slugify('Olá Mundo')).toBe('ola-mundo')
      expect(slugify('Título com Acentos')).toBe('titulo-com-acentos')
    })

    it('deve remover caracteres especiais', () => {
      expect(slugify('Texto com @#$% caracteres!')).toBe('texto-com-caracteres')
    })

    it('deve tratar espaços múltiplos', () => {
      expect(slugify('Texto   com    espaços')).toBe('texto-com-espacos')
    })

    it('deve remover hífens duplicados', () => {
      expect(slugify('Texto--com---hifens')).toBe('texto-com-hifens')
    })

    it('deve retornar string vazia para entrada vazia', () => {
      expect(slugify('')).toBe('')
      expect(slugify(null as any)).toBe('')
    })

    it('deve tratar acentos portugueses', () => {
      expect(slugify('São Paulo - Coração')).toBe('sao-paulo-coracao')
      expect(slugify('Açúcar e Álcool')).toBe('acucar-e-alcool')
    })
  })

  describe('daysBetween', () => {
    it('deve calcular diferença entre datas', () => {
      const date1 = '2023-01-01'
      const date2 = '2023-01-11'
      expect(daysBetween(date1, date2)).toBe(10)
    })

    it('deve tratar objetos Date', () => {
      const date1 = new Date('2023-01-01')
      const date2 = new Date('2023-01-06')
      expect(daysBetween(date1, date2)).toBe(5)
    })

    it('deve calcular diferença absoluta', () => {
      const date1 = '2023-01-10'
      const date2 = '2023-01-05'
      expect(daysBetween(date1, date2)).toBe(5)
    })

    it('deve retornar 0 para mesma data', () => {
      const date = '2023-01-01'
      expect(daysBetween(date, date)).toBe(0)
    })

    it('deve tratar anos diferentes', () => {
      const date1 = '2022-12-31'
      const date2 = '2023-01-01'
      expect(daysBetween(date1, date2)).toBe(1)
    })

    it('deve tratar meses diferentes', () => {
      const date1 = '2023-01-01'
      const date2 = '2023-02-01'
      expect(daysBetween(date1, date2)).toBe(31)
    })
  })
})
