import Consts from 'classes/Consts.js';
import StageType from 'stages/StageType.js';
import {loopArray} from 'classes/Common.js';

/**
* @copyright    Umz
* @classdesc    KILL hordes of enemies while avoiding the monks
* @version      0.01
*/
export default class Convert extends StageType {

    constructor(scene) {
        super(scene);

        this.setObstacleFrames(['knight']);
        this.setEnemyTypes(this.getEnemyTypes());

        this.touchMin = 24;
        this.touchRange = 48;
        this.showCount = 5;

        //  #   SPECIFICS

        this.monks = [];
        this.totalEnemies = 0;

    } // constructor()

    update(time, delta) {
        super.update(time, delta);

        this.sortObstaclesByX();

        //  #   INTERACTIVE checks

        this.updateTouchable();
        this.checkEnemyCollisions();

        //this.checkWinBonus(this.kills, this.totalEnemies, 15);      //  ALL killed bonus

        //  #   UPDATE monks

        const camera = this.scene.cameras.main;
        const player = this.getPlayer();

        loopArray(this.monks, (en) => {

            let speed = (this.getCtrl().catchSpeed);
            if (en.x < (player.x + 180) && en.speed === 0)
                en.setSpeed(-speed).playRun();

            if (!en || en.remove || en.state === Consts.STATE_FLEE_FW || en.x < player.x || en.speed !== 0)
            Phaser.Utils.Array.Remove(this.monks, en);

        });

    } // update()


    //  #   LEVEL GENERATION
    //  ========================================================================

    /** @override Generate a level of simple obstacles and cages of team */
    generateLevel() {

        //  #   GENERATE the level enemies in loop

        for (let i=0; i<3; i++) {

            let len = 1.5;
            let sX = 1 + (i * len) + (.5 * i);
            let gen = this.generateEnemyGroup(sX, len, Phaser.Math.Between(8, 12));

            gen[Phaser.Math.Between(0, 3)].monk = true;
            gen[Phaser.Math.Between(4, 7)].monk = true;

        } // for (3 loop)

        let full = (1.5 * 3) + (.5 * 3) + 1;
        this.getManager().setStageLengths(full);

        //  #   BACKGROUND to banners

        const bg = this.scene.background;
        bg.setCustomDecor('fg', ['banner1']);

    } // generateLevel()

    /** @override addEnemy and optionally equip enemy with weapon and armour */
    addEnemy(config) {

        let en = super.addEnemy(config);

        //  #   EQUIP according to current zone and rank (low level stage)

        let weapon = this.getEnCtrl().getRandomWeapon(1);;
        en.equipWeapon(weapon);
        en.equipArmour(Consts.BLUE);
        en.updateTexturesA();

        en.setHP(Phaser.Math.Between(5, 10));
        en.setSpeed(-48).setState(Consts.STATE_CHARGE).playRun();

        //  #   MONKS have staffs and convert

        if (config.monk)
            this.setMonk(en);

    } // addEnemy()

    /** SET as a monk that will convert Player on collision */
    setMonk(en) {

        en.equipWeapon(Consts.STAFF);
        en.equipArmour(Consts.MASK);
        en.updateTexturesA();
        en.setState(Consts.STATE_UNAWARE).setSpeed(0).playIdle();
        en.noTouch = true;

        this.monks.push(en);

    } // setMonk()


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
                obstacle.setFlipX(true).setSpeed(-40).setState(Consts.STATE_CHARGE).playRun();
            break;

        } // switch (obstacle)

    } // handle()


    //  #   COLLISION CHECKING
    //  ========================================================================

    /** CHECK for any players colliding into any enemies */
    checkEnemyCollisions() {

        const ctrl = this.getCtrl();
        const enCt = this.getEnCtrl();

        loopArray(enCt.all, (en, index) => {

            let player = this.getNextPlayer(en);
            if (player) {
                if (this.checkColliding(en, player)) {

                    if (en.noTouch) {

                        if (player === ctrl.player) {
                            player.hit(100, en);
                            this.getManager().playSound(Consts.SND_GAME_CONVERT);
                        }
                        else {

                            player.setRace(Consts.GOBLIN);
                            player.updateTexturesA().playIdle();
                            player.setState(Consts.STATE_IDLE).setSpeed(0);
                            ctrl.remove(player);

                            this.getManager().showFX(player, 'fg_ex2', 3500);
                            this.getManager().showPuff2(player.x, player.y, 3);

                            this.getManager().playSound(Consts.SND_GAME_CONVERT);

                        } // else ()

                    } // if (monk)
                    else
                        this.clashNormal(en, player);

                } // if (colliding)
            } // if (player found)
            else
                Phaser.Utils.Array.Remove(enCt.all, en);    //  NO more collision possible
        });

    } // checkEnemyCollisions()

    /** NORMAL function to perform for a clash */
    clashNormal(en, player) {

        const enCt = this.getEnCtrl();

        let cp = en.getLeftCenter();
        this.getManager().showClash(cp.x, cp.y, 16);
        this.getManager().playSound(Consts.SND_GAME_CLASH);

        //  #   DAMAGE to Player (if any)

        let dmg = en.decom ? 0 : en.str;
        if (player.hit(dmg, en))
            this.getManager().showFX(player, 'fg_skull', 1500);
        else if (dmg > 0)
            this.flash(player, 0xFF0000);
        let move = Phaser.Math.Between(-1, 1);
        player.moveToLane(player.lane + move);

        //  #   DAMAGE to enemy

        if (en.hit(player.str, player)) {
            enCt.kill(en, player);
            this.kills ++;
        } // if (kill)

    } // clashNormal()

} // END CLASS //
