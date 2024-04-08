import { TestTargetGroupRepositoryImpl } from 'latteart-client'
import { type RESTClient } from 'latteart-client'
import { AddNewGroupAction } from '@/lib/testManagement/actions/AddNewGroupAction'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('AddNewGroupAction', () => {
  describe('#addNewGroup', () => {
    it('Groupを追加する', async () => {
      const testTargetGroupResponse = {
        ...baseRestClient,
        httpPost: vi.fn().mockResolvedValue({
          status: 200,
          data: {
            id: 'testTargetGroupId',
            name: 'testTargetGroupName',
            index: 0,
            testTargets: []
          }
        })
      }

      const args = {
        testMatrixId: 'testMatrixId',
        name: 'testTargetGroupName'
      }

      const result = await new AddNewGroupAction().addNewGroup(args, {
        testTargetGroupRepository: new TestTargetGroupRepositoryImpl(testTargetGroupResponse)
      })

      if (result.isFailure()) {
        throw result.error
      }

      expect(testTargetGroupResponse.httpPost).toBeCalledWith('api/v1/test-target-groups', {
        testMatrixId: 'testMatrixId',
        name: 'testTargetGroupName'
      })

      expect(result.data).toEqual({
        id: 'testTargetGroupId',
        name: 'testTargetGroupName',
        index: 0,
        testTargets: []
      })
    })
  })
})
