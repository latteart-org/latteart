# Generate test script automatically

Page objects (`page_objects`), test cases (`test.spec.js`), and test data (`test_data`) as end-to-end test scripts for smoke tests based on the operations performed in the tests are generated.
Test scripts are written in JavaScript.

It also generates a JSDoc-based test script documentation in `doc/index.html`.
Each page object and test case are explained using screen transition diagrams and screenshots, which helps you understand the generated test scripts.

## Characteristics of generated test scripts

- Uses the page object pattern for easy maintenance.
   - Page objects correspond one-to-one with screens defined in "Definition of screen transitions".
   - Extract operations performed on one screen as methods.
- Perform all screen transitions captured in the test at least once.
- Supports data-driven tests.

### :warning: restrictions

- It is not a test script that reproduces the operation performed in the test as it is.
- Uncaptured actions and screen transitions are not scripted.
- Generated test cases do not take into account the state of the application and may need modification to run.

## Generated test case example

Operations for performing each screen transition are defined in the page object as methods.
A test case consists of calling those methods.

The test case in the figure below is one of the test cases generated based on the tests performed for [Spring Petclinic](https://projects.spring.io/spring-petclinic/).
This test case has red, blue, green, and orange screen transitions, each corresponding to one method call.

![テストケース](images/test-case.png)

## Options

The following options can be set during generation.

- Use data driven method
   - If checked, a test will be generated with the data defined in `test_data/TestData.js` as the input value.
   - If unchecked, input values will be embedded in `test.spec.js`.
- Maximum number
   - Specify the maximum number of test data generated per screen. If `0` is specified, no concrete value is generated, only a skeleton is generated.

## Run test script
Test scripts can be run using [WebdriverIO](https://webdriver.io/).

Use the template below to get started right away.
https://github.com/latteart-org/test_script_runner
