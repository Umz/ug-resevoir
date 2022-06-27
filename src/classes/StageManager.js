import Consts from 'classes/Consts.js';
import Snd from 'classes/Snd.js';
import {loopArray, clearTimed, getObject} from 'classes/Common.js';

import Rescue from 'stages/Rescue.js';
import Equip from 'stages/Equip.js';
import Normal from 'stages/Normal.js';
import Enslaught from 'stages/Enslaught.js';
import Pursue from 'stages/Pursue.js';
import AmbushRescue from 'stages/AmbushRescue.js';
import Convert from 'stages/Convert.js';
import AlliedAttack from 'stages/AlliedAttack.js';
import Wall from 'stages/Wall.js';

/**
* @copyright    Umz
* @classdesc    Stage Manager handles the stage conditions and objects on stage
* @version      0.05
*/
export default class StageManager {

    constructor(scene, type) {

        this.scene = scene;

        this.snd = new Snd(this.scene);

        this.stageType = -1;
        this.isChecking = true;
        this.handler = null;

        this.flashes = [];  //  Flash effect
        this.fxs = [];      //  FX
        this.non = [];      //  Non-Interactive

        //  #   ANIMATED effects

        //  #   EMITTERS

        let atlasParticle = this.scene.add.particles('atlas').setDepth(190);
        var circle1 = new Phaser.Geom.Circle(0, 0, 7);
        var circle2 = new Phaser.Geom.Circle(0, 0, 3);

        this.anims = [];    //  ANIMATION effects

        this.puffEmitter = atlasParticle.createEmitter({
            frame: ['fx_puff1', 'fx_puff2', 'fx_puff3', 'fx_puff4', 'fx_puff5'],
            alpha: { start: 1, end: 0},
            speed: { min:8, max:32 },
            radial: true,
            lifespan: 1500,
            gravityY: -48,
            frequency: -1,
            emitZone: { type: 'random', source: circle1 },
        });

        this.puff2Emitter = atlasParticle.createEmitter({
            frame: ['fx_puff1', 'fx_puff2'],
            alpha: { start: 1, end: 0},
            speed: { min:8, max:32 },
            radial: true,
            lifespan: 1000,
            gravityY: -64,
            frequency: -1,
            emitZone: { type: 'random', source: circle1 },
        });

        this.clashEmitter = atlasParticle.createEmitter({
            frame: ['fx_clash1', 'fx_clash2', 'fx_clash3'],
            alpha: { start: 1, end: 0},
            speed: { min:8, max:32 },
            radial: true,
            lifespan: 1000,
            frequency: -1,
            emitZone: { type: 'edge', source: circle2 },
        });

        scene.updaters.push(this);

    } // constructor()


    //  #   UPDATE STAGE ITEMS
    //  ========================================================================

    /** UPDATE the scene elements and state of play */
    update(time, delta) {

        this.handler.update(time, delta);

        const camera = this.scene.cameras.main;

        //  #   NON-INTERACTIVE

        loopArray(this.non, (obj) => {
            if (obj.x < camera.scrollX - 24) {
                this.scene.container.remove(obj, true);
                Phaser.Utils.Array.Remove(this.non, obj);
            } // if (out)
        });

        //  #   FX

        loopArray(this.fxs, (fx) => {
            fx.fx.setPosition(fx.target.x, fx.target.getTopCenter().y - 2);
            fx.time -= delta;
            if (fx.time <= 0) {
                fx.fx.destroy(true, true);
                Phaser.Utils.Array.Remove(this.fxs, fx);
            } // if (time up)
        });

        //  #   FLASHES

        clearTimed(this.flashes, delta, function(flash, arr) {
            flash.target.clearTint();
            Phaser.Utils.Array.Remove(arr, flash);
        });

        //  #   CHECK if the round is complete

        if (this.handler.checkWinCondition())
            this.endStage(true);
        else if (this.handler.checkLoseCondition())
            this.endStage(false);

    } // update()


    //  #   SETUP MANAGER
    //  ========================================================================

    /** SETUP this stage according to current stageType value */
    setup(type) {

        this.stageType = type;

        switch (type) {
            case Consts.STAGE_RESCUE: this.handler = new Rescue(this.scene); break;
            case Consts.STAGE_NORMAL: this.handler = new Normal(this.scene); break;
            case Consts.STAGE_EQUIP: this.handler = new Equip(this.scene); break;
            case Consts.STAGE_ENSLAUGHT: this.handler = new Enslaught(this.scene); break;
            case Consts.STAGE_PURSUE: this.handler = new Pursue(this.scene); break;
            case Consts.STAGE_AMBUSHRESCUE: this.handler = new AmbushRescue(this.scene); break;
            case Consts.STAGE_CONVERT: this.handler = new Convert(this.scene); break;
            case Consts.STAGE_ALLIED: this.handler = new AlliedAttack(this.scene); break;
            case Consts.STAGE_WALL: this.handler = new Wall(this.scene); break;
        } // switch (Stage Type)

        this.handler.generateLevel();   //  CREATE the level
        this.scene.scene.get('HUD').showButton();

    } // setup()

    /** SET the stage size by lengths */
    setStageLengths(lengths) {

        const camera = this.scene.cameras.main;
        const width = camera.width;
        let full = Math.round(width * lengths);

        this.scene.stageSize = full;
        camera.setBounds(0, 0, full, 240);

    } // setStageLengths()


    //  #   HANDLING AND CONTROLS
    //  ========================================================================

    /** PASS the touch event to the current handler */
    touch() { this.handler.handleTouch() }


    //  #   STAGE FUNCTIONS
    //  ========================================================================

    /** INDICATE an object has been registered or hit with a flash */
    flashObject(obj, tint) {

        obj.setTintFill(tint);      //  RESET the tint

        getObject(this.flashes,
            o => o.target == obj,
            () => { return {target:obj, time:500} },
            (old) => { old.time = 300 }
        );

    } // flashObject()

    /** GET dead item from the pool instead of new */
    showFX(target, frame, duration = 500) {

        let resp = getObject(this.fxs,
            o => o.fx == target,
            () => {
                let fx = this.scene.add.image(target.x, target.getTopCenter().y - 2, 'atlas', frame).setOrigin(.5, 1).setDepth(189);

                return { fx:fx, target:target, time:duration }
            },
            (old) => {
                old.fx.setFrame(frame);
                old.time = duration;
            }
        );

    } // showFX()

    /** SHOW a full puff of particles (Use accessors in case change to Sprites) */
    showPuff(x, y, amt) { this.puffEmitter.explode(amt, x, y) }
    showPuff2(x, y, amt) { this.puff2Emitter.explode(amt, x, y) }
    showClash(x, y, amt) { this.clashEmitter.explode(amt, x, y) }

    /** PLAY the sound with the given ID */
    playSound(id) { this.snd.play(id) }

    //  #   STAGE FLOW
    //  ========================================================================

    /** END the stage after firing win or lose event */
    endStage(isWin = true) {
        if (this.isChecking)
            this.scene.events.emit(Consts.EVENT_GAME_OVER, isWin);
        this.isChecking = false;
    } // endStage()

} // END CLASS //
