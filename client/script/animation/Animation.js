import AnimationComponent from "./AnimationComponent.js";

import { TICK_INTERVAL } from '../constants/index.js';

class Animation {

    /** @type {Number} */
    startTimeMs;

    /** @type {Number} How many ticks does it take for this animation to run? Does not have to be an integer value. */
    durationTicks = 1;

    /** @type {Number} scalar value representing the progress of the animation. */
    progress;

    /** @type {Boolean} Is this animation supposed to play on loop? */
    looping = true;

    constructor(){
    }


    /**
     * Overwritten by sub-classes. Function defines the state of animation components after a specified runtime.
     * @param {Number} progress A number from 0 to 1 representing how much the antimation has progressed. 
     * @param {AnimationComponent} rootAnimationComponent The root of the components being mutated by this animation
     */
    mutateComponentPositions(rootAnimationComponent){

    }

    /**
     * Calculates progress value and does other necessary per-frame logic
     */
    onFrame(timeMs){

        if(this.startTimeMs === undefined)
            this.startTimeMs = timeMs;
        
        let progress = (timeMs - this.startTimeMs) / (this.durationTicks * TICK_INTERVAL);
        
        if(progress > 1) {
            if(!this.looping) {
                progress = 1;
            } else {
                progress = progress - Math.floor(progress);
            }
 
        }
            
        if(progress < 0 || isNaN(progress))
            progress = 0;

        this.progress = progress;
    }

    hasStarted(){
        return this.startTimeMs !== undefined;
    }

}

export default Animation;