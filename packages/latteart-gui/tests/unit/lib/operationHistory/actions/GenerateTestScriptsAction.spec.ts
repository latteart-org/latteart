import { GenerateTestScriptsAction } from '@/lib/operationHistory/actions/GenerateTestScriptsAction'
import { SettingsRepositoryImpl, TestScriptRepositoryImpl } from 'latteart-client'
import { type RESTClient } from 'latteart-client'

const baseRestClient: RESTClient = {
  serverUrl: '',
  httpGet: vi.fn(),
  httpPost: vi.fn(),
  httpPut: vi.fn(),
  httpPatch: vi.fn(),
  httpDelete: vi.fn(),
  httpGetFile: vi.fn()
}

describe('GenerateTestScriptsAction', () => {
  describe('#generate', () => {
    describe('指定の操作履歴を元にテストスクリプトを生成する', () => {
      it.each([
        {
          testScriptOption: { isSimple: false, useMultiLocator: false },
          repositoryErrorCode: 'no_test_cases_generated',
          expectedMessageKey: 'error.operation_history.save_test_scripts_no_section_error'
        },
        {
          testScriptOption: { isSimple: true, useMultiLocator: false },
          repositoryErrorCode: 'no_test_cases_generated',
          expectedMessageKey: 'error.operation_history.save_test_scripts_no_operation_error'
        }
      ])(
        'テストケースを1つも生成できなかった場合、エラーを返却する',
        async ({ testScriptOption, repositoryErrorCode, expectedMessageKey }) => {
          const option = {
            testScript: testScriptOption,
            testData: {
              useDataDriven: false,
              maxGeneration: 0
            },
            buttonDefinitions: []
          }

          const restClient = {
            ...baseRestClient,
            httpPost: vi.fn().mockResolvedValue({
              status: 500,
              data: { code: repositoryErrorCode }
            })
          }

          const action = new GenerateTestScriptsAction(
            {
              testScriptRepository: new TestScriptRepositoryImpl(restClient),
              settingRepository: new SettingsRepositoryImpl(restClient)
            },
            option
          )

          const result = await action.generateFromTestResult('', {
            screenDefType: 'title',
            conditionGroups: []
          })

          if (result.isSuccess()) {
            throw new Error('failed')
          } else {
            expect(result.error).toEqual({
              messageKey: expectedMessageKey
            })
          }
        }
      )

      it.each([
        {
          repositoryErrorCode: 'hogehoge',
          expectedMessageKey: 'error.operation_history.save_test_scripts_failed'
        }
      ])(
        'テストスクリプト生成に失敗した場合、エラーを返却する',
        async ({ repositoryErrorCode, expectedMessageKey }) => {
          const option = {
            testScript: { isSimple: false, useMultiLocator: false },
            testData: {
              useDataDriven: false,
              maxGeneration: 0
            },
            buttonDefinitions: []
          }

          const restClient = {
            ...baseRestClient,
            httpPost: vi.fn().mockResolvedValue({
              status: 500,
              data: { code: repositoryErrorCode }
            })
          }

          const action = new GenerateTestScriptsAction(
            {
              testScriptRepository: new TestScriptRepositoryImpl(restClient),
              settingRepository: new SettingsRepositoryImpl(restClient)
            },
            option
          )

          const result = await action.generateFromTestResult('', {
            screenDefType: 'title',
            conditionGroups: []
          })

          if (result.isSuccess()) {
            throw new Error('failed')
          } else {
            expect(result.error).toEqual({
              messageKey: expectedMessageKey
            })
          }
        }
      )
    })
  })
})
