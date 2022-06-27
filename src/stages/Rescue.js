import Consts from 'classes/Consts.js';
import StageType from 'stages/StageType.js';

/**
* @copyright    Umz
* @classdesc    RESCUE stage for recruiting more characters to team
* @version      0.02
*/
export default class Recsue extends StageType {

    constructor(scene) {
        super(scene);

        this.setObstacleFrames(['cactus', 'knight', 'rocksquare', 'spikeblock', 'spikes', 'tower', 'tree2']);

        //  #   BONUS for rescuing all
        this.rescuees = 0;
        this.rescued = 0;

    } // constructor()

    update(time, delta) {
        super.update(time, delta);

        this.updateTouchable();
        this.checkWinBonus(this.rescuees, this.rescued, 10);    //  ALL rescued bonus

    } // update()


    //  #   LEVEL GENERATION
    //  ========================================================================

    /** @override Generate a level of simple obstacles and cages of team */
    generateLevel() {

        this.generateObstacles(5);

        //  #   REPLACE some of the obstacles with cages

        let amt = Phaser.Math.Between(3, 6);
        for (let i=0; i<amt; i++) {
            let rand = Phaser.Math.Between(0, this.levelConfig.length - 1);
            this.levelConfig[rand] = this.convertToCage(this.levelConfig[rand]);
        } // for (cages)

        this.rescuees = this.levelConfig.filter(obj => obj.fx).length;
        console.log('To grab', this.rescuees)

    } // generateLevel()

    /** CONVERT the obstacle into a cage for recruitment */
    convertToCage(obj) {
        return { ...obj,
            lane: 1,
            image: 'fg_cage',
            dmg: 0,
            fx: 'fg_exclamation',
            runner: true,
            type: Consts.OB_CAGE
        };
    } // convertToCage()


    //  #   TOUCH HANDLING EVENTS
    //  ========================================================================

    /** HANDLE response to valid touch and handle obstacles */
    handle(obstacle) {

        switch (obstacle.getData('type')) {

            case Consts.OB_OBSTACLE:
                this.decom(obstacle);
                this.getCtrl().avoidLane(obstacle.lane);
            break;

            case Consts.OB_CAGE:
                this.openCage(obstacle);
            break;

        } // switch (obstacle)

    } // handle()

    /** OPEN the cage to unlock new Runner for the team */
    openCage(ob) {

        const save = this.scene.save;
        const hud = this.getHUD();
        const manager = this.getManager();
        const ctrl = this.getCtrl();
        const player = this.getPlayer();

        let removeFn = function() {

            this.rescued ++;

            let cp = ob.getCenter();
            manager.showPuff(cp.x, cp.y, 10);

            save.addToSession(Consts.SES_STAGE_RANK_GAIN, 2);    //  2 EXP per Rescue
            player.addExp(1);

            manager.showFX(ob.getData('runner'), 'fg_star', 1500);

            //  #   RECRUIT Player if available to recruit

            if (ctrl.canRecruit()) {
                ctrl.add(ob.getData('runner'));
                hud.updatePlayers(null, ctrl.getTeamData());    //  UPDATE HUD
            } // if (space to recruit)
            else {
                ob.getData('runner').setState(Consts.STATE_RUNNING).playRun().setFlipX(true).setSpeed(-56);
                manager.non.push(ob.getData('runner'));
            } // else (team full)

            player.moveToLane(4);

            this.scene.snd.play(Consts.SND_UI_RUNNERLEVEL);

            //  #   REMOVE cage from Scene

            ob.remove = true;
            ob.addToGarbage('fx');
            ob.setData('runner');
        };

        player.moveToLane(ob.lane, removeFn.bind(this));

    } // openCage()

} // END CLASS //
