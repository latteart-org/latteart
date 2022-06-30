# Contributing to LatteArt

[日本語版はこちら](contributing_ja.md)を参照して下さい。

## Issues
Use [Issues](https://github.com/latteart-org/latteart/issues) on GitHub.

### Bug report
- Use the template `Bug report`.
- Apply the label `bug` to the issue.

### Feature requests
- Use the template `Feature request`.
- Apply the label `enhancement` to the issue.

### Questions

Use [discussions](https://github.com/latteart-org/latteart/discussions) feature of GitHub.

## Pull Requests
- Create a pull request to merge code from your feature branch to the develop branch.
    - In principle, branch names should be `feature/#[issue number]_[summary]`.
- You must agree to [DCO](https://developercertificate.org/) to contribute to LatteArt.
    - Add the following signature to the commit message to indicate that you agree with the DCO.
        - `Signed-off-by: Random J Developer <random@developer.example.org>`
            - Use your real name in the signature.
            - You need to set the same name in GitHub Profile.
            - `git commit -s` can add the signature.
- Associate a pull request with the corresponding Issue.
    - If there is no corresponding issue, create a new one before creating a pull request.
- Use the templates when creating a pull request.
- The title of a pull request should include "fix" followed by the issue number and a summary of the pull request.
    - `fix #[issue number] [summary]`

## Coding Style
- Your code must pass the check by `eslint`.