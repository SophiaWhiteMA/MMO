import Entity from "../../entity/Entity.js";
import entityManager from "../../entity/EntityManager.js";
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

    /**
     * 
     * @param {MapRenderer} mapRenderer 
     */
    constructor(mapRenderer, x, y) {
        this.mapRenderer = mapRenderer;
        this.x = x;
        this.y = y;
    }

    set x(x) {
        this.#x = x;
    }

    set y(y) {
        this.#y = y;
    }

    get x() {
        const playerId = entityManager.playerId;
        const player = entityManager.getEntityById(playerId);
        if(!player) return this.#x;
        return player.visualPosition.x;
    }

    get y() {
        const playerId = entityManager.playerId;
        const player = entityManager.getEntityById(playerId);
        if(!player) return this.#y;
        return player.visualPosition.y;
    }

}

export default Camera;