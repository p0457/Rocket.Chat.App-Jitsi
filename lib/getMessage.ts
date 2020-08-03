import { IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

import { IJitsiRoom } from './IJitsiRoom';

export async function getMessage(msgId: string, read: IRead): Promise<IJitsiRoom> {
    const association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, msgId);
    const messages = await read.getPersistenceReader().readByAssociation(association);
    if (!messages || messages.length < 1) {
        console.log(`No messages found for Jitsi Command messageId ${msgId}`, messages);
        throw new Error('No messages found');
    }
    return messages[0] as IJitsiRoom;
}
