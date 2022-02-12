import { Body, Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ChatService } from './chat.service';
import {
  ChallengeDto,
  GlobalSlackEventDto,
  SlackEventCallbackDto,
} from './chat.dto';
import { GitlabMergeRequestEventDto } from './git.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly chatService: ChatService,
  ) {}

  @Post('/slack')
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
            console.log('message_deleted');

            return 'deleted';
          }

          this.appService.handleMessageUpdate(body as SlackEventCallbackDto);
          console.log('message_changed');

          return 'updated';
        }

        this.appService.handleNewMessage(body as SlackEventCallbackDto);
        console.log('message_created');

        return 'new message';
      }
    }

    return '';
  }

  @Post('/git')
  postGit(@Body() body: GitlabMergeRequestEventDto): unknown {
    this.appService.handleMergerRequestUpdate(body);
    console.log('mr_changed');

    return '';
  }
}
