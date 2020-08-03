import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { ISlashCommand, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { createConfigurationModal } from './lib/createConfigurationModal';

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
      const triggerId = context.getTriggerId();
      const user = context.getSender();
      const uid = user.id;
      const room = context.getRoom();

      let [roomName] = context.getArguments();

      if (!roomName) {
        // Direct Messages
        if (room.type === 'd') {
          roomName = room.id;
        }
        else roomName = room.slugifiedName;
      }
      // Fallback?
      if (!roomName) roomName = `${room.id}_${uid}`;

      if (triggerId) {
        const modal = await createConfigurationModal({ persis, read, modify, data: { user, room }, roomName });
        await modify.getUiController().openModalView(modal, { triggerId }, context.getSender());
      }
    }
}
