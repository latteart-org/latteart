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

import { Group, ViewPoint, TestTarget, Plan } from "@/lib/testManagement/types";

/**
 * Get the number of each plan from the group.
 * @param group  Group information.
 * @returns  Number of viewPoints and plans for each test target.
 */
export function getItems(group: Group): any[] {
  const items: any[] = [];
  group.testTargets.forEach((testTarget: TestTarget) => {
    const item: any = {
      name: testTarget.name,
      id: testTarget.id,
    };
    testTarget.plans.forEach((plan: Plan) => {
      item[plan.viewPointId] = plan.value;
    });
    items.push(item);
  });
  return items;
}

/**
 * Add a new test target to a group and return the added group.
 * @param testTargetName  Test target name.
 * @param viewPoints
 * @param group  Group to add to.
 * @param testTargetSequence  Sequence number to be tested.
 * @returns Updated group.
 */
export function addNewTestTarget(
  testTargetName: string,
  viewPoints: ViewPoint[],
  group: Group,
  testTargetSequence: string
): Group {
  const targertGroup = Object.assign({}, group);
  const plans = viewPoints.map((viewPoint: ViewPoint) => {
    return {
      viewPointId: viewPoint.id,
      value: 0,
    };
  });
  const newTestTarget: TestTarget = {
    id: "tmp-t" + ("00" + testTargetSequence).slice(-3),
    name: testTargetName,
    plans,
  };
  targertGroup.testTargets.push(newTestTarget);
  return targertGroup;
}

/**
 * Remove the test target from the group.
 * @param testTargetId  Test target ID to be deleted.
 * @param group  Group with test target to be deleted.
 * @returns Updated group.
 */
export function deleteTestTarget(testTargetId: string, group: Group): Group {
  const targetGroup = Object.assign({}, group);
  const newTestTargets = targetGroup.testTargets.filter(
    (testTarget: TestTarget) => {
      return testTargetId !== testTarget.id;
    }
  );
  targetGroup.testTargets = newTestTargets;
  return targetGroup;
}

/**
 * Update plan.
 * @param planId  Plan ID to be updated.
 * @param value  Value you want to update.
 * @param group  Groups that have plans to renew.
 * @returns Group with updated plan.
 */
export function updatePlan(planId: string, value: number, group: Group): Group {
  console.log(planId, value, group);
  const targetGroup = Object.assign({}, group);

  const ids = planId.split("_");
  const testTargetId = ids[1];
  const viewPointId = ids[2];
  const newTestTargets = targetGroup.testTargets.map(
    (testTarget: TestTarget) => {
      if (testTarget.id !== testTargetId) {
        return testTarget;
      }
      testTarget.plans = testTarget.plans.map((plan: Plan) => {
        if (plan.viewPointId === viewPointId) {
          plan.value = value;
        }
        return plan;
      });
      return testTarget;
    }
  );
  targetGroup.testTargets = newTestTargets;
  return targetGroup;
}

/**
 * Update the name of the test target.
 * @param testTargetName  Test target name.
 * @param testTargetId  Test target for which you want to update the name.
 * @param group  Group that holds the test target to be updated.
 * @returns Group with updated test target.
 */
export function renameTestTarget(
  testTargetName: string,
  testTargetId: string,
  group: Group
): Group {
  const targetGroup = Object.assign({}, group);
  targetGroup.testTargets = targetGroup.testTargets.map(
    (testTarget: TestTarget) => {
      if (testTarget.id === testTargetId) {
        testTarget.name = testTargetName;
      }
      return testTarget;
    }
  );
  return targetGroup;
}

/**
 * Change the order of Test targets.
 * @param testTargetId  ID of the test target you want to change.
 * @param orderType  Change the type. One moves "up" and the other moves "down".
 * @param group  The group that holds the test target whose order you want to change.
 * @returns Updated group.
 */
export function changeTestTargetOrder(
  testTargetId: string,
  orderType: string,
  group: Group
): Group {
  const targetGroup = Object.assign({}, group);
  const fromIndex = targetGroup.testTargets.findIndex(
    (testTarget: TestTarget) => {
      return testTarget.id === testTargetId;
    }
  );

  let toIndex = 0;
  if (orderType === "up") {
    toIndex = fromIndex - 1;
  } else if (orderType === "down") {
    toIndex = fromIndex + 1;
  } else {
    console.error("invalid orderType");
    return group;
  }

  if (toIndex < 0 || targetGroup.testTargets.length <= toIndex) {
    console.error("invalid orderType");
    return group;
  }

  const tmpToTarget = targetGroup.testTargets[toIndex];
  targetGroup.testTargets[toIndex] = targetGroup.testTargets[fromIndex];
  targetGroup.testTargets[fromIndex] = tmpToTarget;

  return targetGroup;
}

/**
 * Check if the order of test targets can be changed.
 * @param testTargetId  ID of the test target you want to change.
 * @param orderType  Change the type. See if you can move one "up" and the other "down".
 * @param group  Change the type. See if you can move one "up" and the other "down".
 * @returns Returns true if the order can be changed.
 */
export function checkDisabledButton(
  testTargetId: string,
  orderType: string,
  group: Group
): boolean {
  const index = group.testTargets.findIndex((testTarget: TestTarget) => {
    return testTarget.id === testTargetId;
  });
  if (index === -1) {
    return false;
  }
  if (orderType === "up") {
    return index === 0;
  } else if (orderType === "down") {
    return index === group.testTargets.length - 1;
  }
  console.error("invalid orderType");
  return true;
}
