import Consts from 'classes/Consts.js';
import StageType from 'stages/StageType.js';
import {loopArray} from 'classes/Common.js';

/**
* @copyright    Umz
* @classdesc    CHASE fleeing GREMLINS (Only) and kill them, except the bombers (don't press)
* @version      0.02
*/
export default class Pursue extends StageType {

    constructor(scene) {
        super(scene);

        this.setObstacleFrames(['knight']);
        this.setEnemyTypes([Consts.GREMLIN]);

        this.touchMin = 32;
        this.touchRange = 32;
        this.showCount = 3;

        //  #   BATTLE Specific variables

        this.totalEnemies = 0;

    } // constructor()

    update(time, delta) {
        super.update(time, delta);

        this.sortObstaclesByX();

        //  #   INTERACTIVE checks

        this.updateTouchable();
        this.checkEnemyCollisions();

        this.checkWinBonus(this.kills, this.totalEnemies, 15);      //  ALL killed bonus

    } // update()


    //  #   LEVEL GENERATION
    //  ========================================================================

    /** @override Generate a level of simple obstacles and cages of team */
    generateLevel() {

        const unit = 6;

        this.generateEnemyGroup(.5, 1, unit);
        this.generateEnemyGroup(2.5, 1, unit);
        this.generateEnemyGroup(4, 1, unit);
        this.generateEnemyGroup(5.5, .5, unit);

        this.getManager().setStageLengths(7.5);

        this.totalEnemies = this.levelConfig.length;

        //  #   SPREAD out Players across all lanes

        for (let run of this.getCtrl().runners)
            run.setLane(Phaser.Math.Between(0, 10), true);

        //  #   SCATTER bodies around the beginning (Revenge, attack for Pursue 1)

        let bodies = Phaser.Math.Between(6, 10);
        for (let i=0; i<bodies; i++) {

            let x = 72 + (Phaser.Math.Between(-16,16)) + (i * 24);
            let lane = Phaser.Math.Between(0, 10);

            let body = this.getGen().spawnBody(x, lane);
            this.getManager().non.push(body);

            //  #   SURVIVORS

            if (i >= bodies - 2) {
                body.playIdle();
                this.flash(body, 0xFF0000);
                this.getManager().showFX(body, 'fg_exclamation', 5000);
            } // if (last)

        } // for (few bodies)

        //  #   BACKGROUND to banners

        const bg = this.scene.background;
        bg.setCustomDecor('bg', ['banner1', 'banner2', 'banner3', 'banner4']);
        bg.setCustomDecor('fg', ['banner1', 'banner2', 'banner3', 'banner4']);

    } // generateLevel()

    /** @override addEnemy and optionally equip enemy with weapon and armour */
    addEnemy(config) {

        let en = super.addEnemy(config);

        //  #   EQUIP according to current zone and rank (low level stage)

        let weapon = this.getEnCtrl().getRandomWeapon(Math.random() > .4);
        en.equipWeapon(weapon);
        en.recalcHP();

        //  #   BOMBERS have headband and bomb

        if (Math.random() > .8) {
            en.equipWeapon(Consts.BOMB);
            en.equipArmour(Consts.HEADBAND);
            en.setHP(0);
            en.noTouch = true;
        } // if (set as noTouch)

        //  #   IF not dead keep running- don't run back in enslaught- out of screen, die

        en.setState(Consts.STATE_RETREAT);
        en.setFlipX(false).setSpeed(32);
        en.updateTexturesA().playRun();

    } // addEnemy()


    //  #   TOUCH HANDLING
    //  ========================================================================

    /** HANDLE response to valid touch and handle obstacles */
    handle(obstacle) {

        switch (obstacle.getData('type')) {

            case Consts.OB_OBSTACLE:
                this.decom(obstacle);
                this.getCtrl().avoidLane(obstacle.lane);
            break;

            case Consts.GREMLIN:
            case Consts.GOBLIN:
            case Consts.OGOBLIN:
            case Consts.DEMON:
            case Consts.DOG:
                this.decom(obstacle);
            break;

        } // switch (obstacle)

    } // handle()


    //  #   COLLISION CHECKING
    //  ========================================================================

    /** @override ENEMIES head straight for target, no other collisions  */
    checkEnemyCollisions() {

        const enCt = this.getEnCtrl();

        loopArray(enCt.all, (en, index) => {

            if (en.state === Consts.STATE_ATT) {

                //  #   VALIDATE target or get a new one
                if (!en.target || en.target.isDead()) {
                    let target = enCt.assignTarget(en);
                    if (!target)
                        return -1;
                } // if (no target)

                //  #   HANDLE actual collision
                const player = en.target;
                if (this.checkColliding(en, player)) {

                    this.getManager().showClash(en.x, en.y, 16);    //  FX
                    player.lastCollide = en;

                    //  #   IF touched attack, get hit and move on

                    if (en.decom && !en.noTouch) {
                        if (en.hit(player.str, player))
                            enCt.kill(en, player);
                    } // if (decom)
                    else {
                        this.flash(player, 0xFF0000);
                        if (player.hit(en.str, en))
                            this.scene.manager.showFX(player, 'fg_skull', 1500);
                    } // else (hit player)

                    if (!en.isDead()) {
                        en.setState(Consts.STATE_IDLE).setTarget(null).playIdle();
                        Phaser.Utils.Array.Remove(enCt.all, en);
                    } // if (still alive)
                    else
                        this.kills ++;

                    if (en.noTouch) {
                        enCt.explode(en);
                        this.kills ++;
                    } // if (explosive)

                } // if (in range)
            } // if (attacking)

        });

    } // checkEnemyCollisions()


} // END CLASS //
