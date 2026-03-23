import manifest from './manifest.js';
import Map from '../level/Map.js';

const PRIVATE_KEY = Symbol('PrivateConstructorKey');

export class AssetCache {

    #maps = []


    /**
     * @private
     * @param {Symbol} key 
     */
    constructor(key) {
        if (key != PRIVATE_KEY)
            throw new Error("Cannot instantiate an instance of AssetCache using 'new' -- use default export instead.");
    }

    async initialize(){
        for(const url of manifest.maps) {
            const newMap = await Map.fromUrl(url);
            this.#maps.push(newMap);
        }
    }

    getMapById(id) {
        return this.#maps.find(e => e.id === id);
    }

}


const assetCache = new AssetCache(PRIVATE_KEY);

export default assetCache;