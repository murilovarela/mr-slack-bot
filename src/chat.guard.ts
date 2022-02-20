import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { verifyRequestSignature } from '@slack/events-api';
import { Observable } from 'rxjs';

@Injectable()
export class ChatGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const verification = verifyRequestSignature({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      requestSignature: request.headers['x-slack-signature'],
      requestTimestamp: request.headers['x-slack-request-timestamp'],
      body: request.rawBody,
    });

    return verification;
  }
}
