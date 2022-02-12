import { Injectable } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import {
  ChallangeResponseDto,
  ChallengeDto,
  SlackPostNewMessage,
  SlackPostReactionsDto,
  SlackPostUpdateMessage,
} from './chat.dto';

@Injectable()
export class ChatService {
  handleChallenge({ challenge }: ChallengeDto): ChallangeResponseDto {
    return {
      challenge,
    };
  }

  slackWebClient = new WebClient(process.env.SLACK_OAUTH);

  async postSlackNewMessage(messageInfo: SlackPostNewMessage) {
    const response = await this.slackWebClient.chat.postMessage(messageInfo);

    return response;
  }

  async postSlackUpdateMessage(messageInfo: SlackPostUpdateMessage) {
    const response = await this.slackWebClient.chat.update(messageInfo);

    return response;
  }

  async postSlackReactions(messageInfo: SlackPostReactionsDto) {
    const response = await this.slackWebClient.reactions.get({
      channel: messageInfo.channel,
      timestamp: messageInfo.ts,
      full: true,
    });
    const reactions = response.message.reactions ?? [];

    return reactions;
  }
}
