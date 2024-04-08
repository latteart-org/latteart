import * as StoryService from '@/lib/testManagement/Story'
import { type Story, type Session } from '@/lib/testManagement/types'

describe('Storyの', () => {
  const baseSession = {
    isDone: true,
    doneDate: '',
    testItem: '',
    testerName: '',
    memo: '',
    attachedFiles: [],
    testPurposes: [],
    notes: []
  }
  const baseStory = {
    status: '',
    id: '',
    testMatrixId: '',
    testTargetId: '',
    viewPointId: ''
  }
  describe('getTargetSessionは', () => {
    const session: Session = {
      ...baseSession,
      index: 0,
      id: 's001',
      name: 'session1',
      testResultFiles: []
    }

    const story: Story = { ...baseStory, index: 0, sessions: [session] }

    it('story内にsessionIdに一致するsessionが存在する場合、該当sessionを返す', () => {
      expect(StoryService.getTargetSessions(story, ['s001'])).toEqual([session])
    })

    it('story内にsessionIdに一致するsessionが存在しない場合、nullを返す', () => {
      expect(StoryService.getTargetSessions(story, ['s002'])).toBeNull()
    })
  })
  describe('collectTestResultIdsFromSessionは', () => {
    const session1: Session = {
      ...baseSession,
      index: 0,
      id: 's001',
      name: 'session1',
      testResultFiles: [{ name: 'testResult1', id: 't001', initialUrl: 'test', testingTime: 0 }]
    }
    const session2: Session = {
      ...baseSession,
      index: 0,
      id: 's002',
      name: 'session2',
      testResultFiles: []
    }
    const stories1: Story[] = [
      { ...baseStory, index: 0, sessions: [session1] },
      { ...baseStory, index: 1, sessions: [] }
    ]

    const stories2: Story[] = [
      { ...baseStory, index: 0, sessions: [session2] },
      { ...baseStory, index: 1, sessions: [] }
    ]

    it('stories内にテスト結果が紐づけられているセッションが存在する場合、該当sessionIdsとtestResultIdsを返す', () => {
      expect(StoryService.collectTestResultIdsFromSession(stories1)).toEqual({
        sessionIds: ['s001'],
        testResultIds: ['t001']
      })
    })

    it('stories内にテスト結果が紐づけられているセッションが存在しない場合、nullを返す', () => {
      expect(StoryService.collectTestResultIdsFromSession(stories2)).toBeNull()
    })
  })
})
