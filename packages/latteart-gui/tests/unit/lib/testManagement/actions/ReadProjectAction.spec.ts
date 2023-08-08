import { RESTClient, RESTClientResponse } from "latteart-client";
import { TestResultRepository, ProjectRESTRepository } from "latteart-client";
import { ReadProjectAction } from "@/lib/testManagement/actions/ReadProjectAction";

const baseRestClient: RESTClient = {
  serverUrl: "",
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  httpPut: jest.fn(),
  httpPatch: jest.fn(),
  httpDelete: jest.fn(),
  httpGetFile: jest.fn(),
};

describe("ReadProjectActionの", () => {
  describe("#read", () => {
    describe("プロジェクト情報をリポジトリから読み込む", () => {
      const resFailure: RESTClientResponse = {
        status: 500,
        data: { code: "errorcode", message: "errormessage" },
      };

      describe("読み込みに成功した場合は、プロジェクト情報を返す", () => {
        const baseProjectExpectedData = {
          id: "",
          name: "",
          testMatrices: [],
          stories: [
            {
              id: "s1",
              testMatrixId: "",
              viewPointId: "",
              status: "",
              sessions: [],
            },
          ],
        };

        it("既にリポジトリにプロジェクトが1つ以上ある場合は、一番最後のプロジェクトを読み込む", async () => {
          const expectedProjectList = [
            { id: "project1", name: "name1" },
            { id: "project2", name: "name2" },
          ];
          const getProjectListResSuccess: RESTClientResponse = {
            status: 200,
            data: expectedProjectList,
          };
          const expectedProject = {
            ...baseProjectExpectedData,
            id: "project2",
            name: "name2",
          };
          const getProjectResSuccess: RESTClientResponse = {
            status: 200,
            data: expectedProject,
          };
          const restClient = {
            ...baseRestClient,
            httpGet: jest
              .fn()
              .mockResolvedValueOnce(getProjectListResSuccess)
              .mockResolvedValue(getProjectResSuccess),
          };
          const action = new ReadProjectAction({
            testResultRepository: new TestResultRepository(restClient),
            projectRepository: new ProjectRESTRepository(restClient),
            serviceUrl: "serviceUrl",
          });

          const result = await action.read();

          expect(restClient.httpGet).toBeCalledWith(`api/v1/projects`);
          // 既にプロジェクトが1つ以上ある場合は、プロジェクトの新規作成が行われないこと
          expect(restClient.httpPost).not.toBeCalled();
          // 一番最後のプロジェクトが指定されること
          const projectId =
            expectedProjectList[expectedProjectList.length - 1].id;
          expect(restClient.httpGet).toBeCalledWith(
            `api/v1/projects/${projectId}`
          );

          if (result.isFailure()) {
            throw new Error("failed");
          }
        });

        it("リポジトリにプロジェクトが1つもない場合は、プロジェクトを新規作成した上でそのプロジェクトを読み込む", async () => {
          const getProjectListResSuccess: RESTClientResponse = {
            status: 200,
            data: [],
          };
          const expectedNewProjectIdentifier = {
            id: "project1",
            name: "name1",
          };
          const postProjectResSuccess: RESTClientResponse = {
            status: 200,
            data: expectedNewProjectIdentifier,
          };
          const expectedProject = {
            ...baseProjectExpectedData,
            id: expectedNewProjectIdentifier.id,
            name: expectedNewProjectIdentifier.name,
          };
          const getProjectResSuccess: RESTClientResponse = {
            status: 200,
            data: expectedProject,
          };
          const restClient = {
            ...baseRestClient,
            httpGet: jest
              .fn()
              .mockResolvedValueOnce(getProjectListResSuccess)
              .mockResolvedValue(getProjectResSuccess),
            httpPost: jest.fn().mockResolvedValue(postProjectResSuccess),
          };
          const action = new ReadProjectAction({
            testResultRepository: new TestResultRepository(restClient),
            projectRepository: new ProjectRESTRepository(restClient),
            serviceUrl: "serviceUrl",
          });

          const result = await action.read();

          expect(restClient.httpGet).toBeCalledWith(`api/v1/projects`);
          // プロジェクトの新規作成が行われること
          expect(restClient.httpPost).toBeCalledWith(`api/v1/projects`, {
            name: "",
          });
          // 新規作成されたプロジェクトが指定されること
          const projectId = expectedNewProjectIdentifier.id;
          expect(restClient.httpGet).toBeCalledWith(
            `api/v1/projects/${projectId}`
          );

          if (result.isFailure()) {
            throw new Error("failed");
          }
        });
      });

      describe("読み込みに失敗した場合は、エラー情報を返す", () => {
        it("プロジェクト一覧の取得で失敗した場合", async () => {
          const restClient = {
            ...baseRestClient,
            httpGet: jest.fn().mockResolvedValue(resFailure),
          };
          const action = new ReadProjectAction({
            testResultRepository: new TestResultRepository(restClient),
            projectRepository: new ProjectRESTRepository(restClient),
            serviceUrl: "serviceUrl",
          });

          const result = await action.read();

          expect(restClient.httpGet).toBeCalledWith(`api/v1/projects`);
          // 途中処理で失敗したため以降のAPIは呼ばれないこと
          expect(restClient.httpPost).not.toBeCalled();
          expect(restClient.httpGet).toBeCalledTimes(1);

          if (result.isSuccess()) {
            throw new Error("failed");
          } else {
            expect(result.error).toEqual({
              messageKey: "error.test_management.read_project_data_failed",
            });
          }
        });

        it("プロジェクトの新規作成で失敗した場合", async () => {
          const getProjectListResSuccess: RESTClientResponse = {
            status: 200,
            data: [],
          };
          const restClient = {
            ...baseRestClient,
            httpGet: jest.fn().mockResolvedValue(getProjectListResSuccess),
            httpPost: jest.fn().mockResolvedValue(resFailure),
          };
          const action = new ReadProjectAction({
            testResultRepository: new TestResultRepository(restClient),
            projectRepository: new ProjectRESTRepository(restClient),
            serviceUrl: "serviceUrl",
          });

          const result = await action.read();

          expect(restClient.httpGet).toBeCalledWith(`api/v1/projects`);
          expect(restClient.httpPost).toBeCalledWith(`api/v1/projects`, {
            name: "",
          });
          // 途中処理で失敗したため以降のAPIは呼ばれないこと
          expect(restClient.httpGet).toBeCalledTimes(1);

          if (result.isSuccess()) {
            throw new Error("failed");
          } else {
            expect(result.error).toEqual({
              messageKey: "error.test_management.read_project_data_failed",
            });
          }
        });

        it("プロジェクトの読み込みで失敗した場合", async () => {
          const expectedProjectList = [
            { id: "project1", name: "name1" },
            { id: "project2", name: "name2" },
          ];
          const getProjectListResSuccess: RESTClientResponse = {
            status: 200,
            data: expectedProjectList,
          };
          const restClient = {
            ...baseRestClient,
            httpGet: jest
              .fn()
              .mockResolvedValueOnce(getProjectListResSuccess)
              .mockResolvedValue(resFailure),
          };
          const action = new ReadProjectAction({
            testResultRepository: new TestResultRepository(restClient),
            projectRepository: new ProjectRESTRepository(restClient),
            serviceUrl: "serviceUrl",
          });

          const result = await action.read();

          expect(restClient.httpGet).toBeCalledWith(`api/v1/projects`);
          const projectId =
            expectedProjectList[expectedProjectList.length - 1].id;
          expect(restClient.httpGet).toBeCalledWith(
            `api/v1/projects/${projectId}`
          );

          if (result.isSuccess()) {
            throw new Error("failed");
          } else {
            expect(result.error).toEqual({
              messageKey: "error.test_management.read_project_data_failed",
            });
          }
        });
      });
    });
  });
});
