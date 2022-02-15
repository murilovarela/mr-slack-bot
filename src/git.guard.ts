import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class GitGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const verification =
      request.headers['x-gitlab-token'] === process.env.X_GITLAB_TOKEN;
    Logger.log('git guard verification', verification);

    return verification;
  }
}
