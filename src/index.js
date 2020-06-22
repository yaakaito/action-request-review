const core = require('@actions/core')
const github = require('@actions/github')
const action = require('./action')

const run = async () => {
    try {
        const { pull_request } = github.context.payload
        if (!pull_request) {
            core.setFailed('Not pull_request context.')
            return
        }

        const options = {
            context: {
                repo: process.env.GITHUB_REPOSITORY,
                pull_number: pull_request.number
            },
            teamReviewers: core.getInput('teamReviewers') ? core.getInput('teamReviewers').split(',') : undefined,
            reviewers: core.getInput('reviewers') ? core.getInput('reviewers').split(',') : undefined,
            token: core.getInput('githubToken'),
        }

        const reviewers = await action(options)
        core.setOutput('reviewers', (reviewers || []).map(r => `@${r}`).join(' '))
    }
    catch(e) {
        core.setFailed(e.message)
    }

}

run()
