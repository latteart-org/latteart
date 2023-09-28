# latteart-capture-cl WebSocket API

## client -> server

### `start_capture`

Start capturing operations.

- arguments
  - url
    - type: string
  - config
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "platformName": {
            "type": "string" // "PC" or "Android" or "iOS"
          },
          "browserName": {
            "type": "string" // "Chrome" or "Safari" or "Edge"
          },
          "device": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "name": {
                "type": "string"
              },
              "osVersion": {
                "type": "string"
              }
            }
          },
          "platformVersion": {
            "type": "string"
          },
          "waitTimeForStartupReload": {
            "type": "number" // seconds
          },
          "isHeadlessMode": {
            "type": "boolean"
          },
          "captureArch": {
            "type": "string" // "polling" or "push"
          }
        }
      }
      ```

### `stop_capture`

Stop capturing operations.

### `take_screenshot`

Take a screenshot of the capturing window.

### `browser_back`

Go back to previous page on capturing browser.

### `browser_forward`

Go forward to next page on capturing browser.

### `switch_capturing_window`

Switch capturing window.

- arguments
  - destWindowHandle
    - type: string

### `pause_capture`

Pause capturing operations.

### `resume_capture`

Resume capturing operations.

### `run_operation`

Run operation.

- arguments
  - operation
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "input": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "scrollPosition": {
            "type": "object",
            "properties": {
              "x": {
                "type": "number"
              },
              "y": {
                "type": "number"
              }
            }
          },
          "clientSize": {
            "type": "object",
            "properties": {
              "width": {
                "type": "number"
              },
              "height": {
                "type": "number"
              }
            }
          },
          "elementInfo": {
            "type": "object",
            "properties": {
              "tagname": {
                "type": "string"
              },
              "text": {
                "type": "string"
              },
              "value": {
                "type": "string"
              },
              "xpath": {
                "type": "string"
              },
              "checked": {
                "type": "boolean"
              },
              "attributes": {
                "type": "object",
                "patternProperties": {
                  ".+$": {
                    "type": "string"
                  }
                }
              },
              "boundingRect": {
                "type": "object",
                "properties": {
                  "top": {
                    "type": "number"
                  },
                  "left": {
                    "type": "number"
                  },
                  "width": {
                    "type": "number"
                  },
                  "height": {
                    "type": "number"
                  }
                }
              },
              "innerHeight": {
                "type": "number"
              },
              "innerWidth": {
                "type": "number"
              },
              "outerHeight": {
                "type": "number"
              },
              "outerWidth": {
                "type": "number"
              },
              "textWithoutChildren": {
                "type": "string"
              },
              "iframeIndex": {
                "type": "number"
              }
            }
          },
          "iframeIndex": {
            "type": "number"
          }
        }
      }
      ```

### `run_operation_and_screen_transition`

Execution of operations involving screen transitions.

