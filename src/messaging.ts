import { List } from "postcss/lib/list";

export interface Answer {
  text: string;
  links: [];
  status: string;
  messageId: string;
  conversationId: string;
}

export interface Link {
  index: number;
  name: string;
  url: string;
}