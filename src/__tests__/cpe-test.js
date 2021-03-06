const cpe = require('../cpe')

describe('cpe', () => {
  describe('parser', () => {
    beforeEach(function () {
      this.parser = cpe
    })

    it('parses the empty string', function () {
      expect(this.parser.parse('')).toEqual('')
    })

    it('parses letters', function () {
      expect(this.parser.parse('abc')).toEqual('abc')
    })

    it('parses numbers', function () {
      expect(this.parser.parse('123')).toEqual('123')
    })

    it('parses numbers mixed with letters', function () {
      expect(this.parser.parse('123px')).toEqual('123px')
    })

    it('parses embedded code', function () {
      expect(this.parser.parse('{{products[1].name}}')).toEqual({
        type: 'ref',
        name: 'products',
        rank: 1,
        field: 'name'
      })
    })

    it('parses code embedded into a literal', function () {
      expect(this.parser.parse('Cool {{products[1].category}}!')).toEqual([
        'Cool ',
        {
          type: 'ref',
          name: 'products',
          rank: 1,
          field: 'category'
        },
        '!'
      ])
    })

    it('parses integer arithmetic using traditional operator precedence', function () {
      expect(this.parser.parse('{{1 + products[2].quantity / 2}}-ball')).toEqual([
        {
          type: '+',
          left: 1,
          right: {
            type: '/',
            left: {
              type: 'ref',
              name: 'products',
              rank: 2,
              field: 'quantity'
            },
            right: 2
          }
        },
        '-ball'
      ])
    })

    it('parses "A multiple embedded data references', function () {
      expect(this.parser.parse('A {{products[3].name}} is in {{products[3].category}}')).toEqual([
        'A ',
        {
          type: 'ref',
          name: 'products',
          rank: 3,
          field: 'name'
        },
        ' is in ',
        {
          type: 'ref',
          name: 'products',
          rank: 3,
          field: 'category'
        }
      ])
    })

    it('parses "parses unclosed curly braces as literal text', function () {
      expect(this.parser.parse('I need a bracket: {')).toEqual(
        'I need a bracket: {'
      )
    })

    it('parses string literals in embedded code', function () {
      expect(this.parser.parse('I need a bracket: {{"{"}}')).toEqual([
        'I need a bracket: ',
        '{'
      ])
    })

    it('parses double quoted strings with escape characters', function () {
      expect(this.parser.parse('{{ "\\\\Say \\"hi\\"" }}')).toEqual(
        '\\Say "hi"'
      )
    })

    it('parses invalid code as literal text', function () {
      expect(this.parser.parse('A literal {{that is not valid code}}')).toEqual(
        'A literal {{that is not valid code}}'
      )
    })

    it('parses negative integers', function () {
      expect(this.parser.parse('A number {{-3}}')).toEqual([
        'A number ',
        (-3)
      ])
    })

    it('parses the integer zero', function () {
      expect(this.parser.parse('{{0}}')).toBe(0)
    })

    it('parses arithmetic with parentheses', function () {
      expect(this.parser.parse('{{(3 + 2) * 1}}')).toEqual({
        type: '*',
        left: {
          type: '+',
          left: 3,
          right: 2
        },
        right: 1
      })
    })
  })
})
