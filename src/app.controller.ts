import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatService } from './chat.service';
import {
  ChallengeDto,
  GlobalSlackEventDto,
  SlackEventCallbackDto,
} from './chat.dto';
import { GitlabMergeRequestEventDto } from './git.dto';
import { GitGuard } from './git.guard';
import { ChatGuard } from './chat.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
  ) {}

  @Post('/slack')
  @UseGuards(ChatGuard)
  postSlack(@Body() body: GlobalSlackEventDto): unknown {
    if (body.type === 'url_verification') {
      return this.chatService.handleChallenge(body as ChallengeDto);
    }

    if (body.type === 'event_callback') {
      if (
        body.event.type === 'message' &&
        !body.event.thread_ts &&
        !body.event.bot_id &&
        !body.event?.message?.bot_id
      ) {
        if (body.event.subtype === 'message_changed') {
          if (body.event.message.subtype === 'tombstone') {
            this.appService.handleMessageDelete(body as SlackEventCallbackDto);
            Logger.log('message_deleted');

            return 'deleted';
          }

          this.appService.handleMessageUpdate(body as SlackEventCallbackDto);
          Logger.log('message_changed');

          return 'updated';
        }

        this.appService.handleNewMessage(body as SlackEventCallbackDto);
        Logger.log('message_created');

        return 'new message';
      }
    }

    return '';
  }

  @Post('/git')
  @UseGuards(GitGuard)
  postGit(@Body() body: GitlabMergeRequestEventDto): unknown {
    this.appService.handleMergerRequestUpdate(body);
    Logger.log('mr_changed');

    return '';
  }
}
