import { ExportTestResultAction } from '@/lib/operationHistory/actions/testResult/ExportTestResultAction'
import { type RESTClientResponse, type RESTClient, TestResultRepositoryImpl } from 'latteart-client'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('ExportTestResultAction', () => {
  describe('#exportWithTestResult', () => {
    describe('指定のテスト結果をファイルにエクスポートする', () => {
      const expectedData = { url: 'url' }
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData
      }

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: 'errorcode', message: 'errormessage' }
      }

      const testResultId = 'testResultId'

      it('エクスポートに成功した場合は、エクスポートされたファイルのダウンロードURLを返す', async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: vi.fn().mockResolvedValue(resSuccess)
        }
        const action = new ExportTestResultAction({
          testResultRepository: new TestResultRepositoryImpl(restClient)
        })

        const result = await action.exportWithTestResult(testResultId)

        expect(restClient.httpPost).toBeCalledWith(`api/v1/test-results/${testResultId}/export`)
        if (result.isSuccess()) {
          expect(result.data).toEqual(expectedData.url)
        } else {
          throw new Error('failed')
        }
      })

      it('エクスポートに失敗した場合は、エラー情報を返す', async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: vi.fn().mockResolvedValue(resFailure)
        }
        const action = new ExportTestResultAction({
          testResultRepository: new TestResultRepositoryImpl(restClient)
        })

        const result = await action.exportWithTestResult(testResultId)

        expect(restClient.httpPost).toBeCalledWith(`api/v1/test-results/${testResultId}/export`)
        if (result.isSuccess()) {
          throw new Error('failed')
        } else {
          expect(result.error).toEqual({
            messageKey: 'error.import_export.create-export-data-error'
          })
        }
      })
    })
  })
})
