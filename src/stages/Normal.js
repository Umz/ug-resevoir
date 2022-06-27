import Consts from 'classes/Consts.js';
import StageType from 'stages/StageType.js';

/**
* @copyright    Umz
* @classdesc    RESCUE stage for recruiting more characters to team
* @version      0.02
*/
export default class Normal extends StageType {

    constructor(scene) {
        super(scene);

        this.setObstacleFrames(['knight', 'spikeblock']);
        this.setEnemyTypes(this.getEnemyTypes());

        //  #   RESCUE Specific variables

        this.totalEnemies = 0;

    } // constructor()

    update(time, delta) {
        super.update(time, delta);

        this.sortObstaclesByX();

        //  #   INTERACTIVE

        this.updateTouchable();
        this.checkEnemyCollisions();

        this.checkWinBonus(this.kills, this.totalEnemies, 10);      //  KILL all bonus

    } // update()


    //  #   LEVEL GENERATION
    //  ========================================================================

    /** @override Generate a level of simple obstacles with enemies between */
    generateLevel() {

        let amt = Phaser.Math.Between(5, 10);   //  Enemies per block
        let reps = 3;
        let length = reps + 2;

        //  #   ITERATE for level length

        this.getManager().setStageLengths(length);
        for (let i=0; i<reps; i++) {

            let start = 1 + i;
            this.generateObstacleSet(start + .5, .5, 3);
            this.generateEnemyGroup(start + .25, .5, amt);

        } // for (reps)

        this.totalEnemies = this.lvlEnemies.length;     //  TOTAL enemies for bonus

        //  #   BACKGROUND to banners

        const bg = this.scene.background;
        bg.setCustomDecor('bg', ['banner2', 'banner3']);
        //bg.setCustomDecor('bg', ['hut1', 'hut2', 'post', 'pot']);
        bg.setCustomDecor('fg', ['banner1', 'banner4']);

    } // generateLevel()


    //  #   COLLISION HANDLING
    //  ========================================================================

    /** HANDLE response to valid touch and handle obstacles */
    handle(ob) {

        switch (ob.getData('type')) {

            case Consts.OB_OBSTACLE:
                this.decom(ob);
                this.getCtrl().avoidLane(ob.lane);
            break;

            case Consts.GREMLIN:
            case Consts.GOBLIN:
            case Consts.OGOBLIN:
            case Consts.DEMON:
            case Consts.DOG:
                this.decom(ob);
            break;

        } // switch (obstacle)

    } // handle()


} // END CLASS //
