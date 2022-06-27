import Consts from 'classes/Consts.js';
import StageType from 'stages/StageType.js';
import {loopArray} from 'classes/Common.js';

/**
* @copyright    Umz
* @classdesc    WALL Stage all allies will charge into wall to bring it down
* @version      0.01
*/
export default class Wall extends StageType {

    constructor(scene) {
        super(scene);

        //  #   BUG fix:
        //  Die and stand back up- why does it happen?

        this.setObstacleFrames(['tower']);
        this.setEnemyTypes(this.getEnemyTypes());

        //  #   WALL Specific variables

        this.totalEnemies = 0;

        this.wall = {
            parts: [],
            hp: this.wallHP
        };
        this.failed = false;
        this.enAtt = false;
        this.enSpeed = -56;

        console.log(this.wallHP);

    } // constructor()

    update(time, delta) {
        super.update(time, delta);

        this.sortObstaclesByX();

        //  #   INTERACTIVE

        this.updateTouchable();
        this.checkEnemyCollisions();

        //this.checkWinBonus(this.kills, this.totalEnemies, 10);      //  KILL all bonus

    } // update()


    //  #   LEVEL GENERATION
    //  ========================================================================

    /** @override Generate a level of simple obstacles with enemies between */
    generateLevel() {

        let amt = Phaser.Math.Between(5, 10);   //  Enemies per block
        let reps = 3;
        let length = reps + 2 + .5;

        //  #   ITERATE for level length

        this.getManager().setStageLengths(length);

        //  #   X walls and enemies behind them

        this.genWall(.8);
        this.generateEnemyGroup(.9, 1, Phaser.Math.Between(10, 14));

        this.genWall(2);
        this.generateEnemyGroup(2.2, 1.5, Phaser.Math.Between(10, 14));

        this.genWall(4);
        this.generateEnemyGroup(4.1, 1, Phaser.Math.Between(10, 14))

    } // generateLevel()

    /** GENERATE a wall at the given X */
    genWall(lX) {
        let width = this.scene.cameras.main.width;
        let lanes = Phaser.Utils.Array.NumberArray(0, 10);
        for (let i=0; i<lanes.length; i++) {
            let pX = width * lX;
            let lane = lanes[i];
            let obstacle = this.getRandomObstacleConfig(pX, lane);
            this.levelConfig.push(obstacle);
        } // for (reps)
    } // genWall()

    /** @override ADD obstacle to the Stage */
    addObstacle(config) {
        let obs = super.addObstacle(config);
        this.wall.parts.push(obs);      //  ADD wall to group
        this.enAtt = false;
    } // addObstacle()

    /** @override addEnemy and optionally equip enemy with weapon and armour */
    addEnemy(config) {
        let en = super.addEnemy(config);

        //  #   RESERVE guards are less

        if (this.enAtt) {

            let weapon = this.getEnCtrl().getRandomWeapon(1);
            let armour = this.getEnCtrl().getChanceArmour(1);

            en.equipWeapon(weapon);
            en.equipArmour(armour);
            en.setSpeed(this.enSpeed).setState(Consts.STATE_CHARGE).updateTexturesA().playRun();
        }
        else {
            en.equipWeapon(Consts.SWORD);
            en.equipArmour(Consts.CHAIN);
            en.setSpeed(0).setState(Consts.STATE_WALL).updateTexturesA().playIdle();
        } // full guards

        en.recalcHP();
        en.setHP(en.hp + 3);

    } // addEnemy()


    //  #   COLLISION HANDLING
    //  ========================================================================

    /** HANDLE response to valid touch and handle obstacles */
    handle(ob) {

        switch (ob.getData('type')) {

            case Consts.OB_OBSTACLE:
                for (let p of this.wall.parts)
                    this.flash(p, 0xFFFFFF);
            break;

            default:
                this.decom(ob);
            break;

        } // switch (obstacle)

    } // handle()

    /** COLLISIONS between Players and ojbects (basic) */
    checkDangerousObstacles() {

        if (this.wall.hp <= 0) {

            for (let p of this.wall.parts) {
                this.decom(p);
                Phaser.Utils.Array.Remove(this.dangers, p);
            } // for (all parts)

            this.wallDestroy();

            //  #   CREATE a new wall holder

            this.wall.parts.length = 0;
            this.wall.hp = this.wallHP;

        } // if (wall destroyed)

        //  #   ONLY need to check first - checkColliding custom - checkX not lane

        let wallFail = false;
        loopArray(this.dangers, (ob, index) => {
            let player = this.getNextPlayer(ob);
            if (player) {
                if (this.checkColliding(ob, player)) {

                    player.setSpeed(0).setState(Consts.STATE_IDLE).playIdle();
                    player.hit(0, ob);
                    this.flash(player, 0xFFFFFF);

                    this.getManager().showClash(player.x, player.y, 16);
                    this.getManager().playSound(Consts.SND_GAME_CLASH_B);

                    this.wallCollide(player);

                } // if (close)
            } // if (player found)
            else {
                Phaser.Utils.Array.Remove(this.dangers, ob);
                wallFail = true;
            } // else (failed to destroy)
        });

        //  #   FAILED to break through

        if (wallFail)
            this.isLose = true;

    } // checkDangerousObstacles()

    /** SET this runner as collided with the whole wall */
    wallCollide(runner) {

        this.wall.hp -= runner.str;

        if (this.wall.hp <= 0) {

            const player = this.getCtrl().player;

            //  #   MIX up the order

            Phaser.Utils.Array.Shuffle(this.getCtrl().runners);
            Phaser.Utils.Array.SendToBack(this.getCtrl().runners, player);

            //  #   START the running again

            for (let runner of this.getCtrl().runners) {
                runner.setState(Consts.STATE_WAITING).playIdle();
                runner.setSpeed(0).setX(runner.x - Phaser.Math.Between(8, 18));
            } // for (runners)

            let ps = this.getCtrl().playSpeed;
            player.setState(Consts.STATE_RUNNING).setX(player.x - 12).setSpeed(ps).playRun();

        } // if (wall smashed)

    } // wallCollide()

    /** DESTROY the wall middle section with effect */
    wallDestroy() {

        for (let i=2;i<9;i++) {
            let w = this.wall.parts[i];
            w.remove = true;
            this.getManager().showPuff(w.x, w.y, 6);
        } // for (middle sections)

        //  #   ALL enemies alive to charge

        this.enAtt = true;
        for (let en of this.getEnCtrl().all)
            en.setSpeed(this.enSpeed).setState(Consts.STATE_CHARGE).playRun();

    } // wallDestroy()

    /** GET the next runner in line to collide with given item */
    getNextPlayer(ob) {

        let p = this.wall.parts;
        for (let runner of this.getCtrl().runners) {
            if (ob.getLeftCenter().x > runner.x && !(runner.state === Consts.STATE_IDLE))
                return runner;
        } // for (runners)

    } // getNextPlayer()


    //  #   WALL SPECIFIC
    //  ========================================================================

    /** HP value for the walls */
    get wallHP() {
        let zone = parseInt(sessionStorage.getItem(Consts.SES_STAGE_ZONE));
        let amt = (zone * 4) * 4;   //  ALL armed (Lv. 4)
        return amt;
    } // wallHP

} // END CLASS //
