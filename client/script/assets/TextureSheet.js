export default class TextureSheet {

    image;

    /**
     * 
     * @param {HTMLImageElement} image 
     */
    constructor(image){
        this.image = image;
    }

    /**
     * 
     * @returns {Number}
     */
    getWidth(){
        return this.image.naturalWidth;
    }

    /**
     * 
     * @returns {Number}
     */
    getHeight(){
        return this.image.naturalHeight;
    }

    /**
     * 
     * @param {CanvasRenderingContext2D} context 
     * @param {Number} sourceX 
     * @param {Number} sourceY 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} destX 
     * @param {Number} destY 
     * @param {Number} scaleFactor 
     */
    drawToCanvasContext(context, sourceX, sourceY, width, height, destX, destY, scaleFactor) {
        context.drawImage(this.image, sourceX, sourceY, width, height, destX, destY, width * scaleFactor, height * scaleFactor);
    }
    
}