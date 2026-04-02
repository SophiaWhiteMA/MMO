import entityManager from "../entity/EntityManager.js";
import { sendCommand } from "../network/index.js";
import { sendChatMessage } from "../network/outbound/chat.js";
import WindowInterface from "./WindowInterface.js";

const MAX_CHAT_MESSAGES = 1000;


export class ChatMessage {

    /**
     * 
     * @param {Entity} author 
     * @param {String} content 
     */
    constructor(entityId, content) {
        this.entityId = entityId;
        this.content = content;
        this.timeStamp = new Date();
        this.duration = 5000;
        const author = entityManager.getEntityById(this.entityId);
        this.authorName = author?.name ?? 'Unknown';
    }

    toString(){
        return `[${this.timeStamp.toLocaleTimeString()}] ${this.authorName}: ${this.content}`
    }

}

export default class ChatInterface extends WindowInterface {

    chatMessagesDiv;

    /** @type {Array<ChatMessage>} */
    chatMessages = [];

    constructor(parent){
        super(parent)
        this.title = 'Chat';


        this.chatMessagesDiv = document.createElement('div');
        this.chatMessagesDiv.style.overflow = 'scroll';
        this.body.classList.add('chat');
        const textBox = document.createElement('input');
       
        this.body.append(this.chatMessagesDiv);
        this.body.append(textBox);
   
        textBox.onkeydown = (evt) => {
            if(evt.key === 'Enter' && textBox.value.trim() !== '') {
                sendChatMessage(textBox.value);
                textBox.value = '';
            }
        };

    }

    /**
     * 
     * @param {ChatMessage} chatMessage 
     */
    addChatMessage(chatMessage) {
            const msg = document.createElement('p');
            msg.textContent = chatMessage.toString();
            this.chatMessagesDiv.prepend(msg);
            this.chatMessages.push(chatMessage);
            if(this.chatMessages.length > MAX_CHAT_MESSAGES) {
                this.chatMessages.pop();
                const staleMessage = this.chatMessagesDiv.getElementsByTagName('p')[MAX_CHAT_MESSAGES];
                staleMessage.remove();
            }
    }

}