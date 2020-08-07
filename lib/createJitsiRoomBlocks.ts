import { BlockBuilder, BlockElementType } from '@rocket.chat/apps-engine/definition/uikit';
import { IJitsiRoom } from './IJitsiRoom';

export async function createJitsiRoomBlocks(block: BlockBuilder, config: IJitsiRoom) {
  // Text section
  block.addSectionBlock({
    text: block.newPlainTextObject(config.text || '')
  });

  // Warning/Link section
  const warningText = 'Due to a shortcoming in the RC Apps API, links are not clickable using the UIKit interface. Use the menu to select View Link to get access to a clickable link. Otherwise you may copy/paste this link:\n' + config.url;
  block.addSectionBlock({
    text: block.newPlainTextObject(warningText),
    accessory: {
      type: BlockElementType.BUTTON,
      actionId: 'view-link',
      text: block.newPlainTextObject('What\'s the link?'),
    },
  });

  // Password section
  const hasPassword = config.password && config.password.trim() !== '';
  let editPasswordText = 'Add Password';
  if (hasPassword) editPasswordText = 'Edit Password';
  block.addDividerBlock();
  let passwordSectionText = 'Password';
  if (hasPassword) passwordSectionText += ' Enabled';
  else passwordSectionText += ' Disabled or Not Set';
  block.addSectionBlock({
    text: block.newPlainTextObject(passwordSectionText),
    accessory: {
      type: BlockElementType.OVERFLOW_MENU,
      actionId: 'main-overflow',
      options: [
        {
          text: block.newPlainTextObject(editPasswordText),
          value: 'edit-password',
        }
      ],
    },
 });
 if (hasPassword) {
  let passwordUpdatedDate = 'Set on Creation';
  if (config.passwordUpdated) {
    let year = config.passwordUpdated.getFullYear();
    let month = String(config.passwordUpdated.getMonth()).trim();
    if (month.length < 2) month = `0${month}`;
    let day = String(config.passwordUpdated.getDate()).trim();
    if (day.length < 2) day = `0${day}`;
    let hours = String(config.passwordUpdated.getHours()).trim();
    if (hours.length < 2) hours = `0${hours}`;
    let minutes = String(config.passwordUpdated.getMinutes()).trim();
    if (minutes.length < 2) minutes = `0${minutes}`;
    let seconds = String(config.passwordUpdated.getSeconds()).trim();
    if (seconds.length < 2) seconds = `0${seconds}`;
    passwordUpdatedDate = `Updated ${year}-${month}-${day} at ${hours}:${minutes}:${seconds}`;
  }

  const text = (passwordUpdatedDate);
  block.addSectionBlock({
    text: block.newPlainTextObject(text),
    accessory: {
      type: BlockElementType.BUTTON,
      actionId: 'dm-password',
      text: block.newPlainTextObject('What\'s the password?'),
    },
  });
 }
 
  return;
}