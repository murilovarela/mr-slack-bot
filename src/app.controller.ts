import { Body, Controller, Post } from '@nestjs/common';
import {
  GetChallengeDto,
  GlobalSlackEventDto,
  SlackEventCallbackDto,
} from './app.dto';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/slack')
  postSlack(@Body() body: GlobalSlackEventDto): unknown {
    if (body.type === 'url_verification') {
      return this.appService.getChallenge(body as GetChallengeDto);
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
            this.appService.getMessageDelete(body as SlackEventCallbackDto);
            console.log('message_deleted');

            return 'deleted';
          }

          this.appService.getMessageUpdate(body as SlackEventCallbackDto);
          console.log('message_changed');

          return 'updated';
        }

        this.appService.getNewMessage(body as SlackEventCallbackDto);
        console.log('message_created');

        return 'new message';
      }
    }

    return '';
  }

  @Post('/git')
  postGit(@Body() body: unknown): unknown {
    console.log(body);
    return '';
  }
}
