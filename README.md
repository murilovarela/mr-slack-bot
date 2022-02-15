# Merge Request Slack Bot

This is a bot to get people to review your MR.

## Features

- Mention reviewers in Slack
- Adds MR description to comment
- Displays when MR is draft/open/merged/closed

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
GITLAB_APP_ID=cac...
GITLAB_APP_OAUTH=glp...
GITLAB_URL=https://gitlab.com/
MONGO_URL=mongodb+srv://<username>:<password>@<cluster>?<params>
```

### Add the reactions to your Slack workspace

`mr_draft`

![mr_draft](./images/mr_draft.png)

`mr_open`

![mr_open](./images/mr_open.png)

`mr_closed`

![mr_closed](./images/mr_closed.png)

`mr_merged`

![mr_merged](./images/mr_merged.png)
