import assetCache from "../assets/AssetCache.js";
import SpriteSheet from "../assets/SpriteSheet.js";
import { combinePaths } from "../util/index.js";
import Property from "./Property.js";
import Tile from "./Tile.js";

const PRIVATE_KEY = Symbol('PrivateConstructorKey');

class TileSet {

    static #tileSets = []

    #fileUrl;

    #columns;
    #imageHeight;
    #imageWidth;
    #margin;
    #name;
    #spacing;
    #tileCount;
    #tiledVersion;
    #tileWidth;
    #tileHeight;
    #type;
    #version;
    #imageUrl;
    

    /** @type {SpriteSheet} */
    spriteSheet;
    source;

    #properties = [];
    #tiles = {}

    constructor(key) {
        if (key != PRIVATE_KEY)
            throw new Error("Cannot instantiate MapLayer directly. Use MapLayer.fromUrl().");
    }

    static async fromUrl(url){

        const existingTileSet = TileSet.getAllTileSets().find(e => e.fileUrl == url)
        if(!!existingTileSet) return existingTileSet;


        const response = await fetch(url);
        const tileSetJson = await response.json();

        const output =  new TileSet(PRIVATE_KEY);
        
        output.#fileUrl = url;

        output.#columns = tileSetJson.columns;
        output.#imageHeight = tileSetJson.imageheight;
        output.#imageWidth = tileSetJson.imagewidth;
        output.#margin = tileSetJson.margin;
        output.#name = tileSetJson.name;
        output.#spacing = tileSetJson.spacing;
        output.#tileCount = tileSetJson.tilecount;
        output.#tiledVersion = tileSetJson.tiledversion;
        output.#tileWidth = tileSetJson.tilewidth;
        output.#tileHeight = tileSetJson.tileheight;
        output.#type = tileSetJson.type;
        output.#version = tileSetJson.version;
        output.#imageUrl = tileSetJson.image;


        const spriteSheet = assetCache.getSpriteSheetByUrl(combinePaths(url, output.#imageUrl));
        output.spriteSheet = spriteSheet;

        tileSetJson.tiles?.forEach(e => {
            output.#tiles[e.id] = new Tile(e.id, e.properties, output)
        });

        if(tileSetJson.properties?.length > 0)
            output.properties = tileSetJson.properties.map(e => new Property(e.name, e.type, e.value))

        return output;

    }

    get fileUrl(){
        return this.#fileUrl;
    }

    static getAllTileSets(){
        return this.#tileSets;
    }

    getTileByLocalId = (localId) => {
        const existingTile = this.#tiles[localId];
        if(existingTile)
            return existingTile;



        const newTile = new Tile(localId, [], this);
        this.#tiles[localId] = newTile;
        return newTile;

    }

        toString(){
        return JSON.stringify({
            columns: this.#columns,
            image: this.#imageUrl,
            imageheight: this.#imageHeight,
            imagewidth: this.#imageWidth,
            margin: this.#margin,
            name: this.#name,
            spacing: this.#spacing,
            tilecount: this.#tileCount,
            tiledversion: this.#tiledVersion,
            tileheight: this.#tileHeight,
            tilewidth: this.#tileWidth,
            type: this.#type,
            version: this.#version,
            properties: this.#properties
        }, null, 2);
    }

}

export default TileSet;