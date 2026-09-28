export interface Notification {
    id: number;
    message: string;
    read: boolean;
}

export interface NotificationCount {
    count: number;
}

export type NotificationReadResponse = boolean;