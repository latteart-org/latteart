import { ProjectRESTRepository, TestMatrixRepositoryImpl } from 'latteart-client'
import { type RESTClient } from 'latteart-client'
import { DeleteTestMatrixAction } from '@/lib/testManagement/actions/DeleteTestMatrixAction'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('DeleteTestMatrixAction', () => {
  describe('#deleteTestMatrix', () => {
    it('TestMatrixを削除する', async () => {
      const testMatrixResponse = {
        ...baseRestClient,
        httpDelete: vi.fn().mockResolvedValue({
          status: 204
        })
      }

      const projectResponse = {
        ...baseRestClient,
        httpGet: vi.fn().mockResolvedValue({
          status: 200,
          data: {
            id: 'projectId',
            name: 'projectName',
            testMatrices: [],
            stories: [],
            progressDatas: []
          }
        })
      }

      const args = {
        projectId: 'projectId',
        testMatrixId: 'testMatrixId'
      }

      const result = await new DeleteTestMatrixAction().deleteTestMatrix(args, {
        testMatrixRepository: new TestMatrixRepositoryImpl(testMatrixResponse),
        projectRepository: new ProjectRESTRepository(projectResponse)
      })

      if (result.isFailure()) {
        throw result.error
      }

      expect(testMatrixResponse.httpDelete).toBeCalledWith('api/v1/test-matrices/testMatrixId')

      expect(projectResponse.httpGet).toBeCalledWith('api/v1/projects/projectId')
    })
  })
})
