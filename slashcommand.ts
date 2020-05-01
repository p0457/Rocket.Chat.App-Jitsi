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
        const avatarUrl = await read.getEnvironmentReader().getSettings().getValueById('icon');
        const alias = await read.getEnvironmentReader().getSettings().getValueById('name');
        const sender = await read.getUserReader().getById('rocket.cat');

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

        const url = `${server}${roomName}`;

        const text = `*Join the video call: *${ url }`;

        const room = context.getRoom();

        const message = modify.getCreator().startMessage({
          room,
          sender,
          groupable: false,
          avatarUrl,
          alias,
          text,
        });

        await modify.getCreator().finish(message);
    }
}
