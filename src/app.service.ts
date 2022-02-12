import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { getMessage } from './helpers';
import { ChatService } from './chat.service';
import { SlackEventCallbackDto } from './chat.dto';
import { GitService } from './git.service';
import { GitlabMergeRequestEventDto } from './git.dto';
import { FindOneDto } from './app.dto';
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

  async findOneAndDeleteMessage(args: FindOneDto) {
    return this.messageModel.findOneAndDelete(args).exec();
  }

  async saveNewMessage(args: FindOneDto) {
    const createdMessage = new this.messageModel(args);

    return createdMessage.save();
  }

  async handleMessageUpdate(slackBody: SlackEventCallbackDto) {
    const mergeRequestMessageCache = await this.findOneMessage({
      channel: slackBody.event.channel,
      thread_ts: slackBody.event.message.thread_ts,
    });

    if (!mergeRequestMessageCache) {
      return;
    }

    const webUrl = slackBody.event.message.text
      .replace('<', '')
      .replace('>', '');
    const mergeRequestData = await this.gitService.getMergeRequest({
      webUrl,
    });

    mergeRequestMessageCache.mr_id = webUrl;
    mergeRequestMessageCache.save();

    await this.chatService.postSlackUpdateMessage({
      channel: mergeRequestMessageCache.channel,
      ts: mergeRequestMessageCache.ts,
      thread_ts: mergeRequestMessageCache.thread_ts,
      text: getMessage(mergeRequestData),
    });

    await this.chatService.postSlackReactions({
      channel: mergeRequestMessageCache.channel,
      ts: mergeRequestMessageCache.thread_ts,
    });
  }

  async handleMessageDelete(slackBody: SlackEventCallbackDto) {
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
  }

  async handleNewMessage(slackBody: SlackEventCallbackDto) {
    const webUrl = slackBody.event.text.replace('<', '').replace('>', '');
    const mergeRequest = await this.gitService.getMergeRequest({
      webUrl,
    });

    const mergeRequestMessageCache = await this.findOneMessage({
      mr_id: webUrl,
    });

    if (!mergeRequest) {
      return;
    }

    const chatMessage = await this.chatService.postSlackNewMessage({
      channel: slackBody.event.channel,
      thread_ts: slackBody.event.ts,
      text: getMessage(mergeRequest),
    });

    if (mergeRequestMessageCache) {
      await this.chatService.postSlackUpdateMessage({
        channel: mergeRequestMessageCache.channel,
        ts: mergeRequestMessageCache.ts,
        thread_ts: mergeRequestMessageCache.thread_ts,
        text: 'Link reposted.',
      });

      mergeRequestMessageCache.mr_id = webUrl;
      mergeRequestMessageCache.ts = chatMessage.ts;
      mergeRequestMessageCache.channel = slackBody.event.channel;
      mergeRequestMessageCache.thread_ts = slackBody.event.ts;
      mergeRequestMessageCache.save();
    } else {
      this.saveNewMessage({
        mr_id: webUrl,
        ts: chatMessage.ts,
        channel: slackBody.event.channel,
        thread_ts: slackBody.event.ts,
      });
    }

    // await this.chatService.postSlackReactions({
    //   channel: slackBody.event.channel,
    //   ts: slackBody.event.event_ts,
    // });
  }

  async handleMergerRequestUpdate(body: GitlabMergeRequestEventDto) {
    const mergeRequestMessageCache = await this.findOneMessage({
      mr_id: body.object_attributes.url,
    });

    if (!mergeRequestMessageCache) {
      return;
    }

    const mergeRequestData = await this.gitService.getMergeRequest({
      webUrl: body.object_attributes.url,
    });

    await this.chatService.postSlackUpdateMessage({
      channel: mergeRequestMessageCache.channel,
      ts: mergeRequestMessageCache.ts,
      thread_ts: mergeRequestMessageCache.thread_ts,
      text: getMessage(mergeRequestData),
    });
  }
}
