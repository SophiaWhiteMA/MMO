export default class SpriteSheet {

    /** @type {HTMLImageElement} */
    image;

    /** @type {Number} */
    spriteWidth;

    /** @type {Number} */
    spriteHeight;

    /**
     * 
     * @param {HTMLImageElement} image 
     * @param {Number} spriteWidth 
     * @param {Number} spriteHeight 
     */
    constructor(image, spriteWidth, spriteHeight){
        this.image = image;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
    }

    /**
     * @returns {Number}
     */
    get widthInSprites(){
        return this.image.width / this.spriteWidth;
    }

    /**
     * @returns {Number}
     */
    get heightInSprites(){
        return this.image.height / this.spriteHeight;
    }

    /**
     * @returns {Number}
     */
    get imageWidth(){
        return this.spriteWidth * this.widthInSprites;
    }

    /**
     * @returns {Number}
     */
    get imageHeight(){
        return this.spriteHeight * this.heightInSprites;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @param {number} spriteX 
     * @param {number} spriteY 
     * @param {number} destinationX 
     * @param {number} destinationY 
     * @param {number} scaleFactor 
     */
    drawToCanvasContext(context, spriteX, spriteY, destinationX, destinationY, scaleFactor) {
        const sourceX = spriteX * this.spriteWidth;
        const sourceY = spriteY * this.spriteWidth;
        const destinationWidth = this.spriteWidth * scaleFactor;
        const destinationHeight = this.spriteHeight * scaleFactor;
        context.drawImage(this.image, sourceX, sourceY, this.spriteWidth, this.spriteHeight, destinationX, destinationY, destinationWidth, destinationHeight);
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @param {number} spriteX 
     * @param {number} spriteY
     * @param {number} subSpriteX 
     * @param {number} subSpriteY
     * @param {Number} width
     * @param {Number} height
     * @param {number} destinationX 
     * @param {number} destinationY 
     * @param {number} scaleFactor 
     */
    drawSubSpriteToCanvasContext(context, spriteX, spriteY, subSpriteX, subSpriteY, width, height, destinationX, destinationY, scaleFactor) {
        const sourceX = spriteX * this.spriteWidth + subSpriteX;
        const sourceY = spriteY * this.spriteWidth + subSpriteY;
        const destinationWidth = width * scaleFactor;
        const destinationHeight = height * scaleFactor;
        context.drawImage(this.image, sourceX, sourceY, width, height, destinationX, destinationY, destinationWidth, destinationHeight);
    }

    /**
     * Converts a one-dimensional array index into a pair of (x, y) coordinates.
     * @param {number} linearId 
     * @returns 
     */
    getSpriteSheetCoordinates(linearId){
        const x = linearId % this.widthInSprites;
        const y = Math.floor(linearId / this.widthInSprites);
        return { x, y };
    }
    
}