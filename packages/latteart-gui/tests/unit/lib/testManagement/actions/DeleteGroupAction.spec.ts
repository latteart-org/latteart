import { TestMatrixRepositoryImpl, TestTargetGroupRepositoryImpl } from 'latteart-client'
import { type RESTClient } from 'latteart-client'
import { DeleteGroupAction } from '@/lib/testManagement/actions/DeleteGroupAction'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('DeleteGroupAction', () => {
  describe('#deleteGroup', () => {
    it('groupを削除する', async () => {
      const testTargetGroupResponse = {
        ...baseRestClient,
        httpDelete: vi.fn().mockReturnValue({
          status: 204
        })
      }

      const testMatrixResponse = {
        ...baseRestClient,
        httpGet: vi.fn().mockReturnValue({
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

      const args = {
        testMatrixId: 'testMatrixId',
        groupId: 'groupId'
      }

      const result = await new DeleteGroupAction().deleteGroup(args, {
        testTargetGroupRepository: new TestTargetGroupRepositoryImpl(testTargetGroupResponse),
        testMatrixRepository: new TestMatrixRepositoryImpl(testMatrixResponse)
      })

      if (result.isFailure()) {
        throw result.error
      }

      expect(testTargetGroupResponse.httpDelete).toBeCalledWith('api/v1/test-target-groups/groupId')

      expect(testMatrixResponse.httpGet).toBeCalledWith('api/v1/test-matrices/testMatrixId')

      expect(result.data).toEqual({
        id: 'testMatrixId',
        name: 'testMatrixName',
        index: 0,
        groups: [],
        viewPoints: []
      })
    })
  })
})
