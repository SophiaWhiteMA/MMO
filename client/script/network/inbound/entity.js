import Entity from "../../entity/Entity.js";
import entityManager from "../../entity/EntityManager.js";
import mapRenderer from "../../render/MapRenderer.js";


const entityMapping = {
    'entity': Entity
}

/**
 * 
 * @param {Array<String>} args 
 */
const add = (args) => {
    const entityId = args[0];
    const entityType = args[1];
    const xPosition = Number.parseInt(args[2]);
    const yPosition = Number.parseInt(args[3]);

    /** @type {Object | undefined} */
    const metadata = args[4] ? JSON.parse(args[4]) : undefined;

    const entityClass = entityMapping[entityType];
    const newEntity = new entityClass(entityId, xPosition, yPosition, metadata);
    entityManager.addEntity(newEntity);
}

const remove = (args) => {
    entityManager.removeEntityById(args[0]);
}

const move = (args) => {
    const id = args[0];
    const x = Number.parseInt(args[1]);
    const y = Number.parseInt(args[2]);
    const smooth = args[3] ? JSON.parse(args[3]) : true;
    const entity = entityManager.getEntityById(id);
    if(!entity)
        return;
    entity.move(x, y, mapRenderer.currentFrameTimeMs);
}

const setMetaData = (args) => {
    const entityId = args[0];
    const metaData = JSON.parse(args[1]);
    const entity = entityManager.getEntityById(entityId);
    if(!entity)
        return;
    entity.metaData = metaData;
}

const damage = () => {

}

const heal = () => {

}

const setName = (args) => {
    const entityId = args[0];
    const name = args[1];
    const entity = entityManager.getEntityById(entityId);
    if(!entity) return;
    entity.name = name;
}

/**
 * 
 * @param {Array<String>} args 
 * @returns 
 */
const setDirection = (args) => {
    const entityId = args[0];
    const direction = args[1].toUpperCase();
    const entity = entityManager.getEntityById(entityId);
    if(!entity) return;
    entity.direction = direction;
}

const setAttackable = () => {

}

const setAnimation = () => {

}

const setPlayer = (args) => {
    entityManager.playerId = args[0]
}

const subCommandMapping = {
    'add': add,
    'remove': remove,
    'move': move,
    'setmetadata': setMetaData,
    'damage': damage,
    'heal': heal,
    'setname': setName,
    'setdirection': setDirection,
    'setattackable': setAttackable,
    'setanimation': setAnimation,
    'setplayer' : setPlayer
}

/**
 * 
 * @param {Array<String>} args 
 */
const entity = (args) => {
    const subCommand = args.shift();
    const _function = subCommandMapping[subCommand];
    _function(args);

}

export default entity;