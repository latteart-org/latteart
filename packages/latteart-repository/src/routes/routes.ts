/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import {
  Controller,
  ValidationService,
  FieldErrors,
  ValidateError,
  TsoaRoute,
  HttpStatusCodeLiteral,
  TsoaResponse,
  fetchMiddlewares,
} from "@tsoa/runtime";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CompressedImageController } from "./../controllers/CompressedImageController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConfigExportController } from "./../controllers/ConfigExportController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConfigsController } from "./../controllers/ConfigsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NoteCompressedImageController } from "./../controllers/NoteCompressedImageController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NotesController } from "./../controllers/NotesController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProjectExportController } from "./../controllers/ProjectExportController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProjectsController } from "./../controllers/ProjectsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProjectTestScriptsController } from "./../controllers/ProjectTestScriptsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ServerNameController } from "./../controllers/ServerNameController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SessionsController } from "./../controllers/SessionsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SnapshotsController } from "./../controllers/SnapshotsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestResultExportController } from "./../controllers/TestResultExportController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestResultImportController } from "./../controllers/TestResultImportController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestResultsController } from "./../controllers/TestResultsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestScriptsController } from "./../controllers/TestScriptsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestStepsController } from "./../controllers/TestStepsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ScreenshotsController } from "./../controllers/ScreenshotsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestMatricesController } from "./../controllers/TestMatricesController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestTargetGroupsController } from "./../controllers/TestTargetGroupsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { TestTargetsController } from "./../controllers/TestTargetsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ViewPointsController } from "./../controllers/ViewPointsController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { StoriesController } from "./../controllers/StoriesController";
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProjectImportController } from "./../controllers/ProjectImportController";
import type { RequestHandler, Router } from "express";

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
  CreateCompressedImageResponse: {
    dataType: "refObject",
    properties: {
      imageFileUrl: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_compress_test_step_image_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["compress_test_step_image_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_export_config_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["export_config_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AutofillCondition: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        inputValue: { dataType: "string", required: true },
        locatorMatchType: {
          dataType: "union",
          subSchemas: [
            { dataType: "enum", enums: ["equals"] },
            { dataType: "enum", enums: ["contains"] },
          ],
          required: true,
        },
        locator: { dataType: "string", required: true },
        locatorType: { dataType: "string", required: true },
        isEnabled: { dataType: "boolean", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AutofillConditionGroup: {
    dataType: "refObject",
    properties: {
      isEnabled: { dataType: "boolean", required: true },
      settingName: { dataType: "string", required: true },
      url: { dataType: "string", required: true },
      title: { dataType: "string", required: true },
      inputValueConditions: {
        dataType: "array",
        array: { dataType: "refAlias", ref: "AutofillCondition" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AutofillSetting: {
    dataType: "refObject",
    properties: {
      conditionGroups: {
        dataType: "array",
        array: { dataType: "refObject", ref: "AutofillConditionGroup" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AutoOperationConditionGroup: {
    dataType: "refObject",
    properties: {
      isEnabled: { dataType: "boolean", required: true },
      settingName: { dataType: "string", required: true },
      details: { dataType: "string" },
      autoOperations: {
        dataType: "array",
        array: { dataType: "any" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  AutoOperationSetting: {
    dataType: "refObject",
    properties: {
      conditionGroups: {
        dataType: "array",
        array: { dataType: "refObject", ref: "AutoOperationConditionGroup" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ScreenDefinitionConfig: {
    dataType: "refObject",
    properties: {
      screenDefType: {
        dataType: "union",
        subSchemas: [
          { dataType: "enum", enums: ["title"] },
          { dataType: "enum", enums: ["url"] },
        ],
        required: true,
      },
      conditionGroups: {
        dataType: "array",
        array: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            conditions: {
              dataType: "array",
              array: {
                dataType: "nestedObjectLiteral",
                nestedProperties: {
                  word: { dataType: "string", required: true },
                  matchType: {
                    dataType: "union",
                    subSchemas: [
                      { dataType: "enum", enums: ["contains"] },
                      { dataType: "enum", enums: ["equals"] },
                      { dataType: "enum", enums: ["regex"] },
                    ],
                    required: true,
                  },
                  definitionType: {
                    dataType: "union",
                    subSchemas: [
                      { dataType: "enum", enums: ["url"] },
                      { dataType: "enum", enums: ["title"] },
                      { dataType: "enum", enums: ["keyword"] },
                    ],
                    required: true,
                  },
                  isEnabled: { dataType: "boolean", required: true },
                },
              },
              required: true,
            },
            screenName: { dataType: "string", required: true },
            isEnabled: { dataType: "boolean", required: true },
          },
        },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Coverage: {
    dataType: "refObject",
    properties: {
      include: {
        dataType: "nestedObjectLiteral",
        nestedProperties: {
          tags: {
            dataType: "array",
            array: { dataType: "string" },
            required: true,
          },
        },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ProjectConfig: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        config: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            imageCompression: {
              dataType: "nestedObjectLiteral",
              nestedProperties: {
                isDeleteSrcImage: { dataType: "boolean", required: true },
                isEnabled: { dataType: "boolean", required: true },
              },
              required: true,
            },
            coverage: { ref: "Coverage", required: true },
            screenDefinition: { ref: "ScreenDefinitionConfig", required: true },
            autoOperationSetting: {
              ref: "AutoOperationSetting",
              required: true,
            },
            autofillSetting: { ref: "AutofillSetting", required: true },
          },
          required: true,
        },
        defaultTagList: {
          dataType: "array",
          array: { dataType: "string" },
          required: true,
        },
        viewPointsPreset: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              viewPoints: {
                dataType: "array",
                array: {
                  dataType: "nestedObjectLiteral",
                  nestedProperties: {
                    description: { dataType: "string", required: true },
                    name: { dataType: "string", required: true },
                  },
                },
                required: true,
              },
              name: { dataType: "string", required: true },
              id: { dataType: "string", required: true },
            },
          },
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ExportableConfig: {
    dataType: "refAlias",
    type: { ref: "ProjectConfig", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetConfigResponse: {
    dataType: "refAlias",
    type: { ref: "ExportableConfig", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_settings_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_settings_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PutConfigResponse: {
    dataType: "refAlias",
    type: { ref: "ExportableConfig", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_save_settings_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["save_settings_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PutConfigDto: {
    dataType: "refAlias",
    type: { ref: "ExportableConfig", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateResponseDto: {
    dataType: "refObject",
    properties: {
      imageFileUrl: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_compress_note_image_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["compress_note_image_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_Note.Exclude_keyofNote.screenshot__": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        id: { dataType: "string", required: true },
        type: { dataType: "string", required: true },
        value: { dataType: "string", required: true },
        details: { dataType: "string", required: true },
        tags: {
          dataType: "array",
          array: { dataType: "string" },
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Omit_Note.screenshot_": {
    dataType: "refAlias",
    type: { ref: "Pick_Note.Exclude_keyofNote.screenshot__", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateNoteResponse: {
    dataType: "refAlias",
    type: {
      dataType: "intersection",
      subSchemas: [
        { ref: "Omit_Note.screenshot_" },
        {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            imageFileUrl: { dataType: "string", required: true },
          },
        },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_add_note_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: { dataType: "enum", enums: ["add_note_failed"], required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_Note.type-or-value-or-details_": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        type: { dataType: "string", required: true },
        value: { dataType: "string", required: true },
        details: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  UpdateNoteDto: {
    dataType: "refAlias",
    type: {
      dataType: "intersection",
      subSchemas: [
        { ref: "Pick_Note.type-or-value-or-details_" },
        {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            tags: { dataType: "array", array: { dataType: "string" } },
          },
        },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateNoteDto: {
    dataType: "refAlias",
    type: {
      dataType: "intersection",
      subSchemas: [
        { ref: "UpdateNoteDto" },
        {
          dataType: "nestedObjectLiteral",
          nestedProperties: { imageData: { dataType: "string" } },
        },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetNoteResponse: {
    dataType: "refAlias",
    type: { ref: "CreateNoteResponse", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_note_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: { dataType: "enum", enums: ["get_note_failed"], required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  UpdateNoteResponse: {
    dataType: "refAlias",
    type: { ref: "CreateNoteResponse", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_edit_note_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: { dataType: "enum", enums: ["edit_note_failed"], required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_delete_note_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["delete_note_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_export_project_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["export_project_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateProjectExportDto: {
    dataType: "refObject",
    properties: {
      includeTestResults: { dataType: "boolean", required: true },
      includeProject: { dataType: "boolean", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ProjectListResponse: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
      createdAt: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_save_project_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["save_project_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  TestTarget: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
      index: { dataType: "double", required: true },
      plans: {
        dataType: "array",
        array: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            value: { dataType: "double", required: true },
            viewPointId: { dataType: "string", required: true },
          },
        },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  TestTargetGroup: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
      index: { dataType: "double", required: true },
      testTargets: {
        dataType: "array",
        array: { dataType: "refObject", ref: "TestTarget" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_TestMatrix.Exclude_keyofTestMatrix.viewPoints__": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        id: { dataType: "string", required: true },
        name: { dataType: "string", required: true },
        index: { dataType: "double", required: true },
        groups: {
          dataType: "array",
          array: { dataType: "refObject", ref: "TestTargetGroup" },
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Omit_TestMatrix.viewPoints_": {
    dataType: "refAlias",
    type: {
      ref: "Pick_TestMatrix.Exclude_keyofTestMatrix.viewPoints__",
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_ViewPoint.Exclude_keyofViewPoint.index__": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        id: { dataType: "string", required: true },
        name: { dataType: "string", required: true },
        description: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Omit_ViewPoint.index_": {
    dataType: "refAlias",
    type: {
      ref: "Pick_ViewPoint.Exclude_keyofViewPoint.index__",
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ProjectViewPoint: {
    dataType: "refAlias",
    type: {
      dataType: "intersection",
      subSchemas: [
        { ref: "Omit_ViewPoint.index_" },
        {
          dataType: "nestedObjectLiteral",
          nestedProperties: { index: { dataType: "double", required: true } },
        },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ProjectTestMatrix: {
    dataType: "refAlias",
    type: {
      dataType: "intersection",
      subSchemas: [
        { ref: "Omit_TestMatrix.viewPoints_" },
        {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            viewPoints: {
              dataType: "array",
              array: { dataType: "refAlias", ref: "ProjectViewPoint" },
              required: true,
            },
          },
        },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Session: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        testingTime: { dataType: "double", required: true },
        notes: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "GetNoteResponse" },
          required: true,
        },
        testPurposes: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "GetNoteResponse" },
          required: true,
        },
        initialUrl: { dataType: "string", required: true },
        testResultFiles: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              id: { dataType: "string", required: true },
              name: { dataType: "string", required: true },
            },
          },
          required: true,
        },
        attachedFiles: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              fileUrl: { dataType: "string", required: true },
              name: { dataType: "string", required: true },
            },
          },
          required: true,
        },
        memo: { dataType: "string", required: true },
        testerName: { dataType: "string", required: true },
        testItem: { dataType: "string", required: true },
        doneDate: { dataType: "string", required: true },
        isDone: { dataType: "boolean", required: true },
        id: { dataType: "string", required: true },
        name: { dataType: "string", required: true },
        index: { dataType: "double", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Story: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        sessions: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "Session" },
          required: true,
        },
        index: { dataType: "double", required: true },
        status: { dataType: "string", required: true },
        viewPointId: { dataType: "string", required: true },
        testTargetId: { dataType: "string", required: true },
        testMatrixId: { dataType: "string", required: true },
        id: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  Project: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        stories: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "Story" },
          required: true,
        },
        testMatrices: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "ProjectTestMatrix" },
          required: true,
        },
        name: { dataType: "string", required: true },
        id: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetProjectResponse: {
    dataType: "refAlias",
    type: { ref: "Project", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_project_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_project_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  DailyTestProgress: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        storyProgresses: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              incompletedSessionNumber: { dataType: "double", required: true },
              completedSessionNumber: { dataType: "double", required: true },
              plannedSessionNumber: { dataType: "double", required: true },
              viewPointId: { dataType: "string", required: true },
              testTargetId: { dataType: "string", required: true },
              testTargetGroupId: { dataType: "string", required: true },
              testMatrixId: { dataType: "string", required: true },
              storyId: { dataType: "string", required: true },
            },
          },
          required: true,
        },
        date: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetTestProgressResponse: {
    dataType: "refAlias",
    type: { ref: "DailyTestProgress", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_test_progress_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_test_progress_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_save_test_script_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["save_test_script_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  TestResultViewOption: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        node: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            definitions: {
              dataType: "array",
              array: {
                dataType: "nestedObjectLiteral",
                nestedProperties: {
                  conditions: {
                    dataType: "array",
                    array: {
                      dataType: "nestedObjectLiteral",
                      nestedProperties: {
                        value: { dataType: "string", required: true },
                        method: {
                          dataType: "union",
                          subSchemas: [
                            { dataType: "enum", enums: ["contains"] },
                            { dataType: "enum", enums: ["equals"] },
                            { dataType: "enum", enums: ["regex"] },
                          ],
                          required: true,
                        },
                        target: {
                          dataType: "union",
                          subSchemas: [
                            { dataType: "enum", enums: ["title"] },
                            { dataType: "enum", enums: ["url"] },
                            { dataType: "enum", enums: ["keyword"] },
                          ],
                          required: true,
                        },
                      },
                    },
                    required: true,
                  },
                  name: { dataType: "string", required: true },
                },
              },
              required: true,
            },
            unit: {
              dataType: "union",
              subSchemas: [
                { dataType: "enum", enums: ["title"] },
                { dataType: "enum", enums: ["url"] },
              ],
              required: true,
            },
          },
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  TestScriptOption: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        buttonDefinitions: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              attribute: {
                dataType: "nestedObjectLiteral",
                nestedProperties: {
                  value: { dataType: "string", required: true },
                  name: { dataType: "string", required: true },
                },
              },
              tagname: { dataType: "string", required: true },
            },
          },
          required: true,
        },
        view: { ref: "TestResultViewOption", required: true },
        testData: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            maxGeneration: { dataType: "double", required: true },
            useDataDriven: { dataType: "boolean", required: true },
          },
          required: true,
        },
        optimized: { dataType: "boolean", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateTestScriptDto: {
    dataType: "refAlias",
    type: { ref: "TestScriptOption", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_servername_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_servername_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PostSessionResponse: {
    dataType: "refAlias",
    type: { ref: "Session", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_post_session_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["post_session_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchSessionResponse: {
    dataType: "refAlias",
    type: { ref: "Session", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_patch_session_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["patch_session_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchSessionDto: {
    dataType: "refObject",
    properties: {
      isDone: { dataType: "boolean" },
      testItem: { dataType: "string" },
      testerName: { dataType: "string" },
      memo: { dataType: "string" },
      attachedFiles: {
        dataType: "array",
        array: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            fileData: { dataType: "string" },
            fileUrl: { dataType: "string" },
            name: { dataType: "string", required: true },
          },
        },
      },
      testResultFiles: {
        dataType: "array",
        array: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            id: { dataType: "string", required: true },
            name: { dataType: "string", required: true },
          },
        },
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_delete_session_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["delete_session_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateResponse: {
    dataType: "refObject",
    properties: {
      url: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_save_snapshot_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["save_snapshot_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  SnapshotConfig: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: { locale: { dataType: "string", required: true } },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_export_test_result_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["export_test_result_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_import_test_result_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["import_test_result_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateTestResultImportDto: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        dest: {
          dataType: "nestedObjectLiteral",
          nestedProperties: { testResultId: { dataType: "string" } },
        },
        source: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            testResultFile: {
              dataType: "nestedObjectLiteral",
              nestedProperties: {
                name: { dataType: "string", required: true },
                data: { dataType: "string", required: true },
              },
              required: true,
            },
          },
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ListTestResultResponse: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ElementInfo: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        attributes: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {},
          additionalProperties: { dataType: "string" },
          required: true,
        },
        checked: { dataType: "boolean" },
        value: { dataType: "string" },
        xpath: { dataType: "string", required: true },
        text: { dataType: "string" },
        tagname: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_TestResult.Exclude_keyofTestResult.testSteps__": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        id: { dataType: "string", required: true },
        name: { dataType: "string", required: true },
        startTimeStamp: { dataType: "double", required: true },
        lastUpdateTimeStamp: { dataType: "double", required: true },
        initialUrl: { dataType: "string", required: true },
        testingTime: { dataType: "double", required: true },
        coverageSources: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              screenElements: {
                dataType: "array",
                array: { dataType: "refAlias", ref: "ElementInfo" },
                required: true,
              },
              url: { dataType: "string", required: true },
              title: { dataType: "string", required: true },
            },
          },
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Omit_TestResult.testSteps_": {
    dataType: "refAlias",
    type: {
      ref: "Pick_TestResult.Exclude_keyofTestResult.testSteps__",
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_TestResult-at-testSteps%5B0%5D.id_": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: { id: { dataType: "string", required: true } },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_Operation.Exclude_keyofOperation.screenshot__": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        type: { dataType: "string", required: true },
        input: { dataType: "string", required: true },
        elementInfo: {
          dataType: "union",
          subSchemas: [
            { ref: "ElementInfo" },
            { dataType: "enum", enums: [null] },
          ],
          required: true,
        },
        title: { dataType: "string", required: true },
        url: { dataType: "string", required: true },
        timestamp: { dataType: "string", required: true },
        windowHandle: { dataType: "string", required: true },
        inputElements: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "ElementInfo" },
          required: true,
        },
        keywordTexts: { dataType: "array", array: { dataType: "string" } },
        isAutomatic: { dataType: "boolean", required: true },
        scrollPosition: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            y: { dataType: "double", required: true },
            x: { dataType: "double", required: true },
          },
        },
        clientSize: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            height: { dataType: "double", required: true },
            width: { dataType: "double", required: true },
          },
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Omit_Operation.screenshot_": {
    dataType: "refAlias",
    type: {
      ref: "Pick_Operation.Exclude_keyofOperation.screenshot__",
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  TestStepOperation: {
    dataType: "refAlias",
    type: {
      dataType: "intersection",
      subSchemas: [
        { ref: "Omit_Operation.screenshot_" },
        {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            imageFileUrl: { dataType: "string", required: true },
          },
        },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetTestResultResponse: {
    dataType: "refAlias",
    type: {
      dataType: "intersection",
      subSchemas: [
        { ref: "Omit_TestResult.testSteps_" },
        {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            testSteps: {
              dataType: "array",
              array: {
                dataType: "intersection",
                subSchemas: [
                  { ref: "Pick_TestResult-at-testSteps%5B0%5D.id_" },
                  {
                    dataType: "nestedObjectLiteral",
                    nestedProperties: {
                      notices: {
                        dataType: "array",
                        array: { dataType: "refAlias", ref: "GetNoteResponse" },
                        required: true,
                      },
                      bugs: {
                        dataType: "array",
                        array: { dataType: "refAlias", ref: "GetNoteResponse" },
                        required: true,
                      },
                      intention: {
                        dataType: "union",
                        subSchemas: [
                          { ref: "GetNoteResponse" },
                          { dataType: "enum", enums: [null] },
                        ],
                        required: true,
                      },
                      operation: { ref: "TestStepOperation", required: true },
                    },
                  },
                ],
              },
              required: true,
            },
          },
        },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_test_result_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_test_result_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateTestResultResponse: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_save_test_result_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["save_test_result_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateTestResultDto: {
    dataType: "refObject",
    properties: {
      initialUrl: { dataType: "string" },
      name: { dataType: "string" },
      startTimeStamp: { dataType: "double" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchTestResultResponse: {
    dataType: "refAlias",
    type: { ref: "GetTestResultResponse", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_update_test_result_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["update_test_result_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_delete_test_result_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["delete_test_result_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ListSessionResponse: {
    dataType: "refAlias",
    type: { dataType: "array", array: { dataType: "string" }, validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  SequenceViewNode: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        disabled: { dataType: "boolean" },
        testSteps: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              notes: {
                dataType: "array",
                array: {
                  dataType: "nestedObjectLiteral",
                  nestedProperties: {
                    tags: {
                      dataType: "array",
                      array: { dataType: "string" },
                      required: true,
                    },
                    details: { dataType: "string" },
                    value: { dataType: "string", required: true },
                    id: { dataType: "string", required: true },
                  },
                },
              },
              element: {
                dataType: "nestedObjectLiteral",
                nestedProperties: {
                  text: { dataType: "string", required: true },
                  tagname: { dataType: "string", required: true },
                  xpath: { dataType: "string", required: true },
                },
              },
              input: { dataType: "string" },
              type: { dataType: "string", required: true },
              id: { dataType: "string", required: true },
            },
          },
          required: true,
        },
        screenId: { dataType: "string", required: true },
        windowId: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  SequenceView: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        scenarios: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              nodes: {
                dataType: "array",
                array: { dataType: "refAlias", ref: "SequenceViewNode" },
                required: true,
              },
              testPurpose: {
                dataType: "nestedObjectLiteral",
                nestedProperties: {
                  details: { dataType: "string" },
                  value: { dataType: "string", required: true },
                  id: { dataType: "string", required: true },
                },
              },
            },
          },
          required: true,
        },
        screens: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              name: { dataType: "string", required: true },
              id: { dataType: "string", required: true },
            },
          },
          required: true,
        },
        windows: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              name: { dataType: "string", required: true },
              id: { dataType: "string", required: true },
            },
          },
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetSequenceViewResponse: {
    dataType: "refAlias",
    type: { ref: "SequenceView", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_generate_sequence_view_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["generate_sequence_view_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetSequenceViewDto: {
    dataType: "refAlias",
    type: { ref: "TestResultViewOption", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  "Pick_TestStep.id-or-operation_": {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        id: { dataType: "string", required: true },
        operation: { ref: "TestStepOperation", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CoverageSource: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        screenElements: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "ElementInfo" },
          required: true,
        },
        url: { dataType: "string", required: true },
        title: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateTestStepResponse: {
    dataType: "refAlias",
    type: {
      dataType: "intersection",
      subSchemas: [
        { ref: "Pick_TestStep.id-or-operation_" },
        {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            coverageSource: { ref: "CoverageSource", required: true },
          },
        },
      ],
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_add_test_step_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["add_test_step_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateTestStepDto: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        isAutomatic: { dataType: "boolean" },
        pageSource: { dataType: "string", required: true },
        timestamp: { dataType: "double", required: true },
        keywordTexts: { dataType: "array", array: { dataType: "string" } },
        inputElements: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "ElementInfo" },
          required: true,
        },
        screenElements: {
          dataType: "array",
          array: { dataType: "refAlias", ref: "ElementInfo" },
          required: true,
        },
        windowHandle: { dataType: "string", required: true },
        imageData: { dataType: "string", required: true },
        url: { dataType: "string", required: true },
        title: { dataType: "string", required: true },
        elementInfo: {
          dataType: "union",
          subSchemas: [
            { ref: "ElementInfo" },
            { dataType: "enum", enums: [null] },
          ],
          required: true,
        },
        type: { dataType: "string", required: true },
        input: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  TestStep: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        notices: {
          dataType: "array",
          array: { dataType: "string" },
          required: true,
        },
        bugs: {
          dataType: "array",
          array: { dataType: "string" },
          required: true,
        },
        intention: {
          dataType: "union",
          subSchemas: [
            { dataType: "string" },
            { dataType: "enum", enums: [null] },
          ],
          required: true,
        },
        operation: { ref: "TestStepOperation", required: true },
        id: { dataType: "string", required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetTestStepResponse: {
    dataType: "refAlias",
    type: { ref: "TestStep", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_test_step_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_test_step_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchTestStepResponse: {
    dataType: "refAlias",
    type: { ref: "TestStep", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_edit_test_step_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["edit_test_step_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchTestStepDto: {
    dataType: "refObject",
    properties: {
      intention: {
        dataType: "union",
        subSchemas: [
          { dataType: "string" },
          { dataType: "enum", enums: [null] },
        ],
      },
      bugs: { dataType: "array", array: { dataType: "string" } },
      notices: { dataType: "array", array: { dataType: "string" } },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_screenshots_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_screenshots_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ViewPoint: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
      index: { dataType: "double" },
      description: { dataType: "string", required: true },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  TestMatrix: {
    dataType: "refObject",
    properties: {
      id: { dataType: "string", required: true },
      name: { dataType: "string", required: true },
      index: { dataType: "double", required: true },
      groups: {
        dataType: "array",
        array: { dataType: "refObject", ref: "TestTargetGroup" },
        required: true,
      },
      viewPoints: {
        dataType: "array",
        array: { dataType: "refObject", ref: "ViewPoint" },
        required: true,
      },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetTestMatrixResponse: {
    dataType: "refAlias",
    type: { ref: "TestMatrix", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_test_matrix_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_test_matrix_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PostTestMatrixResponse: {
    dataType: "refAlias",
    type: { ref: "TestMatrix", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchTestMatrixResponse: {
    dataType: "refAlias",
    type: { ref: "TestMatrix", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_delete_test_matrix_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["delete_test_matrix_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetTestTargetGroupResponse: {
    dataType: "refAlias",
    type: { ref: "TestTargetGroup", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_test_target_group_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_test_target_group_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PostTestTargetGroupResponse: {
    dataType: "refAlias",
    type: { ref: "TestTargetGroup", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_post_test_target_group_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["post_test_target_group_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchTestTargetGroupResponse: {
    dataType: "refAlias",
    type: { ref: "TestTargetGroup", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_patch_test_target_group_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["patch_test_target_group_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_delete_test_target_group_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["delete_test_target_group_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetTestTargetResponse: {
    dataType: "refAlias",
    type: { ref: "TestTarget", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_test_target_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_test_target_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PostTestTargetResponse: {
    dataType: "refAlias",
    type: { ref: "TestTarget", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_post_test_target_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["post_test_target_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchTestTargetResponse: {
    dataType: "refAlias",
    type: { ref: "TestTarget", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_patch_test_target_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["patch_test_target_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_delete_test_target_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["delete_test_target_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetViewPointResponse: {
    dataType: "refAlias",
    type: { ref: "ViewPoint", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_view_point_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["get_view_point_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PostViewPointResponse: {
    dataType: "refAlias",
    type: { ref: "ViewPoint", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_post_view_point_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["post_view_point_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchViewPointResponse: {
    dataType: "refAlias",
    type: { ref: "ViewPoint", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_patch_view_point_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["patch_view_point_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_delete_view_point_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["delete_view_point_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchStoryResponse: {
    dataType: "refAlias",
    type: { ref: "Story", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_patch_story_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["patch_story_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  PatchStoryDto: {
    dataType: "refObject",
    properties: {
      status: { dataType: "string" },
    },
    additionalProperties: false,
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  GetStoryResponse: {
    dataType: "refAlias",
    type: { ref: "Story", validators: {} },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_get_story_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: { dataType: "enum", enums: ["get_story_failed"], required: true },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_import_test_result_not_exist_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["import_test_result_not_exist"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_import_project_not_exist_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["import_project_not_exist"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  ServerErrorData_import_project_failed_: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        details: {
          dataType: "array",
          array: {
            dataType: "nestedObjectLiteral",
            nestedProperties: {
              target: { dataType: "string", required: true },
              message: { dataType: "string", required: true },
              code: { dataType: "string", required: true },
            },
          },
        },
        message: { dataType: "string" },
        code: {
          dataType: "enum",
          enums: ["import_project_failed"],
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  CreateProjectImportDto: {
    dataType: "refAlias",
    type: {
      dataType: "nestedObjectLiteral",
      nestedProperties: {
        includeProject: { dataType: "boolean", required: true },
        includeTestResults: { dataType: "boolean", required: true },
        source: {
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            projectFile: {
              dataType: "nestedObjectLiteral",
              nestedProperties: {
                name: { dataType: "string", required: true },
                data: { dataType: "string", required: true },
              },
              required: true,
            },
          },
          required: true,
        },
      },
      validators: {},
    },
  },
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const validationService = new ValidationService(models);

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

export function RegisterRoutes(app: Router) {
  // ###########################################################################################################
  //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
  //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
  // ###########################################################################################################
  app.post(
    "/api/v1/test-results/:testResultId/test-steps/:testStepId/compressed-image",
    ...fetchMiddlewares<RequestHandler>(CompressedImageController),
    ...fetchMiddlewares<RequestHandler>(
      CompressedImageController.prototype.compressTestStepScreenshot
    ),

    function CompressedImageController_compressTestStepScreenshot(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        testStepId: {
          in: "path",
          name: "testStepId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new CompressedImageController();

        const promise = controller.compressTestStepScreenshot.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/projects/:projectId/configs/export",
    ...fetchMiddlewares<RequestHandler>(ConfigExportController),
    ...fetchMiddlewares<RequestHandler>(
      ConfigExportController.prototype.exportProjectSettings
    ),

    function ConfigExportController_exportProjectSettings(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ConfigExportController();

        const promise = controller.exportProjectSettings.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/projects/:projectId/configs",
    ...fetchMiddlewares<RequestHandler>(ConfigsController),
    ...fetchMiddlewares<RequestHandler>(
      ConfigsController.prototype.getProjectSettings
    ),

    function ConfigsController_getProjectSettings(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ConfigsController();

        const promise = controller.getProjectSettings.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/api/v1/projects/:projectId/configs",
    ...fetchMiddlewares<RequestHandler>(ConfigsController),
    ...fetchMiddlewares<RequestHandler>(
      ConfigsController.prototype.updateProjectSettings
    ),

    function ConfigsController_updateProjectSettings(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "PutConfigDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ConfigsController();

        const promise = controller.updateProjectSettings.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-results/:testResultId/notes/:noteId/compressed-image",
    ...fetchMiddlewares<RequestHandler>(NoteCompressedImageController),
    ...fetchMiddlewares<RequestHandler>(
      NoteCompressedImageController.prototype.compressNoteScreenshot
    ),

    function NoteCompressedImageController_compressNoteScreenshot(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        noteId: {
          in: "path",
          name: "noteId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new NoteCompressedImageController();

        const promise = controller.compressNoteScreenshot.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-results/:testResultId/notes",
    ...fetchMiddlewares<RequestHandler>(NotesController),
    ...fetchMiddlewares<RequestHandler>(NotesController.prototype.addNote),

    function NotesController_addNote(request: any, response: any, next: any) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "CreateNoteDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new NotesController();

        const promise = controller.addNote.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/test-results/:testResultId/notes/:noteId",
    ...fetchMiddlewares<RequestHandler>(NotesController),
    ...fetchMiddlewares<RequestHandler>(NotesController.prototype.getNote),

    function NotesController_getNote(request: any, response: any, next: any) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        noteId: {
          in: "path",
          name: "noteId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new NotesController();

        const promise = controller.getNote.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.put(
    "/api/v1/test-results/:testResultId/notes/:noteId",
    ...fetchMiddlewares<RequestHandler>(NotesController),
    ...fetchMiddlewares<RequestHandler>(NotesController.prototype.updateNote),

    function NotesController_updateNote(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        noteId: {
          in: "path",
          name: "noteId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "UpdateNoteDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new NotesController();

        const promise = controller.updateNote.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/api/v1/test-results/:testResultId/notes/:noteId",
    ...fetchMiddlewares<RequestHandler>(NotesController),
    ...fetchMiddlewares<RequestHandler>(NotesController.prototype.deleteNote),

    function NotesController_deleteNote(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        noteId: {
          in: "path",
          name: "noteId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new NotesController();

        const promise = controller.deleteNote.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 204, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/projects/:projectId/export",
    ...fetchMiddlewares<RequestHandler>(ProjectExportController),
    ...fetchMiddlewares<RequestHandler>(
      ProjectExportController.prototype.exportProject
    ),

    function ProjectExportController_exportProject(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "CreateProjectExportDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ProjectExportController();

        const promise = controller.exportProject.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/projects",
    ...fetchMiddlewares<RequestHandler>(ProjectsController),
    ...fetchMiddlewares<RequestHandler>(
      ProjectsController.prototype.getProjectIdentifiers
    ),

    function ProjectsController_getProjectIdentifiers(
      request: any,
      response: any,
      next: any
    ) {
      const args = {};

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ProjectsController();

        const promise = controller.getProjectIdentifiers.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/projects",
    ...fetchMiddlewares<RequestHandler>(ProjectsController),
    ...fetchMiddlewares<RequestHandler>(
      ProjectsController.prototype.createProject
    ),

    function ProjectsController_createProject(
      request: any,
      response: any,
      next: any
    ) {
      const args = {};

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ProjectsController();

        const promise = controller.createProject.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/projects/:projectId",
    ...fetchMiddlewares<RequestHandler>(ProjectsController),
    ...fetchMiddlewares<RequestHandler>(
      ProjectsController.prototype.getProject
    ),

    function ProjectsController_getProject(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ProjectsController();

        const promise = controller.getProject.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/projects/:projectId/progress",
    ...fetchMiddlewares<RequestHandler>(ProjectsController),
    ...fetchMiddlewares<RequestHandler>(
      ProjectsController.prototype.getTestProgress
    ),

    function ProjectsController_getTestProgress(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        since: { in: "query", name: "since", dataType: "double" },
        until: { in: "query", name: "until", dataType: "double" },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ProjectsController();

        const promise = controller.getTestProgress.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/projects/:projectId/test-scripts",
    ...fetchMiddlewares<RequestHandler>(ProjectTestScriptsController),
    ...fetchMiddlewares<RequestHandler>(
      ProjectTestScriptsController.prototype.generateProjectTestScript
    ),

    function ProjectTestScriptsController_generateProjectTestScript(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "CreateTestScriptDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ProjectTestScriptsController();

        const promise = controller.generateProjectTestScript.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/server-name",
    ...fetchMiddlewares<RequestHandler>(ServerNameController),
    ...fetchMiddlewares<RequestHandler>(
      ServerNameController.prototype.getServerName
    ),

    function ServerNameController_getServerName(
      request: any,
      response: any,
      next: any
    ) {
      const args = {};

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ServerNameController();

        const promise = controller.getServerName.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/projects/:projectId/sessions",
    ...fetchMiddlewares<RequestHandler>(SessionsController),
    ...fetchMiddlewares<RequestHandler>(
      SessionsController.prototype.createSession
    ),

    function SessionsController_createSession(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: { storyId: { dataType: "string", required: true } },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new SessionsController();

        const promise = controller.createSession.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.patch(
    "/api/v1/projects/:projectId/sessions/:sessionId",
    ...fetchMiddlewares<RequestHandler>(SessionsController),
    ...fetchMiddlewares<RequestHandler>(
      SessionsController.prototype.updateSession
    ),

    function SessionsController_updateSession(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        sessionId: {
          in: "path",
          name: "sessionId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "PatchSessionDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new SessionsController();

        const promise = controller.updateSession.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/api/v1/projects/:projectId/sessions/:sessionId",
    ...fetchMiddlewares<RequestHandler>(SessionsController),
    ...fetchMiddlewares<RequestHandler>(
      SessionsController.prototype.deleteSession
    ),

    function SessionsController_deleteSession(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        sessionId: {
          in: "path",
          name: "sessionId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new SessionsController();

        const promise = controller.deleteSession.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 204, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/projects/:projectId/snapshots",
    ...fetchMiddlewares<RequestHandler>(SnapshotsController),
    ...fetchMiddlewares<RequestHandler>(
      SnapshotsController.prototype.outputProjectSnapshot
    ),

    function SnapshotsController_outputProjectSnapshot(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        snapshotConfig: {
          in: "body",
          name: "snapshotConfig",
          required: true,
          ref: "SnapshotConfig",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new SnapshotsController();

        const promise = controller.outputProjectSnapshot.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-results/:testResultId/export",
    ...fetchMiddlewares<RequestHandler>(TestResultExportController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultExportController.prototype.exportTestResult
    ),

    function TestResultExportController_exportTestResult(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultExportController();

        const promise = controller.exportTestResult.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/imports/test-results",
    ...fetchMiddlewares<RequestHandler>(TestResultImportController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultImportController.prototype.importTestResult
    ),

    function TestResultImportController_importTestResult(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "CreateTestResultImportDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultImportController();

        const promise = controller.importTestResult.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/test-results",
    ...fetchMiddlewares<RequestHandler>(TestResultsController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultsController.prototype.getTestResultIdentifiers
    ),

    function TestResultsController_getTestResultIdentifiers(
      request: any,
      response: any,
      next: any
    ) {
      const args = {};

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultsController();

        const promise = controller.getTestResultIdentifiers.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/test-results/:testResultId",
    ...fetchMiddlewares<RequestHandler>(TestResultsController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultsController.prototype.getTestResult
    ),

    function TestResultsController_getTestResult(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultsController();

        const promise = controller.getTestResult.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-results",
    ...fetchMiddlewares<RequestHandler>(TestResultsController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultsController.prototype.createTestResult
    ),

    function TestResultsController_createTestResult(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "CreateTestResultDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultsController();

        const promise = controller.createTestResult.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.patch(
    "/api/v1/test-results/:testResultId",
    ...fetchMiddlewares<RequestHandler>(TestResultsController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultsController.prototype.updateTestResult
    ),

    function TestResultsController_updateTestResult(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            initialUrl: { dataType: "string" },
            startTime: { dataType: "double" },
            name: { dataType: "string" },
          },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultsController();

        const promise = controller.updateTestResult.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/api/v1/test-results/:testResultId",
    ...fetchMiddlewares<RequestHandler>(TestResultsController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultsController.prototype.deleteTestResult
    ),

    function TestResultsController_deleteTestResult(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultsController();

        const promise = controller.deleteTestResult.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 204, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/test-results/:testResultId/sessions",
    ...fetchMiddlewares<RequestHandler>(TestResultsController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultsController.prototype.getSessionIds
    ),

    function TestResultsController_getSessionIds(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultsController();

        const promise = controller.getSessionIds.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-results/:testResultId/sequence-views",
    ...fetchMiddlewares<RequestHandler>(TestResultsController),
    ...fetchMiddlewares<RequestHandler>(
      TestResultsController.prototype.generateSequenceView
    ),

    function TestResultsController_generateSequenceView(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          ref: "GetSequenceViewDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestResultsController();

        const promise = controller.generateSequenceView.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-results/:testResultId/test-scripts",
    ...fetchMiddlewares<RequestHandler>(TestScriptsController),
    ...fetchMiddlewares<RequestHandler>(
      TestScriptsController.prototype.generateTestResultTestScript
    ),

    function TestScriptsController_generateTestResultTestScript(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "CreateTestScriptDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestScriptsController();

        const promise = controller.generateTestResultTestScript.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-results/:testResultId/test-steps",
    ...fetchMiddlewares<RequestHandler>(TestStepsController),
    ...fetchMiddlewares<RequestHandler>(
      TestStepsController.prototype.addTestStep
    ),

    function TestStepsController_addTestStep(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "CreateTestStepDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestStepsController();

        const promise = controller.addTestStep.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/test-results/:testResultId/test-steps/:testStepId",
    ...fetchMiddlewares<RequestHandler>(TestStepsController),
    ...fetchMiddlewares<RequestHandler>(
      TestStepsController.prototype.getTestStep
    ),

    function TestStepsController_getTestStep(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        testStepId: {
          in: "path",
          name: "testStepId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestStepsController();

        const promise = controller.getTestStep.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.patch(
    "/api/v1/test-results/:testResultId/test-steps/:testStepId",
    ...fetchMiddlewares<RequestHandler>(TestStepsController),
    ...fetchMiddlewares<RequestHandler>(
      TestStepsController.prototype.updateTestStepNotes
    ),

    function TestStepsController_updateTestStepNotes(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
        testStepId: {
          in: "path",
          name: "testStepId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "PatchTestStepDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestStepsController();

        const promise = controller.updateTestStepNotes.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/test-results/:testResultId/screenshots",
    ...fetchMiddlewares<RequestHandler>(ScreenshotsController),
    ...fetchMiddlewares<RequestHandler>(
      ScreenshotsController.prototype.outputTestResultScreenshots
    ),

    function ScreenshotsController_outputTestResultScreenshots(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testResultId: {
          in: "path",
          name: "testResultId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ScreenshotsController();

        const promise = controller.outputTestResultScreenshots.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/test-matrices/:testMatrixId",
    ...fetchMiddlewares<RequestHandler>(TestMatricesController),
    ...fetchMiddlewares<RequestHandler>(
      TestMatricesController.prototype.getTestMatrix
    ),

    function TestMatricesController_getTestMatrix(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testMatrixId: {
          in: "path",
          name: "testMatrixId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestMatricesController();

        const promise = controller.getTestMatrix.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-matrices",
    ...fetchMiddlewares<RequestHandler>(TestMatricesController),
    ...fetchMiddlewares<RequestHandler>(
      TestMatricesController.prototype.createTestMatrix
    ),

    function TestMatricesController_createTestMatrix(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            name: { dataType: "string", required: true },
            projectId: { dataType: "string", required: true },
          },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestMatricesController();

        const promise = controller.createTestMatrix.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.patch(
    "/api/v1/test-matrices/:testMatrixId",
    ...fetchMiddlewares<RequestHandler>(TestMatricesController),
    ...fetchMiddlewares<RequestHandler>(
      TestMatricesController.prototype.updateTestMatrix
    ),

    function TestMatricesController_updateTestMatrix(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testMatrixId: {
          in: "path",
          name: "testMatrixId",
          required: true,
          dataType: "string",
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: { name: { dataType: "string", required: true } },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestMatricesController();

        const promise = controller.updateTestMatrix.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/api/v1/test-matrices/:testMatrixId",
    ...fetchMiddlewares<RequestHandler>(TestMatricesController),
    ...fetchMiddlewares<RequestHandler>(
      TestMatricesController.prototype.deleteTestMatrix
    ),

    function TestMatricesController_deleteTestMatrix(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testMatrixId: {
          in: "path",
          name: "testMatrixId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestMatricesController();

        const promise = controller.deleteTestMatrix.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 204, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/test-target-groups/:testTargetGroupId",
    ...fetchMiddlewares<RequestHandler>(TestTargetGroupsController),
    ...fetchMiddlewares<RequestHandler>(
      TestTargetGroupsController.prototype.getTestTargetGroup
    ),

    function TestTargetGroupsController_getTestTargetGroup(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testTargetGroupId: {
          in: "path",
          name: "testTargetGroupId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestTargetGroupsController();

        const promise = controller.getTestTargetGroup.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/test-target-groups",
    ...fetchMiddlewares<RequestHandler>(TestTargetGroupsController),
    ...fetchMiddlewares<RequestHandler>(
      TestTargetGroupsController.prototype.createTestTargetGroup
    ),

    function TestTargetGroupsController_createTestTargetGroup(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            name: { dataType: "string", required: true },
            testMatrixId: { dataType: "string", required: true },
          },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestTargetGroupsController();

        const promise = controller.createTestTargetGroup.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.patch(
    "/api/v1/test-target-groups/:testTargetGroupId",
    ...fetchMiddlewares<RequestHandler>(TestTargetGroupsController),
    ...fetchMiddlewares<RequestHandler>(
      TestTargetGroupsController.prototype.updateTestTargetGroup
    ),

    function TestTargetGroupsController_updateTestTargetGroup(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testTargetGroupId: {
          in: "path",
          name: "testTargetGroupId",
          required: true,
          dataType: "string",
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: { name: { dataType: "string", required: true } },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestTargetGroupsController();

        const promise = controller.updateTestTargetGroup.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/api/v1/test-target-groups/:testTargetGroupId",
    ...fetchMiddlewares<RequestHandler>(TestTargetGroupsController),
    ...fetchMiddlewares<RequestHandler>(
      TestTargetGroupsController.prototype.deleteTestTargetGroup
    ),

    function TestTargetGroupsController_deleteTestTargetGroup(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        testTargetGroupId: {
          in: "path",
          name: "testTargetGroupId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestTargetGroupsController();

        const promise = controller.deleteTestTargetGroup.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 204, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/projects/:projectId/test-targets/:testTargetId",
    ...fetchMiddlewares<RequestHandler>(TestTargetsController),
    ...fetchMiddlewares<RequestHandler>(
      TestTargetsController.prototype.getTestTarget
    ),

    function TestTargetsController_getTestTarget(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        testTargetId: {
          in: "path",
          name: "testTargetId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestTargetsController();

        const promise = controller.getTestTarget.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/projects/:projectId/test-targets",
    ...fetchMiddlewares<RequestHandler>(TestTargetsController),
    ...fetchMiddlewares<RequestHandler>(
      TestTargetsController.prototype.createTestTarget
    ),

    function TestTargetsController_createTestTarget(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            name: { dataType: "string", required: true },
            testTargetGroupId: { dataType: "string", required: true },
          },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestTargetsController();

        const promise = controller.createTestTarget.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.patch(
    "/api/v1/projects/:projectId/test-targets/:testTargetId",
    ...fetchMiddlewares<RequestHandler>(TestTargetsController),
    ...fetchMiddlewares<RequestHandler>(
      TestTargetsController.prototype.updateTestTarget
    ),

    function TestTargetsController_updateTestTarget(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        testTargetId: {
          in: "path",
          name: "testTargetId",
          required: true,
          dataType: "string",
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            plans: {
              dataType: "array",
              array: {
                dataType: "nestedObjectLiteral",
                nestedProperties: {
                  value: { dataType: "double", required: true },
                  viewPointId: { dataType: "string", required: true },
                },
              },
            },
            index: { dataType: "double" },
            name: { dataType: "string" },
          },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestTargetsController();

        const promise = controller.updateTestTarget.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/api/v1/projects/:projectId/test-targets/:testTargetId",
    ...fetchMiddlewares<RequestHandler>(TestTargetsController),
    ...fetchMiddlewares<RequestHandler>(
      TestTargetsController.prototype.deleteTestTarget
    ),

    function TestTargetsController_deleteTestTarget(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        projectId: {
          in: "path",
          name: "projectId",
          required: true,
          dataType: "string",
        },
        testTargetId: {
          in: "path",
          name: "testTargetId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new TestTargetsController();

        const promise = controller.deleteTestTarget.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 204, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/view-points/:viewPointId",
    ...fetchMiddlewares<RequestHandler>(ViewPointsController),
    ...fetchMiddlewares<RequestHandler>(
      ViewPointsController.prototype.getTestViewPoint
    ),

    function ViewPointsController_getTestViewPoint(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        viewPointId: {
          in: "path",
          name: "viewPointId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ViewPointsController();

        const promise = controller.getTestViewPoint.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/view-points",
    ...fetchMiddlewares<RequestHandler>(ViewPointsController),
    ...fetchMiddlewares<RequestHandler>(
      ViewPointsController.prototype.addViewPoint
    ),

    function ViewPointsController_addViewPoint(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            description: { dataType: "string", required: true },
            index: { dataType: "double", required: true },
            name: { dataType: "string", required: true },
            testMatrixId: { dataType: "string", required: true },
          },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ViewPointsController();

        const promise = controller.addViewPoint.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.patch(
    "/api/v1/view-points/:viewPointId",
    ...fetchMiddlewares<RequestHandler>(ViewPointsController),
    ...fetchMiddlewares<RequestHandler>(
      ViewPointsController.prototype.updateViewPoint
    ),

    function ViewPointsController_updateViewPoint(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        viewPointId: {
          in: "path",
          name: "viewPointId",
          required: true,
          dataType: "string",
        },
        body: {
          in: "body",
          name: "body",
          required: true,
          dataType: "nestedObjectLiteral",
          nestedProperties: {
            index: { dataType: "double" },
            description: { dataType: "string" },
            name: { dataType: "string" },
          },
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ViewPointsController();

        const promise = controller.updateViewPoint.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.delete(
    "/api/v1/view-points/:viewPointId",
    ...fetchMiddlewares<RequestHandler>(ViewPointsController),
    ...fetchMiddlewares<RequestHandler>(
      ViewPointsController.prototype.deleteViewPoint
    ),

    function ViewPointsController_deleteViewPoint(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        viewPointId: {
          in: "path",
          name: "viewPointId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ViewPointsController();

        const promise = controller.deleteViewPoint.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 204, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.patch(
    "/api/v1/stories/:storyId",
    ...fetchMiddlewares<RequestHandler>(StoriesController),
    ...fetchMiddlewares<RequestHandler>(
      StoriesController.prototype.updateStory
    ),

    function StoriesController_updateStory(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        storyId: {
          in: "path",
          name: "storyId",
          required: true,
          dataType: "string",
        },
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "PatchStoryDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new StoriesController();

        const promise = controller.updateStory.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.get(
    "/api/v1/stories/:storyId",
    ...fetchMiddlewares<RequestHandler>(StoriesController),
    ...fetchMiddlewares<RequestHandler>(StoriesController.prototype.getStory),

    function StoriesController_getStory(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        storyId: {
          in: "path",
          name: "storyId",
          required: true,
          dataType: "string",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new StoriesController();

        const promise = controller.getStory.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
  app.post(
    "/api/v1/imports/projects",
    ...fetchMiddlewares<RequestHandler>(ProjectImportController),
    ...fetchMiddlewares<RequestHandler>(
      ProjectImportController.prototype.importProject
    ),

    function ProjectImportController_importProject(
      request: any,
      response: any,
      next: any
    ) {
      const args = {
        requestBody: {
          in: "body",
          name: "requestBody",
          required: true,
          ref: "CreateProjectImportDto",
        },
      };

      // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

      let validatedArgs: any[] = [];
      try {
        validatedArgs = getValidatedArgs(args, request, response);

        const controller = new ProjectImportController();

        const promise = controller.importProject.apply(
          controller,
          validatedArgs as any
        );
        promiseHandler(controller, promise, response, 200, next);
      } catch (err) {
        return next(err);
      }
    }
  );
  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function isController(object: any): object is Controller {
    return (
      "getHeaders" in object && "getStatus" in object && "setStatus" in object
    );
  }

  function promiseHandler(
    controllerObj: any,
    promise: any,
    response: any,
    successStatus: any,
    next: any
  ) {
    return Promise.resolve(promise)
      .then((data: any) => {
        let statusCode = successStatus;
        let headers;
        if (isController(controllerObj)) {
          headers = controllerObj.getHeaders();
          statusCode = controllerObj.getStatus() || statusCode;
        }

        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

        returnHandler(response, statusCode, data, headers);
      })
      .catch((error: any) => next(error));
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function returnHandler(
    response: any,
    statusCode?: number,
    data?: any,
    headers: any = {}
  ) {
    if (response.headersSent) {
      return;
    }
    Object.keys(headers).forEach((name: string) => {
      response.set(name, headers[name]);
    });
    if (
      data &&
      typeof data.pipe === "function" &&
      data.readable &&
      typeof data._read === "function"
    ) {
      response.status(statusCode || 200);
      data.pipe(response);
    } else if (data !== null && data !== undefined) {
      response.status(statusCode || 200).json(data);
    } else {
      response.status(statusCode || 204).end();
    }
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function responder(
    response: any
  ): TsoaResponse<HttpStatusCodeLiteral, unknown> {
    return function (status, data, headers) {
      returnHandler(response, status, data, headers);
    };
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

  function getValidatedArgs(args: any, request: any, response: any): any[] {
    const fieldErrors: FieldErrors = {};
    const values = Object.keys(args).map((key) => {
      const name = args[key].name;
      switch (args[key].in) {
        case "request":
          return request;
        case "query":
          return validationService.ValidateParam(
            args[key],
            request.query[name],
            name,
            fieldErrors,
            undefined,
            { noImplicitAdditionalProperties: "throw-on-extras" }
          );
        case "queries":
          return validationService.ValidateParam(
            args[key],
            request.query,
            name,
            fieldErrors,
            undefined,
            { noImplicitAdditionalProperties: "throw-on-extras" }
          );
        case "path":
          return validationService.ValidateParam(
            args[key],
            request.params[name],
            name,
            fieldErrors,
            undefined,
            { noImplicitAdditionalProperties: "throw-on-extras" }
          );
        case "header":
          return validationService.ValidateParam(
            args[key],
            request.header(name),
            name,
            fieldErrors,
            undefined,
            { noImplicitAdditionalProperties: "throw-on-extras" }
          );
        case "body":
          return validationService.ValidateParam(
            args[key],
            request.body,
            name,
            fieldErrors,
            undefined,
            { noImplicitAdditionalProperties: "throw-on-extras" }
          );
        case "body-prop":
          return validationService.ValidateParam(
            args[key],
            request.body[name],
            name,
            fieldErrors,
            "body.",
            { noImplicitAdditionalProperties: "throw-on-extras" }
          );
        case "formData":
          if (args[key].dataType === "file") {
            return validationService.ValidateParam(
              args[key],
              request.file,
              name,
              fieldErrors,
              undefined,
              { noImplicitAdditionalProperties: "throw-on-extras" }
            );
          } else if (
            args[key].dataType === "array" &&
            args[key].array.dataType === "file"
          ) {
            return validationService.ValidateParam(
              args[key],
              request.files,
              name,
              fieldErrors,
              undefined,
              { noImplicitAdditionalProperties: "throw-on-extras" }
            );
          } else {
            return validationService.ValidateParam(
              args[key],
              request.body[name],
              name,
              fieldErrors,
              undefined,
              { noImplicitAdditionalProperties: "throw-on-extras" }
            );
          }
        case "res":
          return responder(response);
      }
    });

    if (Object.keys(fieldErrors).length > 0) {
      throw new ValidateError(fieldErrors, "");
    }
    return values;
  }

  // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
