import { TestResultViewOption } from "@/domain/types";

export type GenerateGraphViewDto = {
  testResultIds: string[];
} & TestResultViewOption;
