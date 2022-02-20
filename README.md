# Merge Request Slack Bot

This is a bot to get people to review your MR. Simply paste your link in the review channel and the bot will let people know you need a review.

## Features

- Mention reviewers in Slack.
- Adds MR title and description to slack reply.
- Displays when MR is a draft/open/merged/closed with emojis.
- Remind people to review every hour.

## How to develop it locally

### Install dependencies:

```
yarn
```

### Run:

```
yarn start:dev
```

### Start an external server with [ngrok](ngrok.com)

```
ngrok http 3000
```

### Setup the webhooks endpoints:

Gitlab endpoint (Merge request events only):

```
https://[ngrok-uuid].ngrok.io/git
```

Slack endpoint:

```
https://[ngrok-uuid].ngrok.io/slack
```

### Create a `.env` file

```
SLACK_OAUTH=xox...
SLACK_SIGNING_SECRET=<slack signing secret>
GITLAB_APP_OAUTH=glp...
GITLAB_URL=https://gitlab.com/
X_GITLAB_TOKEN=<webhook security token>
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>?<params>
REMINDER_CRON=0 14 * * *
```

Do not add the `REMINDER_CRON` if you don't want the reminder to run.

### Add the reactions to your Slack workspace

`mr_draft`

![mr_draft](./images/mr_draft.png)

`mr_open`

![mr_open](./images/mr_open.png)

`mr_closed`

![mr_closed](./images/mr_closed.png)

`mr_merged`

![mr_merged](./images/mr_merged.png)
