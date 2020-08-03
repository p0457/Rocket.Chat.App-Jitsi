import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { getMessage } from './getMessage';
import { IJitsiRoom } from './IJitsiRoom';
import { createJitsiRoomBlocks } from './createJitsiRoomBlocks';

export async function editPassword({ data, read, persistence, modify }: {
  data,
  read: IRead,
  persistence: IPersistence,
  modify: IModify
}) {
  const { view: { id } } = data;
  const { state }: {
    state?: any;
  } = data.view;

  try {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, data.view.id);
    const originalMessageIdRecord = await read.getPersistenceReader().readByAssociation(association);
    let originalMessageId;
    if (originalMessageIdRecord && originalMessageIdRecord[0]) {
      originalMessageId = (originalMessageIdRecord[0] as any).originalMessageId;
    }

    const jitsiRoomMessage: IJitsiRoom = await getMessage(String(originalMessageId), read);
    if (!jitsiRoomMessage) {
      throw new Error('No such message');
    }
    let password = state.edit_jitsiroompassword.password;
    if (password) password = password.trim();
    if (password === '') password = undefined;

    const originalMessageAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, jitsiRoomMessage.msgId);

    jitsiRoomMessage.password = password;
    jitsiRoomMessage.passwordUpdated = new Date();

    const updateId = await persistence.updateByAssociation(originalMessageAssociation, jitsiRoomMessage);
    const message = await modify.getUpdater().message(originalMessageId as string, data.user);
    message.setEditor(message.getSender());
    const block = modify.getCreator().getBlockBuilder();

    await createJitsiRoomBlocks(block, jitsiRoomMessage);

    message.setBlocks(block);
    return modify.getUpdater().finish(message);
  }
  catch(e) {
    console.log('Error in editPassword', e);
    throw { editPassword: e };
  }
}