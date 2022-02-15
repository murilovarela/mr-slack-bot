export type GitlabUser = {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  email?: string;
  state?: string;
  web_url?: string;
};

export type GitlabProject = {
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
  merge_status: string;
  merge_user_id: number | null;
  merge_when_pipeline_succeeds: boolean;
  milestone_id: number | null;
  source_branch: string;
  source_project_id: number;
  state_id: number;
  target_branch: string;
  target_project_id: number;
  time_estimate: number;
  title: string;
  updated_at: string;
  updated_by_id: number | null;
  url: string;
  source: unknown;
  target: unknown;
  last_commit: unknown;
  work_in_progress: boolean;
  total_time_spent: number;
  time_change: number;
  human_total_time_spent: number | null;
  human_time_change: number | null;
  human_time_estimate: number | null;
  assignee_ids: Array<number>;
  state: string;
  blocking_discussions_resolved: boolean;
};

export type GitlabRepository = {
  name: string;
  url: string;
  description: string;
  homepage: string;
};

export type GitlabMergeRequestEventDto = {
  object_kind: string;
  event_type: string;
  user: GitlabUser;
  project: GitlabProject;
  object_attributes: ObjectAttributes;
  labels: Array<unknown>;
  changes: unknown;
  repository: GitlabRepository;
  assignees: Array<GitlabUser>;
};

export type GitlabGetMergeRequestDto = {
  webUrl: string;
};

export type GitlabGetMergeRequestApprovalsDto = {
  projectId: string | number;
  mergeRequestIid: number;
};

export type MergeRequestResponseDto = Record<string, unknown> & {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  reviewers: GitlabUser[];
  draft: boolean;
  merge_status: string;
  approved_by: { user: GitlabUser }[];
  created_at: string;
  web_url: string;
};
