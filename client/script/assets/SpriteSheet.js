export default class SpriteSheet {

    image;
    spriteWidth;
    spriteHeight;

    /**
     * 
     * @param {HTMLImageElement} image 
     * @param {*} spriteWidth 
     * @param {*} spriteHeight 
     */
    constructor(image, spriteWidth, spriteHeight){
        this.image = image;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
    }

    get widthInSprites(){
        return this.image.width / this.spriteWidth;
    }

    get heightInSprites(){
        return this.image.height / this.spriteHeight;
    }

    get imageWidth(){
        return this.spriteWidth * this.widthInSprites;
    }

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