import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WebClient } from '@slack/web-api';
import { Gitlab } from '@gitbeaker/node';
import { Model } from 'mongoose';
import {
  GetChallengeDto,
  GitLabGetMergeRequestDto,
  SlackEventCallbackDto,
  SlackPostNewMessage,
  SlackPostUpdateMessage,
} from './app.dto';
import { Message, MessageDocument } from './message.schema';

type ChallangeResponse = {
  challenge: string;
};

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  getChallenge({ challenge }: GetChallengeDto): ChallangeResponse {
    return {
      challenge,
    };
  }

  async getMessageUpdate(slackBody: SlackEventCallbackDto) {
    const mrMessageCache = await this.messageModel
      .findOne({
        channel: slackBody.event.channel,
        thread_ts: slackBody.event.message.thread_ts,
      })
      .exec();

    if (!mrMessageCache) {
      return;
    }

    this.postSlackUpdateMessage({
      channel: mrMessageCache.channel,
      ts: mrMessageCache.ts,
      thread_ts: mrMessageCache.thread_ts,
      text: 'eita atualizou a mensagem',
    });
  }

  async getMessageDelete(slackBody: SlackEventCallbackDto) {
    const mrMessageCache = await this.messageModel
      .findOne({
        channel: slackBody.event.channel,
        thread_ts: slackBody.event.message.thread_ts,
      })
      .exec();

    if (!mrMessageCache) {
      return;
    }

    this.postSlackUpdateMessage({
      channel: mrMessageCache.channel,
      ts: mrMessageCache.ts,
      thread_ts: mrMessageCache.thread_ts,
      text: 'Link deleted.',
    });
  }

  async getNewMessage(slackBody: SlackEventCallbackDto) {
    const a = await this.getMergeRequest({
      webUrl:
        'https://gitlab.com/sergiomurilovarela/test-project/-/merge_requests/1',
    });
    
    await this.postSlackNewMessage({
      channel: slackBody.event.channel,
      thread_ts: slackBody.event.event_ts,
      text: 'eita nova mensagem',
    });
  }

  async postSlackNewMessage(messageInfo: SlackPostNewMessage) {
    const slackWebClient = new WebClient(process.env.SLACK_OAUTH);

    const response = await slackWebClient.chat.postMessage({
      channel: messageInfo.channel,
      thread_ts: messageInfo.thread_ts,
      text: messageInfo.text,
    });

    const createdMessage = new this.messageModel({
      ts: response.message.ts,
      channel: response.channel,
      thread_ts: response.message.thread_ts,
    });

    await createdMessage.save();
  }

  async postSlackUpdateMessage(messageInfo: SlackPostUpdateMessage) {
    const slackWebClient = new WebClient(process.env.SLACK_OAUTH);

    await slackWebClient.chat.update({
      channel: messageInfo.channel,
      thread_ts: messageInfo.thread_ts,
      ts: messageInfo.ts,
      text: messageInfo.text,
    });
  }

  async getMergeRequest({ webUrl }: GitLabGetMergeRequestDto) {
    const gitlabClient = new Gitlab({
      token: process.env.GITLAB_APP_OAUTH,
    });

    const response = await gitlabClient.MergeRequests.all();

    return response.find((mr) => mr.web_url === webUrl);
  }
}
