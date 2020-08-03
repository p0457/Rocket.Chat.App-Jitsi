import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { getMessage } from './getMessage';
import { IJitsiRoom } from './IJitsiRoom';

export async function viewLink(
  { data, read, modify, userId }: { data, read: IRead, modify: IModify, userId: string }
  ) {
  if (!data.message) {
    return {
      success: true,
    };
  }

  const avatarUrl = await read.getEnvironmentReader().getSettings().getValueById('icon');
  const alias = await read.getEnvironmentReader().getSettings().getValueById('name');
  const botSenderName = await read.getEnvironmentReader().getSettings().getValueById('sender');
  const sender = await read.getUserReader().getById(botSenderName);

  const jitsiRoomMessage: IJitsiRoom = await getMessage(String(data.message.id), read);
  if (!jitsiRoomMessage) {
    throw new Error('No such message');
  }

  let allowed = true;
  let usernamesAllowedToView: string[] = [];
  if (jitsiRoomMessage.usernamesAllowedViewPassword) {
    usernamesAllowedToView = jitsiRoomMessage.usernamesAllowedViewPassword.split(',');
    if (usernamesAllowedToView.length > 0 && usernamesAllowedToView[0].trim() !== '') {
      usernamesAllowedToView = usernamesAllowedToView.map((u) => {
        return u.trim().toLowerCase();
      });
      const user = await read.getUserReader().getById(userId);
      if (usernamesAllowedToView.includes(user.name.toLowerCase())) allowed = true;
      else allowed = false;
    }
    else allowed = true;
  }

  let text = '';

  if (!allowed) {
    console.log('Unauthorized', {userId, usernamesAllowedToView, messageId: jitsiRoomMessage.msgId});
    text = `You are not allowed to view the link`;
  }
  else text = jitsiRoomMessage.url;

  modify.getNotifier().notifyUser(data.user, modify.getCreator().startMessage({
      sender,
      room: data.room,
      text,
      groupable: false,
      alias,
      avatarUrl
  }).getMessage());

  return {
    success: true,
  };
}
