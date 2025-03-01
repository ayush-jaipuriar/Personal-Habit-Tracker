declare module 'react-native-push-notification' {
  export interface ChannelObject {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  export interface NotificationObject {
    id?: string | number;
    channelId?: string;
    title?: string;
    message: string;
    date?: Date;
    allowWhileIdle?: boolean;
    repeatType?: 'day' | 'week' | 'month' | 'year';
    playSound?: boolean;
    soundName?: string;
    data?: any;
  }

  export enum Importance {
    DEFAULT = 3,
    HIGH = 4,
    LOW = 2,
    MAX = 5,
    MIN = 1,
    NONE = 0,
  }

  export interface PushNotificationStatic {
    configure(options: any): void;
    createChannel(channel: ChannelObject, callback: (created: boolean) => void): void;
    localNotification(details: NotificationObject): void;
    localNotificationSchedule(details: NotificationObject): void;
    cancelLocalNotification(id: string | number): void;
    cancelAllLocalNotifications(): void;
    getScheduledLocalNotifications(callback: (notifications: any[]) => void): void;
    requestPermissions(permissions?: any): Promise<any>;
    presentLocalNotification(details: NotificationObject): void;
    getDeliveredNotifications(callback: (notifications: any[]) => void): void;
    removeDeliveredNotifications(identifiers: string[]): void;
    removeAllDeliveredNotifications(): void;
    abandonPermissions(): void;
    checkPermissions(callback: (permissions: any) => void): void;
    getChannels(callback: (channel_ids: string[]) => void): void;
    channelExists(channel_id: string, callback: (exists: boolean) => void): void;
    deleteChannel(channel_id: string): void;
  }

  const PushNotification: PushNotificationStatic;
  export default PushNotification;
} 