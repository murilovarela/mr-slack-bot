import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { getMessage, getReactions, getReminder } from './helpers';
import { ChatService } from './chat.service';
import { SlackEventCallbackDto } from './chat.dto';
import { GitService } from './git.service';
import { GitlabMergeRequestEventDto } from './git.dto';
import { FindOneDto } from './app.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
    private chatService: ChatService,
    private gitService: GitService,
  ) {}

  async findOneMessage(args: FindOneDto) {
    return this.messageModel.findOne(args).exec();
  }

  async findAll() {
    return this.messageModel.find().exec();
  }

  async findOneAndDeleteMessage(args: FindOneDto) {
    return this.messageModel.findOneAndDelete(args).exec();
  }

  async saveNewMessage(args: FindOneDto) {
    const createdMessage = new this.messageModel(args);

    return createdMessage.save();
  }

  async handleMessageUpdate(slackBody: SlackEventCallbackDto) {
    try {
      const mergeRequestMessageCache = await this.findOneMessage({
        channel: slackBody.event.channel,
        thread_ts: slackBody.event.message.thread_ts,
      });

      if (!mergeRequestMessageCache) {
        return;
      }

      const webUrl = slackBody.event?.message?.text
        .replace('<', '')
        .replace('>', '');
      const mergeRequest = await this.gitService.getMergeRequest({
        webUrl,
      });

      if (!mergeRequest) {
        return;
      }

      await mergeRequestMessageCache.updateOne({ mr_id: webUrl });

      await this.chatService.postSlackUpdateMessage({
        channel: mergeRequestMessageCache.channel,
        ts: mergeRequestMessageCache.ts,
        thread_ts: mergeRequestMessageCache.thread_ts,
        text: getMessage(mergeRequest),
      });

      await this.chatService.postSlackReactions({
        channel: slackBody.event.channel,
        ts: slackBody.event.message.thread_ts,
        reactions: getReactions(mergeRequest),
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  async handleMessageDelete(slackBody: SlackEventCallbackDto) {
    try {
      const mergeRequestMessageCache = await this.findOneAndDeleteMessage({
        channel: slackBody.event.channel,
        thread_ts: slackBody.event.message.thread_ts,
      });

      if (!mergeRequestMessageCache) {
        return;
      }

      await this.chatService.postSlackUpdateMessage({
        channel: mergeRequestMessageCache.channel,
        ts: mergeRequestMessageCache.ts,
        thread_ts: mergeRequestMessageCache.thread_ts,
        text: 'Link deleted.',
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  async handleNewMessage(slackBody: SlackEventCallbackDto) {
    try {
      const webUrl = slackBody.event?.text?.replace('<', '').replace('>', '');
      const mergeRequest = await this.gitService.getMergeRequest({
        webUrl,
      });

      if (!mergeRequest) {
        return;
      }

      const mergeRequestMessageCache = await this.findOneMessage({
        mr_id: webUrl,
      });

      if (mergeRequestMessageCache?.thread_ts === slackBody.event.ts) {
        return;
      }

      const chatMessage = await this.chatService.postSlackNewMessage({
        channel: slackBody.event.channel,
        thread_ts: slackBody.event.ts,
        text: getMessage(mergeRequest),
      });

      await this.chatService.postSlackReactions({
        channel: slackBody.event.channel,
        ts: slackBody.event.event_ts,
        reactions: getReactions(mergeRequest),
      });

      if (mergeRequestMessageCache) {
        await this.chatService.postSlackUpdateMessage({
          channel: mergeRequestMessageCache.channel,
          ts: mergeRequestMessageCache.ts,
          thread_ts: mergeRequestMessageCache.thread_ts,
          text: 'Link reposted.',
        });

        await mergeRequestMessageCache.updateOne({
          mr_id: webUrl,
          ts: chatMessage.ts,
          channel: slackBody.event.channel,
          thread_ts: slackBody.event.ts,
        });
      } else {
        this.saveNewMessage({
          mr_id: webUrl,
          ts: chatMessage.ts,
          channel: slackBody.event.channel,
          thread_ts: slackBody.event.ts,
        });
      }
    } catch (error) {
      Logger.error(error);
    }
  }

  async handleMergerRequestUpdate(body: GitlabMergeRequestEventDto) {
    try {
      const mergeRequestMessageCache = await this.findOneMessage({
        mr_id: body.object_attributes.url,
      });

      if (!mergeRequestMessageCache) {
        return;
      }

      const mergeRequest = await this.gitService.getMergeRequest({
        webUrl: body.object_attributes.url,
      });

      await this.chatService.postSlackUpdateMessage({
        channel: mergeRequestMessageCache.channel,
        ts: mergeRequestMessageCache.ts,
        thread_ts: mergeRequestMessageCache.thread_ts,
        text: getMessage(mergeRequest),
      });

      await this.chatService.postSlackReactions({
        channel: mergeRequestMessageCache.channel,
        ts: mergeRequestMessageCache.thread_ts,
        reactions: getReactions(mergeRequest),
      });
    } catch (error) {
      Logger.error(error);
    }
  }

  @Cron(process.env.REMINDER_CRON ?? '0 14 * * *')
  async handleCron() {
    try {
      if (!process.env.REMINDER_CRON) {
        return;
      }

      Logger.log('run reminder task');
      const messages = await this.findAll();

      if (!messages.length) {
        return;
      }

      const mergeRequestsInfo = [];

      for await (const message of messages) {
        const mergeRequest = await this.gitService.getMergeRequest({
          webUrl: message.mr_id,
        });

        if (mergeRequest.merge_status === 'can_be_merged') {
          return;
        }

        mergeRequestsInfo.push(mergeRequest);
      }

      const reminder = getReminder(mergeRequestsInfo);

      if (!reminder) {
        return;
      }

      await this.chatService.postSlackNewMessage({
        channel: messages[0].channel,
        text: reminder,
      });
    } catch (error) {
      Logger.error(error);
    }
  }
}
