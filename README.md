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
      - uses: yaakaito/action-request-review@master
        with:
          teamReviewers: 'frontend_team'
          teamApiGithubToken: <チームを設定する場合閲覧権限のあるtokenが必要です>
          githubToken: ${{ secrets.GITHUB_TOKEN }}
```
