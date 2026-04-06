import entityManager from "../entity/EntityManager.js";
import GameInterface from "./GameInterface.js";
import WindowInterface from "./WindowInterface.js";
import {move as playerMove} from '../network/outbound/player.js'

export default class RightClickMenu extends WindowInterface {

    chatMessagesDiv;

    /** @type {Array<ChatMessage>} */
    chatMessages = [];

    constructor(parent) {
        super(parent);
        this.dragBar.remove();
        this._resizeMargin = 20;
        this._htmlElement.classList.remove('draggable-interface');
        this._htmlElement.classList.add('right-click-menu');
    }




    onMouseLeave(evt) {
        super.onMouseLeave(evt);
        if (this.getHtmlElement().contains(evt.relatedTarget))
            return;
        //this.close(true);
    }

    /**
     * 
     * @param {String} label 
     * @param {*} onClick 
     */
    addMenuEntry(label, onClick) {
        const div = document.createElement('div');
        div.classList.add('entry')
        div.innerText = label;
        div.addEventListener('click', onClick);
        this.body.append(div);
    }

    removeAllMenuEntries() {
        const entries = this.body.getElementsByClassName('entry');
        for(let i = 0; i < entries.length; i++) {
            entries[i].remove();
        }

    }

    onContextMenu(evt) {
        super.onContextMenu(evt);
        evt.preventDefault();
    }

    open(tileX, tileY) {
        
        super.open();

        this.addMenuEntry('Cancel', () => {
            this.close()
        });


        this.addMenuEntry('Walk here', () => {
            playerMove(tileX, tileY);
            this.close();
        })

        const entities = entityManager.getEntitiesAt(tileX, tileY);
        for(const entity of entities) {
            this.addMenuEntry(`Attack ${entity.name}`, () => {});
        }

    }

    close(){
        super.close();
        this.removeAllMenuEntries();
    }

}