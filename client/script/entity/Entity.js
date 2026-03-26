import assetCache from "../assets/AssetCache.js";
import SpriteSheet from "../assets/SpriteSheet.js";
import Animation from "./Animation.js";

import { TICK_INTERVAL } from "../constants/index.js";

export default class Entity {

    /** @type {String} */
    uuid;

    /** @type {{ x: Number, y: Number }} */
    position = { x: 0, y: 0 }

    /** @type {{ x: Number, y: Number }} */
    previousPosition = { x: 0, y: 0 }

    /** @type {Number} Timestamp of the frame that this entity first began (visually) moving.  */
    movementStartTime = 0;

    /** @type {'NORTH' | 'SOUTH' | 'EAST' | 'WEST'} */
    #direction = 'NORTH;'

    /** @type {String} */
    #name = "Default name";

    // An arbitrary data field. Used by subclasses to do things like store another player's worn equipment, their skills, etc
    /** @type {Object} */
    metaData;

    /** @type {Animation} */
    #animation;

    constructor(uuid, x, y, metadata) {
        this.uuid = uuid;
        this.position.x = x;
        this.position.y = y;
        this.previousPosition = {...this.position};
        this.metadata = metadata;
    }

    /**
     * Moves this entity to a new location and DOES NOT begin a smooth visual transition.
     * 
     * @param {*} x 
     * @param {*} y 
     */
    setPosition(x, y) {
        this.position = { x, y };
        this.previousPosition = { x, y };
    }

    /**
     * Moves this entity to a new location and begins a smooth visual transition
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} timeMs 
     */
    move = (x, y, timeMs) => {
        this.movementStartTime = timeMs;
        this.previousPosition = {...this.position};
        this.position = { x, y };
    }

    /**
     * 
     * @param {Number} timeMs Timestawmp of current frame
     * @returns {{ x: Number, y: Number }}
     */
    getVisualPosition = (timeMs) => {

        if(this.movementStartTime === null || this.movementStartTime === undefined)
            return {...this.position};

        const timeDelta = timeMs - this.movementStartTime;

        let fraction = (timeDelta / TICK_INTERVAL);
        if(fraction > 1) {
            fraction = 1;
            this.movementStartTime = null;
            // Seems a little hacky to have movementStartTime update here... Can we eventually move this to entity manager? 
        }
        
        const xDelta = this.position.x - this.previousPosition.x;
        const yDelta = this.position.y - this.previousPosition.y;

        return {
            x: this.previousPosition.x + (xDelta * fraction),
            y: this.previousPosition.y + (yDelta * fraction)
        }
    }

    get name(){
        return this.#name;
    }

    set name(name){
        this.#name = name;
    }

    get attackable(){
        return false;
    }

    get direction(){
        return this.#direction;
    }

    set direction(d) {
        const allowedDirections = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
        if(!allowedDirections.includes('d'))
            throw new Error('An entity can only have NORTH, SOUTH, EAST, or WEST as a direction.');
        this.#direction = d;
    }

    /** @returns {Animation} */
    get animation(){
        return this.#animation;
    }

    set animation(animation){
        this.#animation = animation;
    }

    stopAnimating = () => {
        this.animation = undefined;
    }

    get isAnimating(){
        return !!this.animation;
    }

    /**
     * Intended to be overloaded by subclasses. The metadata from Entity's constructor
     * is fed into this method at the time of instantiation. Subclasses can interpret
     * this data any way they wish.
     * @param {Object} metadata 
     */
    _ingestMetadata = (metadata) => {

    }

    /**
     * Intended to be overwritten by subclasses.
     * @returns {{x: Number, y: Number}}
     */
    _getSpriteSheetCoords = () => {
        return { x: 3, y: 29 };
    }

    //Intended to be overwritten by subclasses.
    /** @type {SpriteSheet} */
    get spriteSheet() {
        return assetCache.getSpriteSheetByUrl('/mmo/assets/spritesheets/sprite_sheet.png');
    };

    /**
     * Intended to (sometimes) be overwritten by subclasses. 
     * @param {CanvasRenderingContext2D} canvasContext 
     * @param {Number} destinationX 
     * @param {Number} destinationY 
     * @param {Number} scaleFactor 
     */
    drawToCanvasContext = (canvasContext, destinationX, destinationY, scaleFactor) => {
        const { x: spriteX, y: spriteY } = this._getSpriteSheetCoords();
        this.spriteSheet.drawToCanvasContext(canvasContext, spriteX, spriteY, destinationX, destinationY, scaleFactor);
    }

}