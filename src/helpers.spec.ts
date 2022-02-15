import { mergeRequest } from './fixtures/git';
import {
  filterReviewers,
  getIdsFromUrl,
  getMessage,
  getReviewers,
  getTrimmedDescription,
  getReminder,
} from './helpers';

Object.assign(process, {
  env: {
    GITLAB_URL: 'https://gitlab.com/',
  },
});

describe('Helpers', () => {
  describe('getReviewers', () => {
    it('returns correct string with users', () => {
      expect(getReviewers(mergeRequest.reviewers)).toEqual(
        '<@luizvarela>, <@sergiomurilovarela>',
      );
    });
  });

  describe('getTrimmedDescription', () => {
    it('returns correct string with drescription', () => {
      const longString = Array.from(Array(140), () => 'a').join('');
      expect(getTrimmedDescription(longString)).toEqual(longString);
      expect(getTrimmedDescription(longString + 'bbb')).toEqual(
        longString + '...',
      );
    });
  });

  describe('getMessage', () => {
    it('returns correct string with message', () => {
      const expectedMessage = `
*Update README.md*
This MR updates the README.md file

Awaiting review from:
<@luizvarela>

Approved by:
<@sergiomurilovarela>
`;
      expect(getMessage(mergeRequest)).toEqual(expectedMessage);
      expect(getMessage(undefined)).toEqual('Merge request not found.');
    });
  });

  describe('getIdsFromUrl', () => {
    it('returns the correct properties from valid url', () => {
      const url =
        'https://gitlab.com/sergiomurilovarela/test-project/-/merge_requests/1';
      const { projectId, mergeRequestIid } = getIdsFromUrl(url);
      expect(projectId).toEqual('sergiomurilovarela/test-project');
      expect(mergeRequestIid).toEqual('1');
    });

    it('returns the correct properties from invalid url', () => {
      const url = 'not_valid-url';
      const { projectId, mergeRequestIid } = getIdsFromUrl(url);
      expect(projectId).toEqual(undefined);
      expect(mergeRequestIid).toEqual(undefined);
    });
  });

  describe('filterReviewers', () => {
    it('returns the correct users list', () => {
      const reviewers = [
        {
          id: 10851822,
          username: 'luizvarela',
          name: 'Luiz Varela',
          state: 'active',
          avatar_url:
            'https://secure.gravatar.com/avatar/5e5cea2b494fcc071dfb9096b985481d?s=80&d=identicon',
          web_url: 'https://gitlab.com/luizvarela',
        },
        {
          id: 8017657,
          username: 'sergiomurilovarela',
          name: 'Murilo Varela',
          state: 'active',
          avatar_url:
            'https://secure.gravatar.com/avatar/720e77cbce7748a82dba91da3163652c?s=80&d=identicon',
          web_url: 'https://gitlab.com/sergiomurilovarela',
        },
      ];
      const approvedBy = [
        {
          user: {
            id: 8017657,
            username: 'sergiomurilovarela',
            name: 'Murilo Varela',
            state: 'active',
            avatar_url:
              'https://secure.gravatar.com/avatar/720e77cbce7748a82dba91da3163652c?s=80&d=identicon',
            web_url: 'https://gitlab.com/sergiomurilovarela',
          },
        },
      ];
      expect(filterReviewers(reviewers, approvedBy)).toEqual([reviewers[0]]);
      expect(filterReviewers(reviewers, [])).toEqual(reviewers);
    });
  });

  describe('getReminder', () => {
    it('should return null if there is no pending MR', () => {
      expect(getReminder([])).toBe(null);
    });
    it('should return the correct message', () => {
      const mergeRequests = [mergeRequest, mergeRequest];
      const reminder = `
*Some merge requests need your help*

1. Update README.md
  - Open since: 2022-02-07
  - <https://gitlab.com/sergiomurilovarela/test-project/-/merge_requests/1|Link to MR>
  - Awaiting review from: <@luizvarela>

2. Update README.md
  - Open since: 2022-02-07
  - <https://gitlab.com/sergiomurilovarela/test-project/-/merge_requests/1|Link to MR>
  - Awaiting review from: <@luizvarela>
`;
      expect(getReminder(mergeRequests)).toEqual(reminder);
    });
  });
});
