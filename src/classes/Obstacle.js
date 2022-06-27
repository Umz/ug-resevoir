import Consts from 'classes/Consts.js';

/**
* @copyright    Umz
* @classdesc    OBSTACLE object self container static collider on stage
* @version      0.01.01
*/
export default class Obstacle extends Phaser.GameObjects.Image {

    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.setOrigin(.5, 1);
        scene.add.existing(this);

        //  #   MEMBERS

        this.lane = 0;
        this.garbage = [];  //  ALL references to be deleted

    } // constructor()

    /** ADD child object to garbage to be destroyed along with this object */
    addToGarbage(key) {
        let obj = this.getData(key);
        this.garbage.push(this.getData(key));
        return obj;
    } // addToGarbage()

    //  #   GETTERS AND SETTERS
    //  ========================================================================

    /** SET the current lane this Obstacle is in */
    setLane(l) {
        this.lane = Math.max(0, Math.min(10, l));   //  0-10
        this.setY(this.scene.getLaneY(l));
        return this;
    } // setLane()
    getLane() { return this.lane }

    /** SET all the data values for the given object */
    setAll(obj) {
        for (let [key, value] of Object.entries(obj))
            this.setData(key, value);
    } // setAll()

} // END CLASS //
