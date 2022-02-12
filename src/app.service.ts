import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { getMessage } from './helpers';
import { mergeRequest } from './fixtures/git';
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

  async findOneMessage({ channel, thread_ts, mr_id }: FindOneDto) {
    return this.messageModel
      .findOne({
        channel,
        thread_ts,
        mr_id,
      })
      .exec();
  }

  async findOneAndDeleteMessage({ channel, thread_ts }: FindOneDto) {
    return this.messageModel
      .findOneAndDelete({
        channel,
        thread_ts,
      })
      .exec();
  }

  async saveNewMessage({ mr_id, ts, channel, thread_ts }: FindOneDto) {
    const createdMessage = new this.messageModel({
      mr_id,
      ts,
      channel,
      thread_ts,
    });

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

    const mergeRequestData = await this.gitService.getMergeRequest({
      webUrl: slackBody.event.message.text.replace('<', '').replace('>', ''),
    });

    mergeRequestMessageCache.mr_id = `${mergeRequest.project_id}-${mergeRequest.iid}`;
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

    this.chatService.postSlackUpdateMessage({
      channel: mergeRequestMessageCache.channel,
      ts: mergeRequestMessageCache.ts,
      thread_ts: mergeRequestMessageCache.thread_ts,
      text: 'Link deleted.',
    });
  }

  async handleNewMessage(slackBody: SlackEventCallbackDto) {
    const mergeRequest = await this.gitService.getMergeRequest({
      webUrl: slackBody.event.text.replace('<', '').replace('>', ''),
    });

    if (!mergeRequest) {
      return;
    }

    const chatMessage = await this.chatService.postSlackNewMessage({
      channel: slackBody.event.channel,
      thread_ts: slackBody.event.event_ts,
      text: getMessage(mergeRequest),
      mr_id: `${mergeRequest.project_id}-${mergeRequest.iid}`,
    });

    this.saveNewMessage({
      mr_id: mergeRequest.id,
      ts: chatMessage.ts,
      channel: slackBody.event.channel,
      thread_ts: slackBody.event.event_ts,
    });

    // await this.chatService.postSlackReactions({
    //   channel: slackBody.event.channel,
    //   ts: slackBody.event.event_ts,
    // });
  }

  async handleMergerRequestUpdate(body: GitlabMergeRequestEventDto) {
    const mergeRequestMessageCache = await this.findOneMessage({
      mr_id: `${body.object_attributes.source_project_id}-${body.object_attributes.iid}`,
    });

    if (!mergeRequestMessageCache) {
      return;
    }

    const mergeRequestData = await this.gitService.getMergeRequest({
      webUrl: body.object_attributes.url,
    });

    this.chatService.postSlackUpdateMessage({
      channel: mergeRequestMessageCache.channel,
      ts: mergeRequestMessageCache.ts,
      thread_ts: mergeRequestMessageCache.thread_ts,
      text: getMessage(mergeRequestData),
    });
  }
}
