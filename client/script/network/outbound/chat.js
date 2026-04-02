import { sendCommand } from '../index.js';

export const sendChatMessage = (message) => {
    sendCommand(`chat send ${message}`);
}