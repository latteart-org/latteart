import { TestMatrixRepositoryImpl, ViewPointRepositoryImpl } from 'latteart-client'
import { type RESTClient } from 'latteart-client'
import { AddNewTestMatrixAction } from '@/lib/testManagement/actions/AddNewTestMatrixAction'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('AddNewTestMatrixAction', () => {
  describe('#addTestMatrix', () => {
    it('TestMatrixを追加する', async () => {
      const testMatrixResponse = {
        ...baseRestClient,
        httpPost: vi.fn().mockResolvedValue({
          status: 200,
          data: {
            id: 'testMatrixId',
            name: 'testMatrixName',
            index: 0,
            groups: [],
            viewPoints: []
          }
        })
      }
      const viewPointResponse = {
        ...baseRestClient,
        httpPost: vi.fn().mockResolvedValue({
          status: 200,
          data: {
            id: 'viewPointId',
            name: 'viewPointName',
            index: 0,
            description: 'viewPointDescription'
          }
        })
      }

      const args = {
        projectId: 'projectId',
        testMatrixName: 'testMatrixName',
        viewPoints: [
          {
            name: 'viewPointName',
            index: 0,
            description: 'viewPointDescription'
          }
        ]
      }

      const result = await new AddNewTestMatrixAction().addTestMatrix(args, {
        testMatrixRepository: new TestMatrixRepositoryImpl(testMatrixResponse),
        viewPointRepository: new ViewPointRepositoryImpl(viewPointResponse)
      })

      if (result.isFailure()) {
        throw result.error
      }

      expect(testMatrixResponse.httpPost).toBeCalledWith('api/v1/test-matrices', {
        projectId: 'projectId',
        name: 'testMatrixName'
      })

      expect(viewPointResponse.httpPost).toBeCalledWith('api/v1/view-points', {
        testMatrixId: 'testMatrixId',
        name: 'viewPointName',
        index: 0,
        description: 'viewPointDescription'
      })

      expect(result.data).toEqual({
        id: 'testMatrixId',
        name: 'testMatrixName',
        index: 0,
        groups: [],
        viewPoints: [
          {
            id: 'viewPointId',
            name: 'viewPointName',
            index: 0,
            description: 'viewPointDescription'
          }
        ]
      })
    })
  })
})
