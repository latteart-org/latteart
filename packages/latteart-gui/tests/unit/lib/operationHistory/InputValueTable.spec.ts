import InputValueTable, { type ScreenTransition } from '@/lib/operationHistory/InputValueTable'

describe('InputValueTable', () => {
  describe('#rows', () => {
    describe('指定の画面遷移群を元に入力値テーブルの行情報を構築する', () => {
      const screenTransitionBase = {
        sourceScreen: { id: '', name: '' },
        destScreen: { id: '', name: '' },
        trigger: {
          sequence: 0,
          type: '',
          target: { xpath: '', text: '' },
          input: '',
          pageUrl: '',
          pageTitle: ''
        },
        notes: [],
        testPurposes: []
      }

      const inputElementBase = {
        tagname: '',
        text: '',
        xpath: '',
        boundingRect: { top: 0, left: 0, width: 0, height: 0 },
        innerHeight: 0,
        innerWidth: 0,
        outerHeight: 0,
        outerWidth: 0
      }

      it('画面遷移していない場合', () => {
        const screenTransitions: ScreenTransition[] = [
          {
            ...screenTransitionBase,
            inputElements: [
              {
                ...inputElementBase,
                id: 'element1',
                attributes: { id: 'id1', name: 'name1', type: 'type1' },
                defaultValue: 'defaultValue',
                inputs: []
              },
              {
                ...inputElementBase,
                id: 'element2',
                attributes: { id: 'id2', name: 'name2', type: 'type2' },
                defaultValue: '',
                inputs: [
                  {
                    value: 'inputValue',
                    image: { imageFileUrl: 'element2Image' }
                  }
                ]
              }
            ]
          }
        ]

        const rows = new InputValueTable(screenTransitions).rows

        expect(rows).toEqual([
          {
            elementId: 'id1',
            elementName: 'name1',
            elementType: 'type1',
            inputs: [{ value: 'defaultValue', isDefaultValue: true }]
          },
          {
            elementId: 'id2',
            elementName: 'name2',
            elementType: 'type2',
            elementImage: {
              image: { imageFileUrl: 'element2Image' },
              elementInfo: {
                boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                innerHeight: 0,
                innerWidth: 0,
                outerHeight: 0,
                outerWidth: 0
              }
            },
            inputs: [{ value: '', isDefaultValue: false }]
          }
        ])
      })

      describe('画面遷移している場合', () => {
        it('全ての画面遷移の入力要素数が同じ場合', () => {
          const screenTransitions: ScreenTransition[] = [
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  id: 'element1',
                  attributes: { id: 'id1', name: 'name1', type: 'type1' },
                  defaultValue: 'defaultValue',
                  inputs: []
                },
                {
                  ...inputElementBase,
                  id: 'element2',
                  attributes: { id: 'id2', name: 'name2', type: 'type2' },
                  defaultValue: '',
                  inputs: [
                    {
                      value: 'inputValue',
                      image: { imageFileUrl: 'element2Image' }
                    }
                  ]
                }
              ]
            },
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  id: 'element1',
                  attributes: { id: 'id1', name: 'name1', type: 'type1' },
                  defaultValue: 'defaultValue',
                  inputs: []
                },
                {
                  ...inputElementBase,
                  id: 'element2',
                  attributes: { id: 'id2', name: 'name2', type: 'type2' },
                  defaultValue: '',
                  inputs: [
                    {
                      value: '',
                      image: { imageFileUrl: 'element2Image' }
                    }
                  ]
                }
              ]
            },
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  id: 'element1',
                  attributes: { id: 'id1', name: 'name1', type: 'type1' },
                  defaultValue: 'defaultValue',
                  inputs: []
                },
                {
                  ...inputElementBase,
                  id: 'element2',
                  attributes: { id: 'id2', name: 'name2', type: 'type2' },
                  defaultValue: '',
                  inputs: [
                    {
                      value: '',
                      image: { imageFileUrl: 'element2Image' }
                    }
                  ]
                }
              ]
            }
          ]

          const rows = new InputValueTable(screenTransitions).rows

          expect(rows).toEqual([
            {
              elementId: 'id1',
              elementName: 'name1',
              elementType: 'type1',
              inputs: [
                { value: 'defaultValue', isDefaultValue: true },
                { value: 'defaultValue', isDefaultValue: true },
                { value: 'defaultValue', isDefaultValue: true }
              ]
            },
            {
              elementId: 'id2',
              elementName: 'name2',
              elementType: 'type2',
              elementImage: {
                image: { imageFileUrl: 'element2Image' },
                elementInfo: {
                  boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                  innerHeight: 0,
                  innerWidth: 0,
                  outerHeight: 0,
                  outerWidth: 0
                }
              },
              inputs: [
                {
                  value: '',
                  isDefaultValue: false
                },
                {
                  value: '',
                  isDefaultValue: false
                },
                {
                  value: '',
                  isDefaultValue: false
                }
              ]
            }
          ])
        })

        it('各画面遷移で入力要素数が異なる場合、入力が無いセルは空文字のデフォルト値とみなす', () => {
          const screenTransitions: ScreenTransition[] = [
            {
              ...screenTransitionBase,
              inputElements: []
            },
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  id: 'element1',
                  attributes: { id: 'id1', name: 'name1', type: 'type1' },
                  defaultValue: 'defaultValue',
                  inputs: []
                }
              ]
            },
            {
              ...screenTransitionBase,
              inputElements: [
                {
                  ...inputElementBase,
                  id: 'element2',
                  attributes: { id: 'id2', name: 'name2', type: 'type2' },
                  defaultValue: '',
                  inputs: [
                    {
                      value: 'inputValue',
                      image: { imageFileUrl: 'element2Image' }
                    }
                  ]
                }
              ]
            }
          ]

          const rows = new InputValueTable(screenTransitions).rows

          expect(rows).toEqual([
            {
              elementId: 'id1',
              elementName: 'name1',
              elementType: 'type1',
              inputs: [
                { value: '', isDefaultValue: true },
                { value: 'defaultValue', isDefaultValue: true },
                { value: '', isDefaultValue: true }
              ]
            },
            {
              elementId: 'id2',
              elementName: 'name2',
              elementType: 'type2',
              elementImage: {
                image: { imageFileUrl: 'element2Image' },
                elementInfo: {
                  boundingRect: { top: 0, left: 0, width: 0, height: 0 },
                  innerHeight: 0,
                  innerWidth: 0,
                  outerHeight: 0,
                  outerWidth: 0
                }
              },
              inputs: [
                { value: '', isDefaultValue: true },
                { value: '', isDefaultValue: true },
                {
                  value: '',
                  isDefaultValue: false
                }
              ]
            }
          ])
        })
      })
    })
  })
})
