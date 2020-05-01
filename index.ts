import {
    IConfigurationExtend,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';

import { JitsiSlashCommand } from './slashcommand';

export class JitsiApp extends App {
    constructor(info: IAppInfo, logger: ILogger) {
        super(info, logger);
    }

    protected async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {
        await configuration.slashCommands.provideSlashCommand(new JitsiSlashCommand(this));

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
          packageValue: 'https://github.com/tgardner851/Rocket.Chat.App-Jitsi/raw/master/icon.png',
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
            i18nLabel: 'server',
            i18nDescription: 'server_description',
        });

        await configuration.settings.provideSetting({
            id: 'room_name_prepend',
            type: SettingType.STRING,
            packageValue: '',
            required: false,
            public: false,
            i18nLabel: 'room_name_prepend',
            i18nDescription: 'room_name_prepend_description',
        });
    }
}
