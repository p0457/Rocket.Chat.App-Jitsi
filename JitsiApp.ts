import {
    IConfigurationExtend,
    ILogger
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import {
    IUIKitInteractionHandler,
    UIKitBlockInteractionContext,
    UIKitViewSubmitInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { createJitsiRoom } from './lib/createJitsiRoom';
import { editPassword } from './lib/editPassword';
import { JitsiSlashCommand } from './slashcommand';
import { dmPassword } from './lib/dmPassword';
import { createEditPasswordModal } from './lib/createEditPasswordModal';
import { getMessage } from './lib/getMessage';
import { viewLink } from './lib/viewLink';

export class JitsiApp extends App implements IUIKitInteractionHandler {
  constructor(info: IAppInfo, logger: ILogger) {
    super(info, logger);
  }

  public async executeViewSubmitHandler(context: UIKitViewSubmitInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
    const data = context.getInteractionData();

    const { state }: {
      state: {
        create_jitsiroomname?: {
          name: string,
        },
        create_jitsiroompassword?: {
          password: string,
        },
        create_jitsiroompasswordview?: {
          usernames: string,
        },
        edit_jitsiroompassword?: {
          originalmessageid: string,
          password: string
        }
      },
    } = data.view as any;

    if (!state) {
      return context.getInteractionResponder().viewErrorResponse({
        viewId: data.view.id,
        errors: {
          room: 'Error creating or editing room',
        },
      });
    }

    try {
      if (state.edit_jitsiroompassword) {
        await editPassword({ data, read, persistence, modify });
      }
      else {
        await createJitsiRoom(data, read, modify, http, persistence, data.user.id);
      }
    } catch (e) {
      return context.getInteractionResponder().viewErrorResponse({
        viewId: data.view.id,
        errors: e,
      });
    }

    return {
      success: true,
    };
  }

  public async executeBlockActionHandler(context: UIKitBlockInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify) {
    const data = context.getInteractionData();
    const userId = data.user.id;

    try {
      switch (data.actionId) {
        case 'view-link':
          await viewLink({ data, read, modify, userId });
          break;
        case 'main-overflow':
          switch (data.value) {
            case 'edit-password': 
              // Get from data.message.id
              const originalMessageId = (data.message as any).id;
              const originalMessage = await getMessage(originalMessageId, read);
              const messageUserId = originalMessage.uid;
              if (userId !== messageUserId) {
                // Not allowed
                const avatarUrl = await read.getEnvironmentReader().getSettings().getValueById('icon');
                const alias = await read.getEnvironmentReader().getSettings().getValueById('name');
                const botSenderName = await read.getEnvironmentReader().getSettings().getValueById('sender');
                const sender = await read.getUserReader().getById(botSenderName);
                modify.getNotifier().notifyUser(data.user, modify.getCreator().startMessage({
                  sender,
                  room: data.room as IRoom,
                  text: `You are not allowed to set the password`,
                  groupable: false,
                  alias,
                  avatarUrl
                }).getMessage());
                console.log('Unauthorized', {userId, messageUserId, originalMessageId});
                break;
              }
              else {
                const modal = await createEditPasswordModal({ persis: persistence, modify, data, read });
                return context.getInteractionResponder().openModalViewResponse(modal);
              }
              break;
          }
          break;
        case 'dm-password':
          await dmPassword({ data, read, modify, userId });
          break;
      }
    }
    catch(e) {
      return context.getInteractionResponder().viewErrorResponse({
        viewId: data.actionId,
        errors: e,
      });
    }

    return {
      success: true,
      triggerId: data.triggerId,
    };
  }

  protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
    await configuration.slashCommands.provideSlashCommand(new JitsiSlashCommand(this));

    await configuration.settings.provideSetting({
      id: 'send_as_self',
      type: SettingType.BOOLEAN,
      packageValue: '',
      required: false,
      public: false,
      i18nLabel: 'customize_send_as_self',
      i18nDescription: 'customize_send_as_self_description',
    });

    await configuration.settings.provideSetting({
      id: 'sender',
      type: SettingType.STRING,
      packageValue: 'jitsi.bot',
      required: true,
      public: false,
      i18nLabel: 'customize_sender',
      i18nDescription: 'customize_sender_description',
    });

    await configuration.settings.provideSetting({
      id: 'name',
      type: SettingType.STRING,
      packageValue: 'Jitsi',
      required: true,
      public: false,
      i18nLabel: 'customize_name',
      i18nDescription: 'customize_name_description',
    });

    await configuration.settings.provideSetting({
      id: 'icon',
      type: SettingType.STRING,
      packageValue: 'https://raw.githubusercontent.com/tgardner851/Rocket.Chat.App-Jitsi/master/icon.png',
      required: true,
      public: false,
      i18nLabel: 'customize_icon',
      i18nDescription: 'customize_icon_description',
    });

    await configuration.settings.provideSetting({
      id: 'server',
      type: SettingType.STRING,
      packageValue: 'https://meet.jit.si/',
      required: true,
      public: false,
      i18nLabel: 'customize_server',
      i18nDescription: 'customize_server_description',
    });

    await configuration.settings.provideSetting({
      id: 'room_name_prepend',
      type: SettingType.STRING,
      packageValue: '',
      required: false,
      public: false,
      i18nLabel: 'customize_room_name_prepend',
      i18nDescription: 'customize_room_name_prepend_description',
    });
  }
}
