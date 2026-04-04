import AnimationComponent from "./AnimationComponent.js";

export default class RigGenerator {

    constructor(){

    }

    createHumanoidRig(textureSheet){
        
        const root = new AnimationComponent("Spine", 0, {x: 0, y: 0}, {x: 6, y: 8}, textureSheet, {x: 0, y: 0}, {width: 12, height: 16});
        root.zIndex = 1;

        const leftLeg = new AnimationComponent("leftLeg", Math.PI / 16, {x: -4, y: 7}, {x: 2, y: 0}, textureSheet, {x: 12, y: 0}, {width: 4, height: 16});
        leftLeg.zIndex = 0;
        root.addChild(leftLeg);

        const rightLeg = new AnimationComponent("rightLeg", -Math.PI / 16, {x: 4, y: 7}, {x: 2, y: 0}, textureSheet, {x: 16, y: 0}, {width: 4, height: 16});
        rightLeg.zIndex = 0;
        root.addChild(rightLeg);

        const rightArm = new AnimationComponent("rightArm", -0.1, {x: 6, y: -3}, {x: 1, y: 2}, textureSheet, {x: 0, y: 20}, {width: 16, height: 4});
        rightArm.zIndex = 0;
        root.addChild(rightArm);

        const leftArm = new AnimationComponent("leftArm", 0.1, {x: -6, y: -3}, {x: 15, y: 2}, textureSheet, {x: 0, y: 16}, {width: 16, height: 4});
        leftArm.zIndex = 0;
        root.addChild(leftArm);

        const head = new AnimationComponent("head", 0, {x: 0, y: -8}, {x: 4, y: 7}, textureSheet, {x: 20, y: 0}, {width: 8, height: 8});
        head.zIndex = 1;
        root.addChild(head);

        return root;

    }

}

export const rigGenerator = new RigGenerator();
