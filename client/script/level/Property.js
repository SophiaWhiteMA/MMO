export class Property {

    /** @type {string} */ #name;
    /** @type {string} */ #type;
    /** @type {string} */ #value;

    /**
     * @param {string} name
     * @param {string} type
     * @param {string} value
     */
    constructor(name, type, value) {
        this.#name = name;
        this.#type = type;
        this.#value = value;
    }

    get name() {
        return this.#name;
    }
    get type() {
        return this.#type;
    }
    get value() {
        return this.#value;
    }

    toString(){
        return JSON.stringify({
            name: this.#name,
            type: this.#type,
            value: this.#value
        }, null, 2);
    }
  
}

export default Property;