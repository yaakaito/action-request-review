# action-request-review

pull_request でトリガーすると指定した reviewers のうち誰がか review_requested されていないなら、それを追加します。

# Basic Usage

## Examples

frontend 以下へコミットがある Pull-Request に frontend_team の誰かをアサインする

```
name: Assign frontend reviewer

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
    paths:
      - "frontend/**"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Dump
        env:
          CONTEXT: ${{ toJson(github) }}
        run: echo $CONTEXT
      - uses: ./.github/actions/assign-reviewer
        with:
          teamReviewers: 'frontend_team'
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```
