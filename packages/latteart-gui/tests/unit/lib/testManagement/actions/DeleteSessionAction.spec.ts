import { SessionRepositoryImpl } from 'latteart-client'
import { type RESTClient } from 'latteart-client'
import { DeleteSessionAction } from '@/lib/testManagement/actions/DeleteSessionAction'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('DeleteSessionAction', () => {
  describe('#deleteSession', () => {
    it('Sessionを削除する', async () => {
      const deleteSessionResponse = {
        ...baseRestClient,
        httpDelete: vi.fn().mockResolvedValue({
          status: 204
        })
      }

      const args = {
        projectId: 'projectId',
        sessionId: 'sessionId'
      }

      const result = await new DeleteSessionAction().deleteSession(args, {
        sessionRepository: new SessionRepositoryImpl(deleteSessionResponse)
      })

      if (result.isFailure()) {
        throw result.error
      }

      expect(deleteSessionResponse.httpDelete).toBeCalledWith(
        'api/v1/projects/projectId/sessions/sessionId'
      )

      expect(result.data).toEqual(undefined)
    })
  })
})
