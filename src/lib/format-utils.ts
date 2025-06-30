/**
 * Utility functions for formatting and validation
 */

/**
 * Formata uma string de data para o padrão brasileiro "dd/MM/yyyy (HH:mm)"
 */
export function formatDateTime(dateString: string | null): string {
  if (!dateString) return "-"
  
  try {
    const date = new Date(dateString)
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) {
      return dateString
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dateString
  }
}

/**
 * Formata apenas a data no padrão brasileiro "dd/MM/yyyy"
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return dateString
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date)
  } catch (error) {
    console.error("Erro ao formatar data:", error)
    return dateString
  }
}

/**
 * Formata um número de telefone brasileiro
 */
export function formatPhone(phone: string): string {
  if (!phone) return ""
  
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Aplica formatação baseada no tamanho
  if (cleaned.length === 11) {
    // Celular: (11) 99999-9999
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length === 10) {
    // Fixo: (11) 9999-9999
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

/**
 * Valida se um email é válido
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida se um telefone brasileiro é válido
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

/**
 * Valida se uma senha atende aos critérios mínimos
 */
export function isValidPassword(password: string): boolean {
  if (!password) return false
  
  // Pelo menos 6 caracteres
  return password.length >= 6
}

/**
 * Formata um nome para capitalizar a primeira letra de cada palavra
 */
export function formatName(name: string): string {
  if (!name) return ""
  
  return name
    .trim() // Remove espaços do início e fim
    .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um único espaço
    .toLowerCase()
    .split(/(\s|-|')/) // Divide por espaços, hífens e apostrofes, mantendo os separadores
    .map(part => {
      if (part.length === 0 || /[\s-']/.test(part)) return part // Mantém separadores inalterados
      return part.charAt(0).toUpperCase() + part.slice(1)
    })
    .join('')
}

/**
 * Trunca um texto para um tamanho máximo
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  
  // Primeiro remove espaços em excesso
  const cleanText = text.trim()
  
  if (cleanText.length <= maxLength) return cleanText
  
  // Se não há espaço suficiente para "...", apenas trunca
  if (maxLength <= 3) return cleanText.slice(0, maxLength)
  
  // Primeiro trunca o texto deixando espaço para "..."
  const availableLength = maxLength - 3
  const truncated = cleanText.slice(0, availableLength)
  
  // Procura o último espaço para evitar cortar palavras no meio
  const lastSpace = truncated.lastIndexOf(' ')
  
  // Se encontrou um espaço e ele está numa posição razoável (não muito no início)
  // Usando threshold mais baixo para permitir mais palavras
  if (lastSpace > 0 && lastSpace >= Math.min(availableLength * 0.4, availableLength - 3)) {
    return truncated.slice(0, lastSpace) + "..."
  }
  
  return truncated + "..."
}

/**
 * Gera um ID único simples
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Verifica se uma string é um UUID válido
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid) return false
  
  // Aceita tanto UUIDs v1 quanto v4 (e outros formatos válidos)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Converte uma string para slug (URL-friendly)
 */
export function slugify(text: string): string {
  if (!text) return ""
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9 -]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .trim()
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
