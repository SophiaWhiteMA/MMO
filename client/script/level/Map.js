import { combinePaths } from "../util/index.js";
import MapLayer from "./MapLayer.js";
import Property from "./Property.js";
import Tile from "./Tile.js";
import TileSet from "./TileSet.js";

const PRIVATE_KEY = Symbol('PrivateConstructorKey');

class Map {

    #fileUrl;

    #compressionLevel;
    #width;
    #height;
    #tileWidth;
    #tileHeight;
    #infinite;
    #type;
    #version;

    /** @type {number} */
    #nextLayerId;

    /** @type {number} */
    #nextObjectId;

    /** @type {string} */
    #orientation;

    /** @type {string} */
    #renderOrder;

    /** @type {string} */
    #tiledVersion;

    /** @type {Array<Property>} */
    #properties = [];

    /** @type {Array<MapLayer>} */
    #layers = [];

    /** @type {Map<number, TileSet>} key is firstGid */
    #tileSets = {};

    constructor(key){
        if (key != PRIVATE_KEY)
            throw new Error("Cannot instantiate Map directly. Use Map.fromJSON().");
    }

    static async fromUrl(url){
        const output = new Map(PRIVATE_KEY);
        const response = await fetch(url);
        const mapJson = await response.json();

        output.#compressionLevel = mapJson.compressionLevel;
        output.#width = mapJson.width;
        output.#height = mapJson.height;
        output.#tileHeight = mapJson.tileheight;
        output.#tileWidth = mapJson.tilewidth;
        output.#infinite = mapJson.infinite;
        output.#nextLayerId = mapJson.nextlayerid;
        output.#nextObjectId = mapJson.nextobjectid;
        output.#orientation = mapJson.orientation;

        output.#renderOrder = mapJson.renderorder;
        output.#tiledVersion= mapJson.tiledversion;
        output.#type = mapJson.type;
        output.#version = mapJson.version;
        output.#fileUrl = url;

        if(mapJson.properties?.length > 0)
            output.#properties = mapJson.properties.map(e => new Property(e.name, e.type, e.value))

       
        for(const e of mapJson.tilesets) {
            const tileSetUrl = combinePaths(output.#fileUrl, e.source);
            const tileSet = await TileSet.fromUrl(tileSetUrl);
            tileSet.spriteSheet.spriteWidth = output.#tileWidth;
            tileSet.spriteSheet.spriteHeight = output.#tileHeight;
            tileSet.source = e.source;
            output.#tileSets[e.firstgid] = tileSet;
        }

        
        output.#layers = mapJson.layers.map(e => MapLayer.fromJson(e));

        return output;
    }


    getTileSetPointersJson(){
        const output = []
        for(const firstGid of Object.keys(this.#tileSets)) {
            
            output.push({firstgid: firstGid, source: this.#tileSets[firstGid].source})
        }
        return output;
    }

    /**
     * 
     * @param {number} mapTileId 
     * 
     * @returns {{firstGid: number, tileSet: TileSet}}
     */
    getTileSetFromTileId = (mapTileId) => {


        const keys = Object.keys(this.#tileSets).sort((a, b) => a - b);
        for(const firstGid of keys) {
            const value = this.#tileSets[firstGid];
            if(mapTileId >= firstGid) {
                return {firstGid: firstGid, tileSet: this.#tileSets[firstGid]};
            }
        }

        return {firstGid: null, tileSet: null};
    }

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} z 
     * @returns {Tile}
     */
    getTileAtPosition = (x, y, z) => {
        
        const mapLayer = this.#layers[z];
        const mapTileId = mapLayer.getTileIdAtPosition(x, y);
        if(mapTileId === null)
            return null;

        const { firstGid,  tileSet } = this.getTileSetFromTileId(mapTileId);

        if(firstGid === null || tileSet === null)
            return null;

        const localId = mapTileId - firstGid;

        const tile = tileSet.getTileByLocalId(localId);

        return tile;
    }


    /**
     * 
     * @returns {string} a Tiled-compatible (keys all lower case) JSON representation of a Map. Output can be fed back into fromJson.
     * 
     */
    toString(){

        return JSON.stringify({
            compressionlevel: this.#compressionLevel,
            width: this.#width,
            height: this.#height,
            tilewidth: this.#tileWidth,
            tileheight: this.#tileHeight,
            infinite: this.#infinite,
            type: this.#type,
            version: this.#version,
            nextlayerid: this.#nextLayerId,
            nextobjectid: this.#nextObjectId,
            orientation: this.#orientation,
            renderorder: this.#renderOrder,
            tiledversion: this.#tiledVersion,
            properties: this.#properties.map(e => JSON.parse(e.toString())),
            layers: this.#layers.map(e => JSON.parse(e.toString())),
            tilesets: this.getTileSetPointersJson()
        }, null, 2)
    }

    /**
     * @returns {boolean}
     */
    get isInstanced(){
        const property = this.#properties.find(e => e.name === 'instanced');
        return property?.value === true;
    }

    /**
     * @returns {string | undefined}
     */
    get name(){
        const property = this.#properties.find(e => e.name === 'name');
        return property?.value;
    }

    /**
     * @returns {string | undefined}
     */
    get id(){
        const property = this.#properties.find(e => e.name === 'id');
        return property?.value;
    }

    get minimumForegroundLayer(){
        const property = this.#properties.find(e => e.name === 'minimumForegroundLayer');
        if(property)
            return property.value;
        else
            return null;
    }

    get tileWidth(){
        return this.#tileWidth;
    }

    get tileHeight(){
        return this.#tileHeight;
    }

    get layers(){
        return this.#layers;
    }

    get width(){
        return this.#width;
    }

    get height(){
        return this.#height;
    }

}

export default Map;