- arguments
  - operation
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "input": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "scrollPosition": {
            "type": "object",
            "properties": {
              "x": {
                "type": "number"
              },
              "y": {
                "type": "number"
              }
            }
          },
          "clientSize": {
            "type": "object",
            "properties": {
              "width": {
                "type": "number"
              },
              "height": {
                "type": "number"
              }
            }
          },
          "elementInfo": {
            "type": "object",
            "properties": {
              "tagname": {
                "type": "string"
              },
              "text": {
                "type": "string"
              },
              "value": {
                "type": "string"
              },
              "xpath": {
                "type": "string"
              },
              "checked": {
                "type": "boolean"
              },
              "attributes": {
                "type": "object",
                "patternProperties": {
                  ".+$": {
                    "type": "string"
                  }
                }
              },
              "boundingRect": {
                "type": "object",
                "properties": {
                  "top": {
                    "type": "number"
                  },
                  "left": {
                    "type": "number"
                  },
                  "width": {
                    "type": "number"
                  },
                  "height": {
                    "type": "number"
                  }
                }
              },
              "innerHeight": {
                "type": "number"
              },
              "innerWidth": {
                "type": "number"
              },
              "outerHeight": {
                "type": "number"
              },
              "outerWidth": {
                "type": "number"
              },
              "textWithoutChildren": {
                "type": "string"
              },
              "iframeIndex": {
                "type": "number"
              }
            }
          },
          "iframeIndex": {
            "type": "number"
          }
        }
      }
      ```

### `enter_values`

Enter values for screen elements.

- arguments
  - inputValueSets
    - type: string(json)
      ```jsonc
      {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "locatorType": {
              "type": "string" // "id" or "xpath"
            },
            "locator": {
              "type": "string"
            },
            "locatorMatchType": {
              "type": "string" // "equals" or "contains"
            },
            "inputValue": {
              "type": "string"
            }
          }
        }
      }
      ```

## server -> client

### `capture_started`

Capturing has started.

- arguments
  - startTimestamp
    - type: number

### `operation_captured`

An operation has been captured.

- arguments
  - operation
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "input": {
            "type": "string"
          },
          "type": {
            "type": "string"
          },
          "scrollPosition": {
            "type": "object",
            "properties": {
              "x": {
                "type": "number"
              },
              "y": {
                "type": "number"
              }
            }
          },
          "clientSize": {
            "type": "object",
            "properties": {
              "width": {
                "type": "number"
              },
              "height": {
                "type": "number"
              }
            }
          },
          "elementInfo": {
            "type": "object",
            "properties": {
              "tagname": {
                "type": "string"
              },
              "text": {
                "type": "string"
              },
              "value": {
                "type": "string"
              },
              "xpath": {
                "type": "string"
              },
              "checked": {
                "type": "boolean"
              },
              "attributes": {
                "type": "object",
                "patternProperties": {
                  ".+$": {
                    "type": "string"
                  }
                }
              },
              "boundingRect": {
                "type": "object",
                "properties": {
                  "top": {
                    "type": "number"
                  },
                  "left": {
                    "type": "number"
                  },
                  "width": {
                    "type": "number"
                  },
                  "height": {
                    "type": "number"
                  }
                }
              },
              "innerHeight": {
                "type": "number"
              },
              "innerWidth": {
                "type": "number"
              },
              "outerHeight": {
                "type": "number"
              },
              "outerWidth": {
                "type": "number"
              },
              "textWithoutChildren": {
                "type": "string"
              },
              "iframeIndex": {
                "type": "number"
              }
            }
          },
          "title": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "imageData": {
            "type": "string" // base64
          },
          "windowHandle": {
            "type": "string"
          },
          "timestamp": {
            "type": "string"
          },
          "iframeIndex": {
            "type": "number"
          },
          "screenElements": {
            "type": "object",
            "properties": {
              "iframeIndex": {
                "type": "number"
              },
              "elements": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "tagname": {
                      "type": "string"
                    },
                    "text": {
                      "type": "string"
                    },
                    "value": {
                      "type": "string"
                    },
                    "xpath": {
                      "type": "string"
                    },
                    "checked": {
                      "type": "boolean"
                    },
                    "attributes": {
                      "type": "object",
                      "patternProperties": {
                        ".+$": {
                          "type": "string"
                        }
                      }
                    },
                    "boundingRect": {
                      "type": "object",
                      "properties": {
                        "top": {
                          "type": "number"
                        },
                        "left": {
                          "type": "number"
                        },
                        "width": {
                          "type": "number"
                        },
                        "height": {
                          "type": "number"
                        }
                      }
                    },
                    "innerHeight": {
                      "type": "number"
                    },
                    "innerWidth": {
                      "type": "number"
                    },
                    "outerHeight": {
                      "type": "number"
                    },
                    "outerWidth": {
                      "type": "number"
                    },
                    "textWithoutChildren": {
                      "type": "string"
                    },
                    "iframeIndex": {
                      "type": "number"
                    }
                  }
                }
              }
            }
          },
          "pageSource": {
            "type": "string"
          }
        }
      }
      ```

