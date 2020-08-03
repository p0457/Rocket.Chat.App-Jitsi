export interface IJitsiRoom {
    msgId: string;
    uid: string; // user who created the poll
    server: string;
    roomNamePrepend: string;
    roomName: string;
    url: string,
    text?: string;
    password?: string;
    passwordUpdated?: Date,
    usernamesAllowedViewPassword?: string
}
