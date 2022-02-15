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
    try {
      const response = await this.slackWebClient.chat.postMessage(messageInfo);

      return response;
    } catch (error) {
      Logger.error(error);
    }
  }

  async postSlackUpdateMessage(messageInfo: SlackPostUpdateMessage) {
    try {
      const response = await this.slackWebClient.chat.update(messageInfo);

      return response;
    } catch (error) {
      Logger.error(error);
    }
  }

  async postSlackReactions(messageInfo: SlackPostReactionsDto) {
    try {
      const auth = await this.slackWebClient.auth.test();
      const response = await this.slackWebClient.reactions.get({
        channel: messageInfo.channel,
        timestamp: messageInfo.ts,
        full: true,
      });
      const reactions = response.message.reactions ?? [];
      const reactionsToRemove = reactions
        .filter(
          (reaction) =>
            !messageInfo.reactions.includes(reaction.name) &&
            reaction.users.includes(auth.user_id),
        )
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

      return reactions;
    } catch (error) {
      Logger.error(error);
    }
  }
}
