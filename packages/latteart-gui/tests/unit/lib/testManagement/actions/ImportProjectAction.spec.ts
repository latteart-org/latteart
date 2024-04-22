import { ImportProjectAction } from '@/lib/testManagement/actions/ImportProjectAction'
import { ImportProjectRepositoryImpl } from 'latteart-client'
import { type RESTClient, type RESTClientResponse } from 'latteart-client'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('ImportProjectAction', () => {
  describe('#import', () => {
    describe('指定のプロジェクトファイルをリポジトリにインポートする', () => {
      const expectedData = { projectId: 'projectId' }
      const resSuccess: RESTClientResponse = {
        status: 200,
        data: expectedData
      }

      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: 'errorcode', message: 'errormessage' }
      }

      const source = { projectFile: { data: 'data', name: 'name' } }
      const selectOption = {
        includeProject: true,
        includeTestResults: false,
        includeConfig: false
      }

      it('インポートに成功した場合は、インポートされたプロジェクトの識別情報を返す', async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: vi.fn().mockResolvedValue(resSuccess)
        }
        const action = new ImportProjectAction({
          importProjectRepository: new ImportProjectRepositoryImpl(restClient)
        })

        const result = await action.import(source, selectOption)

        expect(restClient.httpPost).toBeCalledWith(`api/v1/imports/projects`, {
          source,
          includeTestResults: selectOption.includeTestResults,
          includeProject: selectOption.includeProject,
          includeConfig: selectOption.includeConfig
        })
        if (result.isSuccess()) {
          expect(result.data).toEqual({ projectId: expectedData.projectId })
        } else {
          throw new Error('failed')
        }
      })

      it('インポートに失敗した場合は、エラー情報を返す', async () => {
        const restClient = {
          ...baseRestClient,
          httpPost: vi.fn().mockResolvedValue(resFailure)
        }
        const action = new ImportProjectAction({
          importProjectRepository: new ImportProjectRepositoryImpl(restClient)
        })

        const result = await action.import(source, selectOption)

        expect(restClient.httpPost).toBeCalledWith(`api/v1/imports/projects`, {
          source,
          includeTestResults: selectOption.includeTestResults,
          includeProject: selectOption.includeProject,
          includeConfig: selectOption.includeConfig
        })
        if (result.isSuccess()) {
          throw new Error('failed')
        } else {
          expect(result.error).toEqual({
            messageKey: 'error.import_export.import-data-error'
          })
        }
      })
    })
  })
})
