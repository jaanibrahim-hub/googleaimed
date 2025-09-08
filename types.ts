export enum Sender {
  User = 'user',
  AI = 'ai',
}

export interface Message {
  id: string;
  sender: Sender;
  text: string;
  imageUrl?: string;
  uploadedImages?: {
    name: string;
    url: string;
  }[];
  suggestions?: string[];
}