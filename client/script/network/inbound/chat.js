import entityManager from "../../entity/EntityManager.js";
import { chatInterface } from "../../gameInterface/index.js";
import { ChatMessage } from "../../gameInterface/ChatInterface.js";

const add = (args) => {
    const playerId = args.shift();
    const message = args.join(' ');
    const chatMessage = new ChatMessage(playerId, message);
    chatInterface.addChatMessage(chatMessage)
}

const chat = (args) => {
    const subCommand = args.shift();
    if(subCommand === 'add') {
        add(args);
    }
}

export default chat;