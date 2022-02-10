export type GlobalSlackEventDto = GetChallengeDto & SlackEventCallbackDto;

export type GetChallengeDto = {
  type: string;
  token: string;
  challenge: string;
};

export type SlackEventCallbackDto = {
  token: string;
  type: string;
  team_id: string;
  api_app_id: string;
  event: SlackMessageCallbackEventDto;
  event_id: string;
  event_time: number;
  is_ext_shared_channel: boolean;
  event_context: string;
  authorizations: SlackAuthorizations[];
};

export type SlackMessage = {
  client_msg_id?: string;
  type: string;
  subtype?: string;
  text?: string;
  user?: string;
  ts?: string;
  team?: string;
  blocks?: Array<unknown>;
  edited?: Array<unknown>;
  source_team?: string;
  user_team?: string;
  thread_ts?: string;
  bot_id?: string;
};

export type SlackMessageCallbackEventDto = SlackMessage & {
  message?: SlackMessage;
  channel: string;
  event_ts: string;
  channel_type: string;
  previous_message?: SlackMessage;
  hidden?: boolean;
  deleted_ts?: string;
  bot_id?: string;
  bot_profile?: SlackBotProfile;
  thread_ts?: string;
  parent_user_id?: string;
};

export type SlackAuthorizations = {
  enterprise_id: string | null;
  team_id: string;
  user_id: string;
  is_bot: boolean;
  is_enterprise_install: boolean;
};

export type SlackBotProfile = {
  id: string;
  deleted: boolean;
  name: string;
  updated: number;
  app_id: string;
  icons: Array<unknown>;
  team_id: string;
};

export type SlackPostNewMessage = {
  channel: string;
  thread_ts?: string | null;
  text: string;
};

export type SlackPostUpdateMessage = {
  channel: string;
  ts: string;
  thread_ts: string;
  text: string;
};

export type GitLabUser = {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  email: string;
};

export type GitLabProject = {
  id: number;
  name: string;
  description: string;
  web_url: string;
  avatar_url: string | null;
  git_ssh_url: string;
  git_http_url: string;
  namespace: string;
  visibility_level: number;
  path_with_namespace: string;
  default_branch: string;
  ci_config_path: string;
  homepage: string;
  url: string;
  ssh_url: string;
  http_url: string;
};

export type ObjectAttributes = {
  assignee_id: number;
  author_id: number;
  created_at: string;
  description: string;
  head_pipeline_id: string | null;
  id: number;
  iid: number;
  last_edited_at: string | null;
  last_edited_by_id: string | null;
  merge_commit_sha: string | null;
  merge_error: string | null;
  merge_params: unknown;
  merge_status: string; //important
  merge_user_id: number | null;
  merge_when_pipeline_succeeds: boolean;
  milestone_id: number | null;
  source_branch: string; //important
  source_project_id: number;
  state_id: number;
  target_branch: string; //important
  target_project_id: number;
  time_estimate: number;
  title: string; //important
  updated_at: string;
  updated_by_id: number | null;
  url: string;
  source: unknown;
  target: unknown;
  last_commit: unknown;
  work_in_progress: boolean; //important
  total_time_spent: number;
  time_change: number;
  human_total_time_spent: number | null;
  human_time_change: number | null;
  human_time_estimate: number | null;
  assignee_ids: Array<number>;
  state: string; //important
  blocking_discussions_resolved: boolean;
};

export type GitLabRepository = {
  name: string; //important
  url: string;
  description: string;
  homepage: string;
};

export type GitLabMergeRequestEventDto = {
  object_kind: string;
  event_type: string;
  user: GitLabUser;
  project: GitLabProject;
  object_attributes: ObjectAttributes;
  labels: Array<unknown>;
  changes: unknown;
  repository: GitLabRepository;
  assignees: Array<GitLabUser>;
};

export type GitLabGetMergeRequestDto = {
  webUrl: string;
};
