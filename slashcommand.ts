import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';

export class JitsiSlashCommand implements ISlashCommand {
    public command: string;
    public i18nParamsExample: string;
    public i18nDescription: string;
    public providesPreview: boolean;

    constructor(private readonly app: App) {
        this.command = 'jitsi';
        this.i18nParamsExample = 'params_example';
        this.i18nDescription = 'command_description';
        this.providesPreview = false;
    }

    // tslint:disable-next-line:max-line-length
    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        const sendAsSelf = await read.getEnvironmentReader().getSettings().getValueById('send_as_self');
        const avatarUrl = await read.getEnvironmentReader().getSettings().getValueById('icon');
        const alias = await read.getEnvironmentReader().getSettings().getValueById('name');
        const botSender = await read.getUserReader().getById('rocket.cat');
        const selfSender = context.getSender();
        const room = context.getRoom();

        let server = await read.getEnvironmentReader().getSettings().getValueById('server');
        if (!server.toString().endsWith('/')) {
          server = `${server}/`;
        }
        const roomNamePrepend = await read.getEnvironmentReader().getSettings().getValueById('room_name_prepend');

        let [roomName] = context.getArguments();

        if (roomNamePrepend) {
          if (roomName) {
            roomName = `${roomNamePrepend}-${roomName}`;
          } else {
            roomName = roomNamePrepend;
          }
        } else {
          if (!roomName) {
            roomName = context.getRoom().id + context.getSender().id;
          }
        }

        if (roomName.trim() === '' || roomName.trim() === roomNamePrepend)  {
          roomName = `${roomName}-${room.slugifiedName}`;
        }

        const url = `${server}${roomName}`;

        let text = `@${selfSender.username} *has started a video call:* ${url}`;

        if (sendAsSelf) {
          text = `*Join my video call:* ${ url }`;
        }

        let sender = botSender;
        if (sendAsSelf) {
          sender = selfSender;
        }

        let msgBuilder = {
          room,
          sender,
          groupable: false,
          text,
          avatarUrl: undefined,
          alias: undefined
        };

        if (!sendAsSelf) {
          msgBuilder.avatarUrl = avatarUrl;
          msgBuilder.alias = alias;
        }

        const message = modify.getCreator().startMessage(msgBuilder);

        await modify.getCreator().finish(message);
    }
}
