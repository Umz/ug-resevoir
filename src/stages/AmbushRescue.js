import Consts from 'classes/Consts.js';
import StageType from 'stages/StageType.js';

/**
* @copyright    Umz
* @classdesc    AMBUSH RESCUE a group of allies from between enemies
* @version      0.01
*/
export default class AmbushRescue extends StageType {

    constructor(scene) {
        super(scene);

        this.setObstacleFrames(['spikes']);
        this.setEnemyTypes(this.getEnemyTypes());

        this.touchMin = 40;
        this.touchRange = 32;

    } // constructor()

    update(time, delta) {
        super.update(time, delta);

        this.sortObstaclesByX();

        //  #   INTERACTIVE

        this.updateTouchable();
        this.checkEnemyCollisions();

        //  #   NON-RUNNERS follow along

        let non = this.getManager().non;
        for (let runner of non)
            if (this.getPlayer().x > (runner.x + 104 + runner.gap) && runner.speed === 0) {
                runner.setSpeed(this.getCtrl().playSpeed).playRun();
                this.getManager().showFX(runner, 'fg_ex2', 3000);
            } // if (not moving)

    } // update()


    //  #   LEVEL GENERATION
    //  ========================================================================

    /** @override Generate a level of simple obstacles and cages of team */
    generateLevel() {

        let camera = this.scene.cameras.main;

        this.generateObstacleSet(.75, 1, 9);

        for (let cf of this.generateEnemyGroup(2, .75, 12))
            cf.g1 = true;

        this.generateObstacleSet(4.5, 1, 10);
        for (let cf of this.generateEnemyGroup(5, .75, Phaser.Math.Between(7, 14)))
            cf.g2 = true;

        this.getManager().setStageLengths(6);

        //  #   ALLIES to be rescued

        for (let i=0; i<12; i++) {

            let x = (camera.width * 3) + 72 + (i * 8);
            let body = this.getGen().spawnBody(x, Phaser.Math.Between(0, 10));
            body.gap = Phaser.Math.Between(-8,8) + (i * 16);
            this.getManager().non.push(body);

            //  #   SURVIVORS
            body.equipWeapon(Consts.RING);
            body.equipArmour(Consts.BLUE);
            body.updateTexturesA().playIdle();
            if (Math.random() > .8) {
                let flag = this.scene.add.image(-32, -32, 'atlas', 'fg_flag_sword').setOrigin(1);
                this.scene.container.add(flag);
                body.carryFlag(flag);
            } // if (rand)

        } // for (few bodies)

        for (let run of this.getCtrl().runners)
            run.setLane(Phaser.Math.Between(0, 10), true);

        //  #   BACKGROUND to banners

        const bg = this.scene.background;
        bg.setCustomDecor('bg', ['banner1', 'banner2', 'banner3', 'banner4']);
        bg.setCustomDecor('bg', ['banner1', 'banner2', 'banner3', 'banner4']);

    } // generateLevel()

    /** @override addEnemy and optionally equip enemy with weapon and armour */
    addEnemy(config) {
        let en = super.addEnemy(config);

        if (config.g1)
            this.setGroup1(en);
        else {

            let weapon = this.getEnCtrl().getRandomWeapon(true);
            let armour = this.getEnCtrl().getChanceArmour(true);
            en.equipWeapon(weapon);
            en.equipArmour(armour)

            en.setSpeed(-48).setState(Consts.STATE_CHARGE);
            en.updateTexturesA().playRun();

        } // else (attackers)

    } // addEnemy()

    /** SET this enemy as part of the group behind the Runners */
    setGroup1(en) {

        let weapon = this.getEnCtrl().getRandomWeapon(true);
        en.equipWeapon(weapon);
        en.updateTexturesA();

        en.setFlipX(false).setSpeed(0);
        en.setState(Consts.STATE_UNAWARE).playIdle();

    } // setGroup1()


    //  #   COLLISION HANDLING
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


} // END CLASS //
