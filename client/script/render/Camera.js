import Entity from "../entity/Entity.js";
import entityManager from "../entity/EntityManager.js";
import MapRenderer from "./MapRenderer.js";

/**
 * Child class of the MapRenderer. 
 */
class Camera {

    mapRenderer;

    /** @type {Entity} */
    trackedEntityId;

    /** @type {Number} */
    #x;

    /** @type {Number} */
    #y;

    panTimeStart;
    panDuration = 0;
    isPanning = false;
    panDeltas = { x: 0, y: 0 };
    panOrigin = { x: 0, y: 0 };

    /**
     * 
     * @param {MapRenderer} mapRenderer 
     */
    constructor(mapRenderer) {
        this.mapRenderer = mapRenderer;
    }

    /**
     * Pans the camera to the specified position such that the panning will take 'duration' ms from start to finish.
     * 
     * If this method is called while the camera is already being panned, then the old panning sequence will be aborted
     * and replaced with the values provided by the new parameters. 
     * @param {*} x 
     * @param {*} y 
     * @param {*} duration 
     */
    pan = (x, y, duration) => {
        this.panDuration = duration;
        this.isPanning = true;
        this.panDeltas.x = x - this.#x;
        this.panDeltas.y = y - this.#y;
        this.panOrigin = { x: this.#x, y: this.#y };
        this.panTimeStart = this.mapRenderer.currentFrameTimeMs;
    }

    onFrame = () => {

        if (!this.isPanning)
            return;

        if (this.panTimeStart === undefined)
            this.panTimeStart = this.mapRenderer.currentFrameTimeMs;

        let fraction = (this.mapRenderer.currentFrameTimeMs - this.panTimeStart) / this.panDuration;

        if (fraction > 1) {
            fraction = 1
        }

        const finalPanFrame = fraction === 1;

        const newCameraX = this.panOrigin.x + fraction * this.panDeltas.x;
        const newCameraY = this.panOrigin.y + fraction * this.panDeltas.y;

        this.#x = newCameraX;
        this.#y = newCameraY;

        if (finalPanFrame) {
            this.isPanning = false;
        }

    }

    set x(x) {
        this.#x = x;
    }

    set y(y) {
        this.#y = y;
    }

    get x() {

        const playerId = entityManager.playerId;

        if (!playerId)
            return this.#x;
        
        const player = entityManager.getEntityById(playerId);
        if(!player)
            return this.#x;

        return player.visualPosition.x;

    }

    get y() {

        const playerId = entityManager.playerId;

        if (!playerId)
            return this.#y;
        
        const player = entityManager.getEntityById(playerId);
        if(!player)
            return this.#y;

        return player.visualPosition.y;

    }

}

export default Camera;