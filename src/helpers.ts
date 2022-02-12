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
