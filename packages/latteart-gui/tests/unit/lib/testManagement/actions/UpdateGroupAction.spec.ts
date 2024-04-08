import { TestMatrixRepositoryImpl, TestTargetGroupRepositoryImpl } from 'latteart-client'
import { type RESTClient } from 'latteart-client'
import { UpdateGroupAction } from '@/lib/testManagement/actions/UpdateGroupAction'

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
  describe('#updateGroup', () => {
    it('groupを更新する', async () => {
      const testTargetGroupResponse = {
        ...baseRestClient,
        httpPatch: vi.fn().mockResolvedValue({
          status: 200,
          data: {
            id: 'groupId',
            name: 'groupName',
            index: 0,
            testTargets: []
          }
        })
      }

      const testMatrixResponse = {
        ...baseRestClient,
        httpGet: vi.fn().mockResolvedValue({
          status: 200,
          data: {
            id: 'testMatrixId',
            name: 'testMatrixName',
            index: 0,
            groups: [
              {
                id: 'groupId',
                name: 'groupName',
                index: 0,
                testTargets: []
              }
            ]
          }
        })
      }

      const args = {
        testMatrixId: 'testMatrixId',
        groupId: 'groupId',
        name: 'groupName'
      }

      const result = await new UpdateGroupAction().updateGroup(args, {
        testTargetGroupRepository: new TestTargetGroupRepositoryImpl(testTargetGroupResponse),
        testMatrixRepository: new TestMatrixRepositoryImpl(testMatrixResponse)
      })

      if (result.isFailure()) {
        throw result.error
      }

      expect(testTargetGroupResponse.httpPatch).toBeCalledWith(
        'api/v1/test-target-groups/groupId',
        { name: 'groupName' }
      )

      expect(testMatrixResponse.httpGet).toBeCalledWith('api/v1/test-matrices/testMatrixId')

      expect(result.data).toEqual({
        id: 'testMatrixId',
        name: 'testMatrixName',
        index: 0,
        groups: [
          {
            id: 'groupId',
            name: 'groupName',
            index: 0,
            testTargets: []
          }
        ]
      })
    })
  })
})
