import Entity from "./Entity.js";

export class EntityManager {

    /** @type {Array<Entity>} */
    #entities = [];

    
    playerId = undefined;

    constructor(){
        
    }

    /**
     * 
     * @param {Entity} entity 
     */
    addEntity = (entity) => {
        this.#entities.push(entity);
    }

    /**
     * 
     * @param {Entity} entity 
     */
    removeEntity = (entity) => {
        this.#entities = this.#entities.filter(e => e !== entity);
    }

    /**
     * 
     * @returns {Array<Entity>} A copy of the list of entities managed by this class.
     */
    getEntities = () => {
        return [...this.#entities];
    }

    getEntityCount = () => {
        return this.#entities.length;
    }

    /**
     * 
     * @param {String} id 
     */
    removeEntityById = (id) => {
        this.#entities = this.#entities.filter(e => e.uuid !== id);
    }

    getEntityById = (id) => {
        return this.#entities.find(e => e.uuid === id);
    }

}

/** @type {EntityManager} */
const entityManager = new EntityManager();

export default entityManager;