import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IUIKitModalViewParam } from '@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder';
import { getMessage } from './getMessage';
import { IJitsiRoom } from './IJitsiRoom';

import { uuid } from './uuid';

export async function createEditPasswordModal({ id = '', persis, data, modify, read }: {
    id?: string,
    persis: IPersistence,
    data,
    modify: IModify,
    read: IRead
}): Promise<IUIKitModalViewParam> {
    const viewId = id || uuid();

    const jitsiRoomMessage: IJitsiRoom = await getMessage(String(data.message.id), read);
    if (!jitsiRoomMessage) {
        throw new Error('No such message');
    }

    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, viewId);
    await persis.createWithAssociation({ originalMessageId: data.message.id }, association);

    const block = modify.getCreator().getBlockBuilder();
    block.addInputBlock({
        blockId: 'edit_jitsiroompassword',
        element: block.newPlainTextInputElement({ 
            initialValue: jitsiRoomMessage.password || '',
            actionId: 'password',
            placeholder: block.newPlainTextObject('Password')
        }),
        label: block.newPlainTextObject('Jitsi Room Password'),
    });

    return {
        id: viewId,
        title: block.newPlainTextObject('Edit Jitsi Room Password'),
        submit: block.newButtonElement({
            text: block.newPlainTextObject('Submit'),
        }),
        close: block.newButtonElement({
            text: block.newPlainTextObject('Dismiss'),
        }),
        blocks: block.getBlocks(),
    };
}
