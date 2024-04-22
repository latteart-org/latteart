import { LoadHistoryAction } from '@/lib/operationHistory/actions/LoadHistoryAction'
import { TestResultRepositoryImpl } from 'latteart-client'
import { type RESTClient, type RESTClientResponse } from 'latteart-client'
import { type TestResult } from '@/lib/operationHistory/types'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('LoadHistoryAction', () => {
  describe('#loadHistory', () => {
    describe('指定のテスト結果をリポジトリから読み込む', () => {
      const testResult: TestResult = {
        id: 'id',
        name: 'name',
        startTimeStamp: 0,
        lastUpdateTimeStamp: 0,
        initialUrl: 'url',
        testingTime: 0,
        testSteps: []
      }
      const expectedTestResult = {
        historyItems: [],
        url: 'url',
        testResultInfo: { id: 'id', name: 'name' },
        testStepIds: [],
        testingTime: 0
      }
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: testResult
      }

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: 'errorcode', message: 'errormessage' }
      }
      it('リポジトリからの読み込みに成功した場合、読み込んだテスト結果を返す', async () => {
        const restClient = {
          ...baseRestClient,
          httpGet: vi.fn().mockResolvedValue(resSuccess)
        }
        const action = new LoadHistoryAction({
          testResultRepository: new TestResultRepositoryImpl(restClient),
          serviceUrl: 'serviceUrl'
        })

        const testResultId = 'testResultId'
        const result = await action.loadHistory(testResultId)

        expect(restClient.httpGet).toBeCalledWith(`api/v1/test-results/${testResultId}`)

        if (result.isSuccess()) {
          expect(result.data).toEqual(expectedTestResult)
        } else {
          throw new Error('failed')
        }
      })

      it('リポジトリからの読み込みに失敗した場合、エラー情報を返す', async () => {
        const restClient = {
          ...baseRestClient,
          httpGet: vi.fn().mockResolvedValue(resFailure)
        }
        const action = new LoadHistoryAction({
          testResultRepository: new TestResultRepositoryImpl(restClient),
          serviceUrl: 'serviceUrl'
        })

        const testResultId = 'testResultId'
        const result = await action.loadHistory(testResultId)

        expect(restClient.httpGet).toBeCalledWith(`api/v1/test-results/${testResultId}`)

        if (result.isSuccess()) {
          throw new Error('failed')
        } else {
          expect(result.error).toEqual({
            messageKey: 'error.operation_history.load_history_failed'
          })
        }
      })
    })
  })
})
