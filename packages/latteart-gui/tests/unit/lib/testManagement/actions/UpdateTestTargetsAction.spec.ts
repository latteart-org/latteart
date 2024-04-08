import { TestTargetGroupRepositoryImpl, TestTargetRepositoryImpl } from 'latteart-client'
import { type RESTClient } from 'latteart-client'
import { UpdateTestTargetsAction } from '@/lib/testManagement/actions/UpdateTestTargetsAction'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('UpdateTestTargetsAction', () => {
  describe('#updateTestTargets', () => {
    it('TestTarget更新', async () => {
      const testTargetResponse = {
        ...baseRestClient,
        httpPatch: vi.fn().mockResolvedValue({
          status: 200,
          data: {
            id: 'testTargetId',
            name: 'testTargetName',
            index: 0,
            plans: []
          }
        })
      }
      const testTargetGroupResponse = {
        ...baseRestClient,
        httpGet: vi.fn().mockResolvedValue({
          status: 200,
          data: {
            id: 'groupId',
            name: 'groupName',
            index: 0,
            testTargets: [
              {
                id: 'testTargetId',
                name: 'testTargetName',
                index: 0,
                plans: []
              }
            ]
          }
        })
      }

      const args = {
        projectId: 'projectId',
        testMatrixId: 'testMatrixId',
        groupId: 'groupId',
        testTargets: [
          {
            id: 'testTargetId',
            name: 'testTargetName',
            index: 0,
            plans: []
          }
        ]
      }

      const result = await new UpdateTestTargetsAction().updateTestTargets(args, {
        testTargetRepository: new TestTargetRepositoryImpl(testTargetResponse),
        testTargetGroupRepository: new TestTargetGroupRepositoryImpl(testTargetGroupResponse)
      })

      if (result.isFailure()) {
        throw result.error
      }

      expect(testTargetResponse.httpPatch).toBeCalledWith(
        'api/v1/projects/projectId/test-targets/testTargetId',
        {
          name: 'testTargetName',
          index: 0,
          plans: []
        }
      )

      expect(testTargetGroupResponse.httpGet).toBeCalledWith('api/v1/test-target-groups/groupId')

      expect(result.data).toEqual({
        id: 'groupId',
        name: 'groupName',
        index: 0,
        testTargets: [
          {
            id: 'testTargetId',
            name: 'testTargetName',
            index: 0,
            plans: []
          }
        ]
      })
    })
  })
})
