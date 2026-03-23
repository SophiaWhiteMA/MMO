const PRIVATE_KEY = Symbol('PrivateConstructorKey')

class MapLayer {

    #data;
    #width;
    #height;
    #id;
    #name;
    #opacity;
    #type;
    #visible;
    #x;
    #y;

    #tiles;

    constructor(key) {
        if (key != PRIVATE_KEY)
            throw new Error("Cannot instantiate MapLayer directly. Use MapLayer.fromJSON().");
    }

    static fromJson(obj) {
        const output = new MapLayer(PRIVATE_KEY);

        output.#data = obj.data;
        output.#width = obj.width;
        output.#height = obj.height;
        output.#id = obj.id;
        output.#name = obj.name;
        output.#opacity = obj.opacity;
        output.#type = obj.type;
        output.#visible = obj.visible;
        output.#x = obj.x;
        output.#y = obj.y;

        return output;
    }

    toString() {
        return JSON.stringify({
            data: this.#data,
            width: this.#width,
            height: this.#height,
            id: this.#id,
            name: this.#name,
            opacity: this.#opacity,
            type: this.#type,
            visible: this.#visible,
            x: this.#x,
            y: this.#y
        }, null, 2);
    }

    getTileIdAtPosition = (x, y) => {
        if(x >= this.#width || x < 0 || y >= this.#height || y < 0) {
            return null;
        }

        return this.#data[y * this.#width + x] ?? null;
    }


}

export default MapLayer;