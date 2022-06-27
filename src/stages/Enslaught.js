import Consts from 'classes/Consts.js';
import StageType from 'stages/StageType.js';

/**
* @copyright    Umz
* @classdesc    ENSLAUGHT is the same as Normal but with many more enemies
* @version      0.02
*/
export default class Enslaught extends StageType {

    constructor(scene) {
        super(scene);

        this.setObstacleFrames(['knight']);
        this.setEnemyTypes(this.getEnemyTypes());

        //  #   BATTLE Specific variables

        this.totalEnemies = 0;

    } // constructor()

    update(time, delta) {
        super.update(time, delta);

        this.sortObstaclesByX();

        //  #   INTERACTIVE

        this.updateTouchable();
        this.checkEnemyCollisions();

        //  #   IF perfect rescue mission (bonus points)

        this.checkWinBonus(this.kills, this.totalEnemies, 5);

    } // update()


    //  #   LEVEL GENERATION
    //  ========================================================================

    /** @override Generate a level of simple obstacles and cages of team */
    generateLevel() {

        this.generateEnemyGroup(1, .75, Phaser.Math.Between(6, 11));
        this.generateEnemyGroup(2, .75, Phaser.Math.Between(6, 11));
        this.generateEnemyGroup(3, .75, Phaser.Math.Between(6, 11));
        this.generateEnemyGroup(4, .75, Phaser.Math.Between(6, 11));

        this.getManager().setStageLengths(5.25);

        this.totalEnemies = this.lvlEnemies.length - 6;     //  TOTAL enemies for bonus

        //  #   SPREAD out Players across all lanes

        for (let run of this.getCtrl().runners)
            run.setLane(Phaser.Math.Between(0, 10), true);

        //  #   BACKGROUND to banners

        const bg = this.scene.background;
        bg.setCustomDecor('bg', ['banner1', 'banner2', 'banner3', 'banner4']);
        bg.setCustomDecor('fg', ['knight']);

    } // generateLevel()

    /** @override addEnemy and optionally equip enemy with weapon and armour */
    addEnemy(config) {

        let en = super.addEnemy(config);

        //  #   CHANCE for weapon and armour

        let wc = (Math.random() > .5);
        let ac = (wc) ? (Math.random() > .5) : false;

        let weapon = this.getEnCtrl().getRandomWeapon(wc);
        let armour = this.getEnCtrl().getChanceArmour(ac);

        en.equipWeapon(weapon);
        en.equipArmour(armour);

        //  #   IF not dead keep running- don't run back in enslaught- out of screen, die

        en.setState(Consts.STATE_CHARGE);

        en.updateTexturesA().playRun();

    } // addEnemy()


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
            break;

        } // switch (obstacle)

    } // handle()


} // END CLASS //
