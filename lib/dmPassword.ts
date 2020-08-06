import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { getMessage } from './getMessage';
import { IJitsiRoom } from './IJitsiRoom';

export async function dmPassword(
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

  let allowed = false;
  let usernamesAllowedToView: string[] = [];
  if (jitsiRoomMessage.uid === userId) allowed = true;
  else {
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
    else allowed = true;
  }

  let text = '';

  if (!allowed) {
    console.log('Unauthorized', {userId, usernamesAllowedToView, messageId: jitsiRoomMessage.msgId});
    text = `You are not allowed to view the password`;
  }
  else {
    const passwordUpdated = jitsiRoomMessage.passwordUpdated;

    let passwordUpdatedDate = '';
    if (passwordUpdated) {
      let year = passwordUpdated.getFullYear();
      let month = String(passwordUpdated.getMonth()).trim();
      if (month.length < 2) month = `0${month}`;
      let day = String(passwordUpdated.getDate()).trim();
      if (day.length < 2) day = `0${day}`;
      let hours = String(passwordUpdated.getHours()).trim();
      if (hours.length < 2) hours = `0${hours}`;
      let minutes = String(passwordUpdated.getMinutes()).trim();
      if (minutes.length < 2) minutes = `0${minutes}`;
      let seconds = String(passwordUpdated.getSeconds()).trim();
      if (seconds.length < 2) seconds = `0${seconds}`;
      passwordUpdatedDate = ` _(Updated ${year}-${month}-${day} at ${hours}:${minutes}:${seconds})_`;
    }

    text = (jitsiRoomMessage.password && jitsiRoomMessage.password.trim() !== '') ?  
      (`The password for the Jitsi Room *${jitsiRoomMessage.roomName}* at link ${jitsiRoomMessage.url} is \`${jitsiRoomMessage.password}\`${passwordUpdatedDate}`) : 
      (`There is no password for the Jitsi Room \`${jitsiRoomMessage.roomName}\``)
    ;
  }

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
