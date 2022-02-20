import { Injectable, Logger } from '@nestjs/common';
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
    const auth = await this.slackWebClient.auth.test();
    const response = await this.slackWebClient.reactions.get({
      channel: messageInfo.channel,
      timestamp: messageInfo.ts,
      full: true,
    });
    const reactions = response.message.reactions ?? [];
    const reactionsToRemove = reactions
      .filter((reaction) => reaction.users.includes(auth.user_id))
      .map((reaction) => reaction.name);

    for await (const reaction of reactionsToRemove) {
      try {
        await this.slackWebClient.reactions.remove({
          channel: messageInfo.channel,
          timestamp: messageInfo.ts,
          full: true,
          name: reaction,
        });
      } catch (error) {
        Logger.error(error);
      }
    }

    for await (const reaction of messageInfo.reactions) {
      try {
        await this.slackWebClient.reactions.add({
          channel: messageInfo.channel,
          timestamp: messageInfo.ts,
          full: true,
          name: reaction,
        });
      } catch (error) {
        Logger.error(error);
      }
    }

    Logger.log(`reacted with ${messageInfo.reactions?.join(',')}`);
    return reactions;
  }
}
