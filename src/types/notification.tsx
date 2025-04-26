export type NotificationTypes = {
  open: boolean;
  text: string;
  subText: string;
  type: 'warn' | 'danger' | 'checked' | 'none';
  timeout?: number;
};