import { Injectable, Logger } from '@nestjs/common';
import { Client as Gitlab } from '@nerdvision/gitlab-js';
import { GitlabGetMergeRequestDto, MergeRequestResponseDto } from './git.dto';
import { getIdsFromUrl } from './helpers';

@Injectable()
export class GitService {
  async getMergeRequest({
    webUrl,
  }: GitlabGetMergeRequestDto): Promise<MergeRequestResponseDto> {
    const gitlabClient = new Gitlab({
      token: process.env.GITLAB_APP_OAUTH,
      host: process.env.GITLAB_URL,
    });
    const { projectId, mergeRequestIid } = getIdsFromUrl(webUrl);

    if (!projectId || !mergeRequestIid) return null;

    const project = await gitlabClient.projects.find(projectId);

    if (!project) return null;

    const mergeRequest = await project.mergeRequests.find(
      parseInt(mergeRequestIid),
    );

    if (!mergeRequest) return null;

    const approvals = await mergeRequest.approvals();

    if (!approvals) return null;

    return { ...mergeRequest.data, approved_by: approvals.data.approved_by };
  }
}
