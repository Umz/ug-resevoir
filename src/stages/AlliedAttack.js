import Consts from 'classes/Consts.js';
import StageType from 'stages/StageType.js';
import {loopArray} from 'classes/Common.js';

/**
* @copyright    Umz
* @classdesc    ALLIED ATTACK run along side allies to kill enemies (don't tap allies)
* @version      0.01
*/
export default class AlliedAttack extends StageType {

    constructor(scene) {
        super(scene);

        this.setObstacleFrames(['spikes']);
        this.setEnemyTypes(this.getEnemyTypes());

        this.runners = [];

        this.touchMin = 16;
        this.touchRange = 32;

    } // constructor()

    update(time, delta) {
        super.update(time, delta);

        this.sortObstaclesByX();

        //  #   INTERACTIVE

        this.updateTouchable();
        this.checkEnemyCollisions();

    } // update()


    //  #   LEVEL GENERATION
    //  ========================================================================

    /** @override Generate a level of simple obstacles and cages of team */
    generateLevel() {

        let camera = this.scene.cameras.main;

        //  #   REALLY dense amount of allies and enemies -

        let group = this.generateEnemyGroup(.5, 5, 20);
        for (let i=0; i<group.length; i++) {
            //  Random check for allies
            if (Math.random() > .7)
                group[i].ally = true;
        } // for (group)

        const zone = parseInt(sessionStorage.getItem(Consts.SES_STAGE_ZONE) || 1);
        let length = zone + 4;
        this.getManager().setStageLengths(length);

        //  #   ALLIES along the path

        for (let i=0; i<11; i++) {

            let x = (((length - 1) * camera.width) / 11) * (i + 1);
            let body = this.getGen().spawnBody(x, 0);
            this.getManager().non.push(body);

            //  #   FLAG bearers

            body.equipWeapon(Consts.RING);
            body.equipArmour(Consts.BLUE);
            body.updateTexturesA().playIdle();

            let flag = this.scene.add.image(-32, -32, 'atlas', 'fg_flag_sword').setOrigin(1);
            this.scene.container.add(flag);
            body.carryFlag(flag);

        } // for (few bodies)

        //  #   BACKGROUND to banners

        const bg = this.scene.background;
        bg.setCustomDecor('bg', ['banner1', 'banner2', 'banner3', 'banner4']);
        bg.setCustomDecor('bg', ['banner1', 'banner2', 'banner3', 'banner4']);

    } // generateLevel()

    /** @override addEnemy and optionally equip enemy with weapon and armour */
    addEnemy(config) {
        if (config.ally)
            this.setAlly(config);
        else
            this.setEnemy(config);
    } // addEnemy()

    /** SET this enemy as part of the group behind the Runners */
    setEnemy(conf) {

        let en = super.addEnemy(conf);

        let weapon = this.getEnCtrl().getRandomWeapon(1);
        en.equipWeapon(weapon);
        en.updateTexturesA().playRun();
        en.setFlipX(false);

        let speed = (this.getCtrl().playSpeed - 24);
        en.setSpeed(speed);

        this.runners.push(en);

    } // setEnemy()

    /** SET this runner to an ally instead with no-touch set */
    setAlly(al) {

        //  EQUIP sword

        let ally = this.getGen().spawnBody(al.x, Phaser.Math.Between(0, 10));

        //  TYPE
        ally.setData('type', Consts.PLAYER);
        ally.noTouch = true;
        this.obstacles.push(ally);

        let speed = (this.getCtrl().playSpeed - 24);
        ally.setSpeed(speed).setHP(1);

        //  #   FLAG bearers

        ally.equipWeapon(Consts.RING);
        ally.equipArmour(Consts.BLUE);
        ally.updateTexturesA().playRun();

        this.runners.push(ally);

    } // setAlly()


    //  #   COLLISION HANDLING
    //  ========================================================================

    /** HANDLE response to valid touch and handle obstacles */
    handle(obstacle) {

        switch (obstacle.getData('type')) {

            case Consts.GREMLIN:
            case Consts.GOBLIN:
            case Consts.OGOBLIN:
            case Consts.DEMON:
            case Consts.DOG:
            case Consts.PLAYER:
                this.decom(obstacle);
            break;

        } // switch (obstacle)

    } // handle()

    //  #   TAP allies - stand still in shock-

    /** ENEMIES keep running but are just hit as they run or hit as they run */
    checkEnemyCollisions() {

        loopArray(this.runners, (en, index) => {

            let player = this.getNextPlayer(en);
            if (player) {
                if (this.checkColliding(en, player)) {

                    //  #   ALLY causes stop from both

                    if (en.noTouch && en.decom && player != this.getCtrl().player) {

                        en.setSpeed(0).playIdle();
                        player.setSpeed(0).playIdle();
                        this.scene.manager.showFX(en, 'fg_shock', 1500);
                        this.scene.manager.showFX(player, 'fg_ex2', 1500);
                        this.getCtrl().remove(player);

                        Phaser.Utils.Array.Remove(this.runners, en);
                        Phaser.Utils.Array.Remove(this.runners, player);

                    } // if (ally)
                    else if (!en.noTouch) {

                        let cp = en.getLeftCenter();
                        this.getManager().showClash(cp.x, cp.y, 16);
                        this.getManager().playSound(Consts.SND_GAME_CLASH);

                        //  #   DAMAGE to Player (if any)

                        let dmg = en.decom ? 0 : en.str;
                        if (player.hit(dmg, en))
                            this.scene.manager.showFX(player, 'fg_skull', 1500);
                        else if (dmg > 0)
                            this.flash(player, 0xFF0000);

                        player.moveToLane(player.lane + Phaser.Math.Between(-1, 1));

                        //  #   DAMAGE to enemy
                        if (en.hit(player.str, player)) {
                            this.getEnCtrl().kill(en, player);
                            this.kills ++;
                            Phaser.Utils.Array.Remove(this.runners, en);
                        } // if (kill)

                        this.flash(en, 0xFF0000);

                    } // else (enemy)

                } // if (colliding)
            } // if (player found)
            else {
                Phaser.Utils.Array.Remove(this.getEnCtrl().all, en);
                Phaser.Utils.Array.Remove(this.runners, en);
            }
        });

    } // checkEnemyCollisions()

} // END CLASS //
