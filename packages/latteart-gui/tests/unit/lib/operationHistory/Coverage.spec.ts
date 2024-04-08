import { type GraphView } from 'latteart-client'
import { getCoverages } from '@/lib/operationHistory/Coverage'

describe('getCoverages', () => {
  it('ビューのモデルを元に画面要素カバレッジを算出する', async () => {
    const graphView: GraphView = {
      nodes: [
        {
          windowId: '',
          screenId: 's1',
          testSteps: [
            {
              id: '',
              type: '',
              targetElementId: 'e1',
              noteIds: [],
              pageUrl: '',
              pageTitle: '',
              imageFileUrl: 'e1.png',
              testResultId: ''
            },
            {
              id: '',
              type: '',
              noteIds: [],
              pageUrl: '',
              pageTitle: '',
              imageFileUrl: '',
              testResultId: ''
            }
          ],
          defaultValues: []
        }
      ],
      store: {
        windows: [],
        screens: [{ id: 's1', name: '画面1', elementIds: ['e1', 'e2'] }],
        elements: [
          {
            id: 'e1',
            pageUrl: '',
            pageTitle: '',
            xpath: 'xpath1',
            tagname: 'tagname1',
            text: 'text1',
            attributes: {}
          },
          {
            id: 'e2',
            pageUrl: '',
            pageTitle: '',
            xpath: 'xpath2',
            tagname: 'tagname2',
            text: 'text2',
            attributes: {}
          }
        ],
        testPurposes: [],
        notes: []
      }
    }
    const inclusionTags: string[] = ['tagname1', 'tagname2']

    const result = getCoverages(graphView, inclusionTags)

    expect(result).toEqual([
      {
        screenTitle: '画面1',
        percentage: 50,
        elements: [
          {
            tagname: 'tagname1',
            text: 'text1',
            type: '',
            id: '',
            imageFileUrl: '',
            name: '',
            operated: true
          },
          {
            tagname: 'tagname2',
            text: 'text2',
            type: '',
            id: '',
            imageFileUrl: '',
            name: '',
            operated: false
          }
        ]
      }
    ])
  })
})
