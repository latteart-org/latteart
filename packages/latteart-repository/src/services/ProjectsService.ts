/**
 * Copyright 2022 NTT Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  ProjectListResponse,
  GetProjectResponse,
  Project,
} from "../interfaces/Projects";
import { ProjectEntity } from "../entities/ProjectEntity";
import { getManager } from "typeorm";
import { ViewPointPresetEntity } from "../entities/ViewPointPresetEntity";
import { getRepository } from "typeorm";
import { TestMatrixEntity } from "../entities/TestMatrixEntity";
import { TestTargetGroupEntity } from "../entities/TestTargetGroupEntity";
import { ViewPointEntity } from "../entities/ViewPointEntity";
import { storyEntityToResponse } from "@/lib/entityToResponse";

export interface ProjectsService {
  getProjectIdentifiers(): Promise<ProjectListResponse[]>;
  createProject(): Promise<{ id: string; name: string }>;
  getProject(projectId: string): Promise<GetProjectResponse>;
}

export class ProjectsServiceImpl implements ProjectsService {
  public async getProjectIdentifiers(): Promise<ProjectListResponse[]> {
    const projectRepository = getRepository(ProjectEntity);
    const projects = await projectRepository.find();
    console.log(projects);
    return projects
      .map((project) => {
        return {
          id: project.id,
          name: project.name,
          createdAt: project.createdAt?.toString() ?? "",
        };
      })
      .sort((a, b) => {
        return a.createdAt > b.createdAt ? 1 : -1;
      });
  }

  public async createProject(): Promise<{ id: string; name: string }> {
    let savedProject: ProjectEntity | null = null;
    await getManager().transaction(async (transactionEntityManager) => {
      savedProject = await transactionEntityManager.save(
        new ProjectEntity("1")
      );

      await transactionEntityManager.save(
        new ViewPointPresetEntity({ project: savedProject, name: "" })
      );
    });
    if (!savedProject) {
      throw new Error("Project save failed.");
    }
    return {
      id: (savedProject as ProjectEntity).id,
      name: (savedProject as ProjectEntity).name,
    };
  }

  public async getProject(projectId: string): Promise<GetProjectResponse> {
    const project = await this.getReturnProject(projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    return this.projectEntityToResponse(project);
  }

  private async getReturnProject(projectId: string): Promise<ProjectEntity> {
    const projectRepository = getRepository(ProjectEntity);
    const testMatrixRepository = getRepository(TestMatrixEntity);
    const testTargetGroupRepository = getRepository(TestTargetGroupEntity);

    const updatedProject = await projectRepository.findOne(projectId, {
      relations: ["testMatrices"],
    });
    if (!updatedProject) {
      throw new Error(`Project not found: ${projectId}`);
    }
    updatedProject.testMatrices = await Promise.all(
      updatedProject?.testMatrices.map(async (testMatrix) => {
        const testMatrixWithStory = await testMatrixRepository.findOne(
          testMatrix.id,
          {
            relations: [
              "project",
              "stories",
              "stories.sessions",
              "stories.sessions.attachedFiles",
              "stories.sessions.testResult",
              "stories.sessions.testResult.notes",
              "stories.sessions.testResult.notes.testSteps",
              "stories.sessions.testResult.notes.testSteps.screenshot",
              "stories.sessions.testResult.notes.tags",
              "stories.viewPoint",
              "stories.testTarget",
            ],
          }
        );
        if (!testMatrixWithStory) {
          throw new Error();
        }
        testMatrixWithStory.testTargetGroups =
          await testTargetGroupRepository.find({
            where: { testMatrix: testMatrix.id },
            relations: ["testTargets"],
          });
        testMatrixWithStory.viewPoints = (
          await testMatrixRepository.findOne(testMatrix.id, {
            relations: ["viewPoints"],
          })
        )?.viewPoints as ViewPointEntity[];

        return testMatrixWithStory;
      })
    );
    return updatedProject;
  }

  public projectEntityToResponse(project: ProjectEntity): Project {
    const stories: Project["stories"] = [];
    for (const testMatrix of project.testMatrices) {
      for (const story of testMatrix.stories) {
        stories.push(storyEntityToResponse(story));
      }
    }

    const ascSortFunc = (a: any, b: any) => (a.index > b.index ? 1 : -1);

    return {
      id: project.id,
      name: project.name,
      testMatrices: project.testMatrices.sort(ascSortFunc).map((testMatrix) => {
        return {
          id: testMatrix.id,
          name: testMatrix.name,
          index: testMatrix.index,
          groups: testMatrix.testTargetGroups
            .sort(ascSortFunc)
            .map((testTargetGroup) => {
              return {
                id: testTargetGroup.id,
                name: testTargetGroup.name,
                index: testTargetGroup.index,
                testTargets: testTargetGroup.testTargets
                  .sort(ascSortFunc)
                  .map((testTarget) => {
                    const plans = JSON.parse(testTarget.text) as {
                      value: number;
                      viewPointId: string;
                    }[];
                    for (const v of testMatrix.viewPoints) {
                      if (!plans.find((plan) => plan.viewPointId === v.id)) {
                        plans.push({
                          viewPointId: v.id,
                          value: 0,
                        });
                      }
                    }
                    return {
                      id: testTarget.id,
                      name: testTarget.name,
                      index: testTarget.index,
                      plans,
                    };
                  }),
              };
            }),
          viewPoints: testMatrix.sortedViewPoint().map((viewPoint) => {
            return {
              id: viewPoint.id,
              name: viewPoint.name,
              index: viewPoint.index,
              description: viewPoint.description ?? "",
            };
          }),
        };
      }),
      stories,
    };
  }
}
