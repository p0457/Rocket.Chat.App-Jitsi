import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import {
    IUIKitViewSubmitIncomingInteraction,
} from '@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes';
import { IMessageAction, IMessageAttachment, MessageActionButtonsAlignment, MessageActionType, MessageProcessingType } from '@rocket.chat/apps-engine/definition/messages';
import { IJitsiRoom } from './IJitsiRoom';
import { createJitsiRoomBlocks } from './createJitsiRoomBlocks';

export async function createJitsiRoom(data: IUIKitViewSubmitIncomingInteraction, read: IRead, modify: IModify, http: IHttp, persis: IPersistence, uid: string): Promise<void> {
  try {
    const { view: { id } } = data;
    const { state }: {
      state?: any;
    } = data.view;

    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, id);
    const [record] = await read.getPersistenceReader().readByAssociation(association) as Array<{
      room: IRoom;
    }>;
    const user: IUser = await read.getUserReader().getById(uid);
    const room: IRoom = record.room;

    let roomName = (state.create_jitsiroomname && state.create_jitsiroomname.name) ? state.create_jitsiroomname.name.trim() : undefined;
    let password = (state.create_jitsiroompassword && state.create_jitsiroompassword.password) ? state.create_jitsiroompassword.password : undefined;
    if (password) password = password.trim();
    const hasPassword = password && password.trim() !== '';
    let usernamesAllowedViewPassword;
    if (state.create_jitsiroompasswordview && state.create_jitsiroompasswordview.usernames) usernamesAllowedViewPassword = state.create_jitsiroompasswordview.usernames;

    let server = await read.getEnvironmentReader().getSettings().getValueById('server');
    if (!server.toString().endsWith('/')) {
      server = `${server}/`;
    }
    const roomNamePrepend = await read.getEnvironmentReader().getSettings().getValueById('room_name_prepend');

    if (!roomName) {
      // Direct Messages
      if (room.type === 'd') {
        roomName = room.id;
      }
      else roomName = room.slugifiedName;
    }
    // Fallback?
    if (!roomName) roomName = `${room.id}_${uid}`;

    if (roomNamePrepend) {
      if (roomName) {
        roomName = `${roomNamePrepend}-${roomName}`;
      } else {
        roomName = roomNamePrepend;
      }
    } else {
      if (!roomName) {
        roomName = `${room.id}_${uid}`;
      }
    }

    if (roomName.trim() === '' || roomName.trim() === roomNamePrepend)  {
      roomName = `${roomName}-${room.slugifiedName}`;
    }

    const url = `${server}${roomName}`;
    const markdownUrl = `[${url}](${url})`;

    const sendAsSelf = await read.getEnvironmentReader().getSettings().getValueById('send_as_self');
    const avatarUrl = await read.getEnvironmentReader().getSettings().getValueById('icon');
    const alias = await read.getEnvironmentReader().getSettings().getValueById('name');
    const botSenderName = await read.getEnvironmentReader().getSettings().getValueById('sender');
    const botSender = await read.getUserReader().getById(botSenderName);
    const selfSender = user;

    let text = `@${selfSender.username} has started a video call in room \`${roomName}\`.`;

    if (sendAsSelf) {
      text = `Join my video call in room \`${roomName}\`.`;
    }

    let sender = botSender;
    if (sendAsSelf) {
      sender = selfSender;
    }

    const builder = modify.getCreator().startMessage()
      .setRoom(room)
      .setSender(sender)
      .setGroupable(false)
      .setParseUrls(true)
      .setText(text);

    if (!sendAsSelf) {
      builder.setAvatarUrl(avatarUrl);
      builder.setUsernameAlias(alias);
    }

    const jitsiRoomMessage: IJitsiRoom = {
      uid,
      msgId: '',
      server,
      roomNamePrepend,
      roomName,
      url,
      text,
      password: (hasPassword ? password : undefined),
      passwordUpdated: undefined, // Only to be updated by edit password,
      usernamesAllowedViewPassword
    };

    const block = modify.getCreator().getBlockBuilder();
    await createJitsiRoomBlocks(block, jitsiRoomMessage);

    builder.setBlocks(block);

    const messageId = await modify.getCreator().finish(builder);
    jitsiRoomMessage.msgId = messageId;

    const jitsiRoomMessageAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, messageId);

    await persis.createWithAssociation(jitsiRoomMessage, jitsiRoomMessageAssociation);
  }
  catch(e) {
    console.log('Error in createJitsiRoom', e);
    throw { createJitsiRoom: e };
  }
}