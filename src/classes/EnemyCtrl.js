import Consts from 'classes/Consts.js';
import Runner from 'classes/Runner.js';
import {loopArray} from 'classes/Common.js';

/**
* @copyright    Umz
* @classdesc    ENEMY Controller handles all enemy characters and updating
* @version      0.02
*/
export default class EnemyCtrl {

    //  CLEAN AGAIN

    constructor(scene) {

        this.scene = scene;
        this.scene.updaters.push(this);

        this.all = [];

    } // constructor()

    update(time, delta) {

        const camera = this.scene.cameras.main;
        const player = this.scene.playerCtrl.player;
        const pc = this.scene.playerCtrl;

        //  #   LOOP through all enemies for behaviour updates

        loopArray(this.all, (en) => {

            switch (en.state) {
                case Consts.STATE_ATT:
                    let target = en.target;
                    if (en.lane !== target.lane)
                        en.moveToLane(target.lane);
                break;
                case Consts.STATE_CHARGE:
                    if (en.getLeftCenter().x < player.x + 36 && !this.getNextPlayerInLane(en) && en.target) {
                        this.moveToRunnerLane(en);
                        en.state = Consts.STATE_RUNNING;
                    } // if (no collision)
                break;
                case Consts.STATE_RETREAT:
                    //  #   ATTACK when player catches up
                    if (this.scene.manager.handler.checkMissed(en)) {
                        if (en.noTouch && !en.decom)
                            this.explode(en);
                        else
                            en.setState(Consts.STATE_ATT).setSpeed(-32).setFlipX(true);
                    } // if (in range)
                break;

                //  #   AMBUSH RESCUE - Run when Player catches up

                case Consts.STATE_UNAWARE:
                    if (this.scene.manager.handler.checkMissed(en)) {
                        en.setSpeed(pc.catchSpeed + 32).setFlipX(false);
                        en.setState(Consts.STATE_FLEE_FW).playRun();
                        en.decom = true;
                    } // if (in range)
                break;
                case Consts.STATE_FLEE_FW:
                    if (en.x > (camera.scrollX + camera.width + 20)) {
                        en.remove = true;
                        Phaser.Utils.Array.Remove(this.all, en);
                    } // if (off screen)
                break;

                case Consts.STATE_DEAD:
                    Phaser.Utils.Array.Remove(this.all, en);
                break;

            } // switch (state)

        });

    } // update()

    /** INITIALIZE this controller to match and oppose the Player values */
    setup() {
        //  speed, backSpeed,
    } // setup()


    //  #   DIVIDER
    //  ========================================================================

    /** ADD an enemy to be managed by this class */
    add(en) {

        this.setStats(en);

        en.setSpeed(-48);
        en.setFlipX(true);
        en.playRun();
        en.recalcHP();

        this.assignTarget(en);
        this.all.push(en);

    } // add()

    /** SET this enemy stats and type according to stage rank */
    setStats(en) {

        switch (en.type) {
            case Consts.GREMLIN:
            break;
            case Consts.GOBLIN:
                en.setBaseHP(Phaser.Math.Between(3, 6)).setStr(2);
            break;
            case Consts.OGOBLIN:
                en.setBaseHP(Phaser.Math.Between(7, 10)).setStr(3);
            break;
            case Consts.DEMON:
                en.setBaseHP(Phaser.Math.Between(13, 16)).setStr(4);
            break;
        } // switch (en type

    } // setStats()

    /** GET a random weapon or chance at a weapon */
    getRandomWeapon(chance) {

        const zone = parseInt(sessionStorage.getItem(Consts.SES_STAGE_ZONE) || 1);
        let max = 200 + zone;
        let min = Math.max(Consts.STICK, max - 2);

        if (chance) return Phaser.Math.Between(min, max);
        else return Consts.NONE;

    } // getRandomWeapon()

    /** CHANCE to get armour */
    getChanceArmour(chance) {

        const zone = parseInt(sessionStorage.getItem(Consts.SES_STAGE_ZONE) || 1);

        let zt = 100 + zone;
        let max = Math.min(zt, Consts.CHAIN);
        let min = Math.max(Consts.CLOTH, max - 2);

        if (chance) return Phaser.Math.Between(min, max);
        else return Consts.NONE;

    } // getChanceArmour()


    //  #   DIVIDER
    //  ========================================================================

    /** KILL the enemy and perform all actions around it */
    kill(en, player) {

        this.scene.manager.playSound(Consts.SND_GAME_EN_DIE);

        //  #   ADD experience points to Player

        let ses = sessionStorage.getItem(Consts.SES_STAGE_ZONE);
        let zone = parseInt(ses);
        let exp = Math.max(1, (4 + zone) - player.getLv());
        player.addExp(exp);

        //  #   BONUS gain rank points and new weapon

        if (en.decom) {

            this.scene.save.addToSession(Consts.SES_STAGE_RANK_GAIN, 2);    //  2 per kill

            //  #   CLAIM weapon if better (not armour)

            if (en.getWeapon() > player.getWeapon()) {

                let w = en.unequipWeapon();
                en.updateTexturesA().setFrame(4);

                player.equipWeapon(w);
                player.updateTexturesA().playRun();
                this.scene.manager.playSound(Consts.SND_GAME_EQUIP);

            } // if (enemy better weapon)

        } // if (touched)

        this.scene.manager.showFX(en, 'fg_skull', 750);
        this.scene.manager.flashObject(en, 0xFF0000);

    } // kill()

    /** SHOW the explosion effect for this enemy and completely destroy it */
    explode(en) {

        //  #   MOVE fx to manager.showExplosion() - for houses

        let boom = this.scene.add.sprite(en.x, en.y, 'atlas', 'fx_boom10').setOrigin(.5).play('boomAnim');
        this.scene.container.add(boom);
        this.scene.manager.showClash(en.x, en.y, 10);
        this.scene.manager.showPuff2(en.x, en.y, 3);
        boom.once('animationcomplete', () => {
            boom.setVisible(false);
            this.scene.container.remove(boom, true);
        });

        this.scene.manager.playSound(Consts.SND_GAME_BANG);
        this.scene.cameras.main.shake(300, .02);

        //  #   CLEAR enemy from Scene

        en.remove = true;
        en.setState(Consts.STATE_DEAD);

    } // explode()


    //  #   DIVIDER
    //  ========================================================================

    /** ASSIGN a target to this enemy but will also collide with closest */
    assignTarget(en) {

        const ctrl = this.scene.playerCtrl;
        let target = Phaser.Utils.Array.GetRandom(ctrl.runners);
        en.setState(Consts.STATE_ATT).setTarget(target);

        return target;

    } // assignTarget()

    /** MOVE this enemy to the lane of a Player */
    moveToRunnerLane(en, tar) {
        const ctrl = this.scene.playerCtrl;
        let target = tar || Phaser.Utils.Array.GetRandom(ctrl.runners);
        en.moveToLane(target.lane);
    } // moveToRunnerLane()

    /** GET the next Player in lane to collide with this enemy */
    getNextPlayerInLane(en) {
        const ctrl = this.scene.playerCtrl;
        for (let rr of ctrl.runners) {
            if (en.getLeftCenter().x > rr.x && rr.lastCollide != en && rr.lane === en.lane)
                return rr;
        } // for (runners)
    } // getNextPlayerInLane()

} // END CLASS //
