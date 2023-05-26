import { TestResultViewOption } from "@/domain/types";

export type MergeGraphViewsDto = {
  testResultIds: string[];
} & TestResultViewOption;
