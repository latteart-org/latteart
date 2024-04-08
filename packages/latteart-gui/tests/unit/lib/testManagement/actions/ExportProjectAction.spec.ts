import { ExportProjectAction } from '@/lib/testManagement/actions/ExportProjectAction'
import { type RESTClient, type RESTClientResponse } from 'latteart-client'
import { ProjectRESTRepository } from 'latteart-client'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('ExportProjectAction', () => {
  describe('#export', () => {
    describe('指定のプロジェクトをファイルにエクスポートする', () => {
      const expectedData = { url: 'url' }
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData
      }

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: 'errorcode', message: 'errormessage' }
      }

      const projectId = 'projectId'
      const selectOption = {
        includeProject: true,
        includeTestResults: false,
        includeConfig: false
      }

      it('エクスポートに成功した場合は、エクスポートされたファイルのダウンロードURLを返す', async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: vi.fn().mockResolvedValue(resSuccess)
        }
        const action = new ExportProjectAction({
          projectRepository: new ProjectRESTRepository(restClient)
        })

        const result = await action.export(projectId, selectOption)

        expect(restClient.httpPost).toBeCalledWith(
          `api/v1/projects/${projectId}/export`,
          selectOption
        )
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
        const action = new ExportProjectAction({
          projectRepository: new ProjectRESTRepository(restClient)
        })

        const result = await action.export(projectId, selectOption)

        expect(restClient.httpPost).toBeCalledWith(
          `api/v1/projects/${projectId}/export`,
          selectOption
        )
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
