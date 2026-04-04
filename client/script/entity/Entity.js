import assetCache from "../assets/AssetCache.js";
import AnimationIdleHumanoid from "../animation/AnimationIdleHumanoid.js";
import AnimationComponent from "../animation/AnimationComponent.js";
import { rigGenerator } from "../animation/RigGenerator.js";

function generateRandomName() {
    const adjectives = [
        "Swift", "Quiet", "Golden", "Frosty", "Misty", 
        "Cunning", "Wild", "Brave", "Azure", "Sly", 
        "Jolly", "Sharp", "Radiant", "Loyal", "Ancient", 
        "Vivid", "Calm", "Lunar", "Solar", "Bold"
    ];

    const nouns = [
        "Falcon", "River", "Shadow", "Mountain", "Wolf", 
        "Storm", "Oak", "Panda", "Canyon", "Blade", 
        "Glacier", "Fox", "Meadow", "Summit", "Archer", 
        "Comet", "Voyager", "Forest", "Knight", "Eagle"
    ];

    // Helper to get random element
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return `${getRandom(adjectives)} ${getRandom(nouns)}`;
}

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
    _direction = 'NORTH;'

    /** @type {String} */
    name = generateRandomName();

    // An arbitrary data field. Used by subclasses to do things like store another player's worn equipment, their skills, etc
    /** @type {Object} */
    #metaData;

    /** @type {AnimationComponent} */
    animationComponent;

    /** @type {Animation} */
    animation;




    set metaData(metaData){
        this.#metaData = metaData;
        this._ingestMetadata(metaData);
    }

    get metaData (){
        return this.#metaData;
    }

    /** @type {Animation} */
    #animation;

    constructor(uuid, x, y, metadata) {
        this.uuid = uuid;
        this.position.x = x;
        this.position.y = y;
        this.previousPosition = {...this.position};
        this.visualPosition = {...this.position};
        this.metadata = metadata;

        const textureSheet = assetCache.getTextureSheetByUrl('/mmo/assets/textureSheets/human.png');
        this.animationComponent = rigGenerator.createHumanoidRig(textureSheet);

        this.animation = new AnimationIdleHumanoid();


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
        this.previousPosition = {...this.visualPosition};
        this.position = { x, y };
    }

    updateVisualPosition = (timeMs) => {

        if(this.movementStartTime === null || this.movementStartTime === undefined)
            return;

        const timeDelta = timeMs - this.movementStartTime;

        let fraction = (timeDelta / 500);
        if (fraction >= 1) {
            fraction = 1;
                this.movementStartTime = null;

        }

        const xDelta = this.position.x - this.previousPosition.x;
        const yDelta = this.position.y - this.previousPosition.y;

        this.visualPosition = {
            x: this.previousPosition.x + (xDelta * fraction),
            y: this.previousPosition.y + (yDelta * fraction)
        }

    }

    get attackable(){
        return false;
    }

    get direction(){
        return this._direction;
    }

    set direction(d) {
        const allowedDirections = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
        if(!allowedDirections.includes(d))
            throw new Error('An entity can only have NORTH, SOUTH, EAST, or WEST as a direction.');
        this._direction = d;
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
     * is fed into this method at the time of instantiation AND when the metadata changes. Subclasses can interpret
     * this data any way they wish.
     * @param {Object} metadata 
     */
    _ingestMetadata = (metadata) => {

    }

    /**
     * Intended to (sometimes) be overwritten by subclasses. 
     * @param {CanvasRenderingContext2D} canvasContext 
     * @param {Number} destinationX 
     * @param {Number} destinationY 
     * @param {Number} scaleFactor 
     */
    drawToCanvasContext = (canvasContext, destinationX, destinationY, scaleFactor) => {
        this.animationComponent.render(canvasContext, destinationX, destinationY, scaleFactor);
    }

}