### `screen_transition_captured`

An screen transition has been captured.

- arguments
  - screenTransition
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "title": {
            "type": "string"
          },
          "url": {
            "type": "string"
          },
          "imageData": {
            "type": "string" // base64
          },
          "windowHandle": {
            "type": "string"
          },
          "timestamp": {
            "type": "string"
          },
          "pageSource": {
            "type": "string"
          },
          "scrollPosition": {
            "type": "object",
            "properties": {
              "x": {
                "type": "number"
              },
              "y": {
                "type": "number"
              }
            }
          },
          "clientSize": {
            "type": "object",
            "properties": {
              "width": {
                "type": "number"
              },
              "height": {
                "type": "number"
              }
            }
          },
          "screenElements": {
            "type": "object",
            "properties": {
              "iframeIndex": {
                "type": "number"
              },
              "elements": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "tagname": {
                      "type": "string"
                    },
                    "text": {
                      "type": "string"
                    },
                    "value": {
                      "type": "string"
                    },
                    "xpath": {
                      "type": "string"
                    },
                    "checked": {
                      "type": "boolean"
                    },
                    "attributes": {
                      "type": "object",
                      "patternProperties": {
                        ".+$": {
                          "type": "string"
                        }
                      }
                    },
                    "boundingRect": {
                      "type": "object",
                      "properties": {
                        "top": {
                          "type": "number"
                        },
                        "left": {
                          "type": "number"
                        },
                        "width": {
                          "type": "number"
                        },
                        "height": {
                          "type": "number"
                        }
                      }
                    },
                    "innerHeight": {
                      "type": "number"
                    },
                    "innerWidth": {
                      "type": "number"
                    },
                    "outerHeight": {
                      "type": "number"
                    },
                    "outerWidth": {
                      "type": "number"
                    },
                    "textWithoutChildren": {
                      "type": "string"
                    },
                    "iframeIndex": {
                      "type": "number"
                    }
                  }
                }
              }
            }
          }
        }
      }
      ```

### `screenshot_taken`

An screenshot has been taken.

- arguments
  - screenshot
    - type: string(base64)

### `browser_history_changed`

Browser history(whether it can go back/forward or not) has been changed.

- arguments
  - browserStatus
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "canGoBack": {
            "type": "boolean"
          },
          "canGoForward": {
            "type": "boolean"
          }
        }
      }
      ```

### `browser_windows_changed`

The number of opened windows has been changed.

- arguments
  - updateInformation
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "windows": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "windowHandle": {
                  "type": "string"
                },
                "url": {
                  "type": "string"
                }
              }
            }
          },
          "currentWindowHandle": {
            "type": "string"
          },
          "currentWindowHostNameChanged": {
            "type": "boolean"
          },
          "timestamp": {
            "type": "number"
          }
        }
      }
      ```

### `alert_visibility_changed`

Alert dialog(alert, confirm, prompt) visibility has been changed.

- arguments
  - alertVisibleStatus
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "isVisible": "boolean"
        }
      }
      ```

### `capture_paused`

Capturing has paused.

### `capture_resumed`

Capturing has resumed.

### `run_operation_completed`

Running operation has completed.

### `run_operation_failed`

Notification of failed operation execution.

### `enter_values_completed`

Notification that auto-filling of screen elements is complete.

### `run_operation_and_screen_transition_completed`

Notification that the screen transition associated with the operation has been completed.

### `run_operation_and_screen_transition_failed`

Notification to the effect that execution of operations involving screen transitions has failed.

### `error_occurred`

An error has occurred.

- arguments
  - serverError
    - type: string(json)
      ```jsonc
      {
        "type": "object",
        "properties": {
          "code": {
            "type": "string"
          },
          "message": {
            "type": "string"
          },
          "details": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "code": {
                  "type": "string"
                },
                "message": {
                  "type": "string"
                },
                "target": {
                  "type": "string"
                }
              }
            }
          }
        }
      }
      ```
