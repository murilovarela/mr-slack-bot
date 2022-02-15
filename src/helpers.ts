import { GitlabUser, MergeRequestResponseDto } from './git.dto';

export function getIdsFromUrl(url: string): {
  projectId?: string;
  mergeRequestIid?: string;
} {
  const regex = new RegExp(
    `^${process.env.GITLAB_URL}(?<projectId>.*)\/\-\/merge_requests\/(?<mergeRequestIid>.*)`,
    'i',
  );

  const { projectId, mergeRequestIid } = url.match(regex)?.groups ?? {};

  return { projectId, mergeRequestIid };
}

export function filterReviewers(
  reviewers: MergeRequestResponseDto['reviewers'],
  approvals: MergeRequestResponseDto['approved_by'],
) {
  return reviewers.filter(
    (reviewer) =>
      !approvals.some(
        (approval) => approval.user.username === reviewer.username,
      ),
  );
}

export function getReviewers(reviewers: GitlabUser[]) {
  return reviewers
    .map(
      (reviewer, index) =>
        `<@${reviewer.username}>${index !== reviewers.length - 1 ? ', ' : ''}`,
    )
    .join('');
}

export function getTrimmedDescription(description: string) {
  return `${description.slice(0, 140)}${description.length > 140 ? '...' : ''}`;
}

export const MESSAGE_TEMPLATE = `
*{{MR_TITLE}}*
{{MR_DESCRIPTION}}

Awaiting review from:
{{REVIEWERS_REQUESTED}}

Approved by:
{{REVIEWERS_APPROVED}}
`;

export function getMessage(mergeRequest?: MergeRequestResponseDto): string {
  if (!mergeRequest) {
    return 'Merge request not found.';
  }

  if (mergeRequest.draft) {
    return 'Merge request is a draft.';
  }

  return MESSAGE_TEMPLATE.replace('{{MR_TITLE}}', mergeRequest.title)
    .replace(
      '{{MR_DESCRIPTION}}',
      getTrimmedDescription(mergeRequest.description),
    )
    .replace(
      '{{REVIEWERS_REQUESTED}}',
      getReviewers(
        filterReviewers(mergeRequest.reviewers, mergeRequest.approved_by),
      ),
    )
    .replace(
      '{{REVIEWERS_APPROVED}}',
      getReviewers(mergeRequest.approved_by.map((approval) => approval.user)),
    );
}

export const REMINDER_ITEM_TEMPLATE = `
{{INDEX}}. {{MR_TITLE}}
  - Open since: {{MR_OPEN_DATE}}
  - <{{MR_LINK}}|Link to MR>
  - Awaiting review from: {{MR_PENDING_REVIEWERS}}
`;

export const REMINDER_TEMPLATE = `
*Some merge requests need your help*
{{ITEMS}}`;

export function getReminder(mergeRequests: MergeRequestResponseDto[]): string {
  if (!mergeRequests.length) {
    return null;
  }

  const mergeRequestsToReminde = mergeRequests.filter(
    (mergeRequest) =>
      !mergeRequest.draft &&
      mergeRequest.state !== 'closed' &&
      mergeRequest.state !== 'merged',
  );
  const items = mergeRequestsToReminde.map((mergeRequest, index) =>
    REMINDER_ITEM_TEMPLATE.replace('{{INDEX}}', `${index + 1}`)
      .replace('{{MR_TITLE}}', mergeRequest.title)
      .replace('{{MR_OPEN_DATE}}', mergeRequest.created_at.split('T')[0])
      .replace('{{MR_LINK}}', mergeRequest.web_url)
      .replace(
        '{{MR_PENDING_REVIEWERS}}',
        getReviewers(
          filterReviewers(mergeRequest.reviewers, mergeRequest.approved_by),
        ),
      ),
  );

  return REMINDER_TEMPLATE.replace('{{ITEMS}}', items.join(''));
}

export function getReactions(mergeRequest?: MergeRequestResponseDto) {
  const reactions = [];

  if (!mergeRequest) {
    return reactions;
  }

  if (mergeRequest.draft) {
    return ['mr_draft'];
  }

  if (mergeRequest.state === 'merged') {
    reactions.push('mr_merged');
  }

  if (mergeRequest.state === 'opened') {
    reactions.push('mr_open');
  }

  if (mergeRequest.state === 'closed') {
    reactions.push('mr_closed');
  }

  return reactions;
}
