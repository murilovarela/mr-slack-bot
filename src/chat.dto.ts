export type ChallangeResponseDto = {
  challenge: string;
};

export type ChallengeDto = {
  type: string;
  token: string;
  challenge: string;
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

export type SlackBotProfile = {
  id: string;
  deleted: boolean;
  name: string;
  updated: number;
  app_id: string;
  icons: Array<unknown>;
  team_id: string;
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

export type GlobalSlackEventDto = ChallengeDto & SlackEventCallbackDto;

export type SlackPostNewMessage = {
  channel: string;
  thread_ts?: string | null;
  text: string;
  mr_id: string;
};

export type SlackPostUpdateMessage = {
  channel: string;
  ts: string;
  thread_ts: string;
  text: string;
};

export type SlackPostReactionsDto = {
  channel: string;
  ts: string;
  reactions?: {
    remove: string[];
    add: string[];
  };
};
