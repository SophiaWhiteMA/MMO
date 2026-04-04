import manifest from './manifest.js';
import Map from '../level/Map.js';
import SpriteSheet from './SpriteSheet.js';
import TextureSheet from './TextureSheet.js';

const PRIVATE_KEY = Symbol('PrivateConstructorKey');

const fetchImage = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const imageObjectURL = URL.createObjectURL(blob);
    const img = new Image();

    return new Promise((resolve, reject) => {
        img.onload = () => {
            // IMPORTANT: Clean up the temporary URL to prevent memory leaks
            URL.revokeObjectURL(imageObjectURL);
            resolve(img);
        };
        img.onerror = reject;
        img.src = imageObjectURL;
    });

}


export class AssetCache {

    /** @type {Array<Map>} */
    #maps = []

    /** @type {Map<String, SpriteSheet>} */
    #spriteSheets = {}

    /** @type {Map<String, TextureSheet>} */
    #textureSheets = []


    /**
     * @private
     * @param {Symbol} key 
     */
    constructor(key) {
        if (key != PRIVATE_KEY)
            throw new Error("Cannot instantiate an instance of AssetCache using 'new' -- use default export instead.");
    }

    async initialize(){

        // Sprite sheets MUST be initialized before most other asset classes since they all depend on images.
        for(const url of manifest.spriteSheets) {
            const image = await fetchImage(url);
            this.#spriteSheets[url] = new SpriteSheet(image);
        }

        for(const url of manifest.textureSheets) {
            const image = await fetchImage(url);
            this.#textureSheets[url] = new TextureSheet(image);
        }

        for(const url of manifest.maps) {
            const newMap = await Map.fromUrl(url);
            this.#maps.push(newMap);
        }



    }

    /**
     * 
     * @param {*} id 
     * @returns {Map}
     */
    getMapById(id) {
        return this.#maps.find(e => e.id === id);
    }

    /**
     * 
     * @param {String} url 
     * @returns {SpriteSheet}
     */
    getSpriteSheetByUrl(url) {
        return this.#spriteSheets[url];
    }

    /**
     * 
     * @param {String} url 
     * @returns {TextureSheet}
     */
    getTextureSheetByUrl(url) {
        return this.#textureSheets[url];
    }

}


/** @type {AssetCache} */
const assetCache = new AssetCache(PRIVATE_KEY);

export default assetCache;