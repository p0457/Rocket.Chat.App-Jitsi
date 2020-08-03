import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';

import { uuid } from './uuid';

export async function createConfigurationModal({ id = '', persis, data, read, modify, roomName }: {
  id?: string,
  persis: IPersistence,
  data,
  read: IRead, 
  modify: IModify,
  roomName?: string
}): Promise<IUIKitModalViewParam> {
  const viewId = id || uuid();

  const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, viewId);
  await persis.createWithAssociation({ room: data.room }, association);

  const block = modify.getCreator().getBlockBuilder();
  block.addInputBlock({
    blockId: 'create_jitsiroomname',
    element: block.newPlainTextInputElement({ 
      initialValue: roomName,
      actionId: 'name',
      placeholder: block.newPlainTextObject('Room Name')
    }),
    label: block.newPlainTextObject('Jitsi Room Name'),
  });
  block.addInputBlock({
    blockId: 'create_jitsiroompassword',
    element: block.newPlainTextInputElement({ 
      initialValue: '',
      actionId: 'password',
      placeholder: block.newPlainTextObject('Room Password')
    }),
    label: block.newPlainTextObject('Jitsi Room Password (Optional)'),
  });
  block.addInputBlock({
    blockId: 'create_jitsiroompasswordview',
    element: block.newPlainTextInputElement({ 
      initialValue: '',
      actionId: 'usernames',
      placeholder: block.newPlainTextObject('Usernames Allowed to View Room Password (comma-separated, default all)')
    }),
    label: block.newPlainTextObject('Usernames Allowed to View Jitsi Room Password'),
  });

  return {
    id: viewId,
    title: block.newPlainTextObject('New Jitsi Room'),
    submit: block.newButtonElement({
      text: block.newPlainTextObject('Submit'),
    }),
    close: block.newButtonElement({
      text: block.newPlainTextObject('Dismiss'),
    }),
    blocks: block.getBlocks(),
  };
}
