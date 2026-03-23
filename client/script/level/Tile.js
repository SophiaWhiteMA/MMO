import Property from "./Property.js";
import TileSet from "./TileSet.js";

class Tile {

    #id;
    #properties = []
    #tileSet;


    /**
     * 
     * @param {number} id 
     * @param {Property[]} properties 
     * @param {TileSet} tileSet 
     */
    constructor(localTilesetId, properties, tileSet) {
        if(typeof tileSet === 'function') {
            console.trace();
            alert();
        }
        this.#id = localTilesetId;
        this.#tileSet = tileSet;
        if(properties)
            this.#properties = properties.map(e => new Property(e.name, e.type, e.value))
    }

    toString(){
        return JSON.stringify({
            id: this.#id,
            properties: JSON.parse(JSON.stringify(this.#properties))
        })
    }

    get properties(){
        return this.#properties;
    }

    get id(){
        return this.#id;
    }

    get tileSet(){
        return this.#tileSet;
    }


}

export default Tile;