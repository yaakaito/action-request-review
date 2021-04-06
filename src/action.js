const axios = require('axios')
const minimatch = require('minimatch')

const action = async ({ context , reviewers, teamReviewers, token, ignore }) => {

    try {
        const client = axios.create({
            baseURL: 'https://api.github.com',
            headers: {
                'Authorization': `bearer ${token}`,
                'Accept': 'application/vnd.github.mockingbird-preview'
            }
        })

        const {
            title,
            state,
            draft,
            requested_reviewers,
            head: { ref }
        } = (await client.get(`/repos/${context.repo}/pulls/${context.pull_number}`)).data

        if (state !== 'open' || (ignore && minimatch(ref, ignore))|| draft || includesWipWords(title)) {
            return null
        }

        const timeline = []
        let page = 1
        while(page < 100) {
            const data = (await client.get(`/repos/${context.repo}/issues/${context.pull_number}/timeline?per_page=100&page=${page++}`)).data
            timeline.push(...data)
            if (data.length < 100) {
                break
            }
        }
        const reviewRemoved = timeline.filter(({ event, requested_reviewer }) => ['review_request_removed'].includes(event) && requested_reviewer).map(({ requested_reviewer }) => requested_reviewer.login)
        const reviewedLogins = timeline.filter(({ event }) => ['reviewed'].includes(event)).map(({ user }) => user.login)

        const members = [
            ...await (async function() {
                if (!teamReviewers || teamReviewers.length === 0) {
                    return []
                }
                let members = []
                for(const team of teamReviewers) {
                    members = members.concat((await client.get(`/orgs/${context.repo.split('/')[0]}/teams/${team}/members`)).data.map(({ login }) => login))
                }
                return members
            })(),
            ...reviewers || []
        ]

        const assignedOrReviewed = [
            ...reviewRemoved,
            ...reviewedLogins,
            ...requested_reviewers.map(({ login }) => login)
        ].some(reviewer => members.includes(reviewer))

        if (assignedOrReviewed) {
            return null
        }

        const requestingReviewers = (await client.post(`/repos/${context.repo}/pulls/${context.pull_number}/requested_reviewers`, {
            reviewers,
            team_reviewers: teamReviewers
        })).data.requested_reviewers.map(({ login }) => login)

        return requestingReviewers.filter(r => members.includes(r))
    }
    catch(e) {
        console.log(e)
        return null
    }

    function includesWipWords(title) {
        const lowered = title.toLowerCase()
        return [
            'wip',
            'draft',
        ].some(word => lowered.indexOf(word) >= 0)
    }
}

if (require.main === module) {
    action(require('../.config.local'))
}

module.exports = action
