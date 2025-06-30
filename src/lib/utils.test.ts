import { cn } from './utils'

describe('Utils Functions', () => {
  describe('cn function', () => {
    describe('basic functionality', () => {
      it('deve combinar classes simples', () => {
        const result = cn('class1', 'class2')
        expect(result).toBe('class1 class2')
      })

      it('deve tratar strings vazias', () => {
        const result = cn('', 'class1', '')
        expect(result).toBe('class1')
      })

      it('deve tratar valores undefined e null', () => {
        const result = cn('class1', undefined, null, 'class2')
        expect(result).toBe('class1 class2')
      })

      it('deve trabalhar com uma única classe', () => {
        const result = cn('single-class')
        expect(result).toBe('single-class')
      })

      it('deve retornar string vazia quando não há classes', () => {
        const result = cn()
        expect(result).toBe('')
      })
    })

    describe('conditional classes', () => {
      it('deve aplicar classes condicionalmente com boolean', () => {
        const isActive = true
        const isDisabled = false
        const result = cn(
          'base-class',
          isActive && 'active',
          isDisabled && 'disabled'
        )
        expect(result).toBe('base-class active')
      })

      it('deve trabalhar com objetos de classe', () => {
        const result = cn({
          'class-1': true,
          'class-2': false,
          'class-3': true
        })
        expect(result).toBe('class-1 class-3')
      })

      it('deve combinar strings e objetos', () => {
        const result = cn(
          'base',
          {
            'conditional-1': true,
            'conditional-2': false
          },
          'additional'
        )
        expect(result).toBe('base conditional-1 additional')
      })
    })

    describe('tailwind merge functionality', () => {
      it('deve mesclar classes conflitantes do Tailwind', () => {
        const result = cn('p-4', 'p-6')
        expect(result).toBe('p-6')
      })

      it('deve mesclar classes de background', () => {
        const result = cn('bg-red-500', 'bg-blue-500')
        expect(result).toBe('bg-blue-500')
      })

      it('deve mesclar classes de margin', () => {
        const result = cn('m-2', 'm-4', 'mx-6')
        expect(result).toBe('m-4 mx-6')
      })

      it('deve preservar classes não conflitantes', () => {
        const result = cn('p-4', 'text-red-500', 'font-bold')
        expect(result).toBe('p-4 text-red-500 font-bold')
      })

      it('deve mesclar classes de flex', () => {
        const result = cn('flex', 'flex-col', 'flex-row')
        expect(result).toBe('flex flex-row')
      })
    })

    describe('arrays and nested values', () => {
      it('deve trabalhar com arrays de classes', () => {
        const result = cn(['class1', 'class2'], 'class3')
        expect(result).toBe('class1 class2 class3')
      })

      it('deve tratar arrays aninhados', () => {
        const result = cn(['class1', ['class2', 'class3']], 'class4')
        expect(result).toBe('class1 class2 class3 class4')
      })

      it('deve trabalhar com valores mistos', () => {
        const result = cn(
          'base',
          ['array-class'],
          { 'object-class': true },
          'string-class'
        )
        expect(result).toBe('base array-class object-class string-class')
      })
    })

    describe('edge cases', () => {
      it('deve tratar números como strings', () => {
        const result = cn('class', 1, 'other')
        expect(result).toBe('class 1 other')
      })

      it('deve tratar boolean false corretamente', () => {
        const result = cn('class', false, 'other')
        expect(result).toBe('class other')
      })

      it('deve tratar espaços extras', () => {
        const result = cn('  class1  ', '  class2  ')
        expect(result).toBe('class1 class2')
      })

      it('deve trabalhar com classes muito longas', () => {
        const longClass = 'very-long-class-name-that-is-quite-extensive'
        const result = cn('short', longClass, 'another')
        expect(result).toBe(`short ${longClass} another`)
      })
    })

    describe('real-world scenarios', () => {
      it('deve trabalhar com cenário de botão', () => {
        const isDisabled = false
        const size = 'lg'
        const variant = 'primary'
        
        const result = cn(
          'btn',
          `btn-${variant}`,
          `btn-${size}`,
          isDisabled && 'btn-disabled'
        )
        
        expect(result).toBe('btn btn-primary btn-lg')
      })

      it('deve trabalhar com cenário de card', () => {
        const hasError = true
        const isLoading = false
        
        const result = cn(
          'card',
          'p-4',
          'rounded-md',
          hasError && 'border-red-500',
          isLoading && 'opacity-50'
        )
        
        expect(result).toBe('card p-4 rounded-md border-red-500')
      })

      it('deve trabalhar com classes responsivas', () => {
        const result = cn(
          'text-sm',
          'md:text-base',
          'lg:text-lg',
          'p-2',
          'md:p-4',
          'lg:p-6'
        )
        
        expect(result).toBe('text-sm md:text-base lg:text-lg p-2 md:p-4 lg:p-6')
      })

      it('deve trabalhar com estados hover e focus', () => {
        const result = cn(
          'bg-blue-500',
          'hover:bg-blue-600',
          'focus:bg-blue-700',
          'transition-colors'
        )
        
        expect(result).toBe('bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 transition-colors')
      })
    })

    describe('performance', () => {
      it('deve trabalhar com muitas classes', () => {
        const classes = Array.from({ length: 100 }, (_, i) => `class-${i}`)
        const result = cn(...classes)
        expect(result).toContain('class-0')
        expect(result).toContain('class-99')
        expect(result.split(' ')).toHaveLength(100)
      })

      it('deve ser consistente com múltiplas chamadas', () => {
        const input = ['class1', 'class2', { 'class3': true }]
        const result1 = cn(...input)
        const result2 = cn(...input)
        expect(result1).toBe(result2)
      })
    })
  })
})
