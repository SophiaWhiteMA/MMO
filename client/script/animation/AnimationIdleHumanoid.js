import Animation from "./Animation.js";
import AnimationComponent from "./AnimationComponent.js";

export default class AnimationIdleHumanoid extends Animation {

    constructor(){
        super();
        this.durationTicks = 6;
    }

    /**
     * Overwritten by sub-classes. Function defines the state of animation components after a specified runtime.
     * @param {AnimationComponent} rootAnimationComponent The root of the components being mutated by this animation
     */
    mutateComponentPositions(rootAnimationComponent){

        const head = rootAnimationComponent.get('head');
        const rightArm = rootAnimationComponent.get('rightArm');
        const leftArm = rootAnimationComponent.get('leftArm');

        const rightLeg = rootAnimationComponent.get('rightLeg');
        const leftLeg = rootAnimationComponent.get('leftLeg');

        rightLeg.angle = 0;
        leftLeg.angle = 0;


        rightArm.angle = (Math.PI * 2 / 360) * 60 + Math.sin(2 * Math.PI * this.progress) * (Math.PI * 2) / 128;
        leftArm.angle = -(Math.PI * 2 / 360) * 60 + Math.sin(2 * Math.PI * this.progress) * (Math.PI * 2) / 128;
        head.position.y = head.defaultPosition.y + (Math.sin(2 * Math.PI * this.progress) + 1) * 0.25;

        rootAnimationComponent.scaleFactor = Math.abs(Math.sin(2 * Math.PI * this.progress)) * 0.025 + 1;
        

    }

}

