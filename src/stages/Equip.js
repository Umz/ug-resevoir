import StageType from 'stages/StageType.js';
import Consts from 'classes/Consts.js';
import {loopArray} from 'classes/Common.js';

/**
* @copyright    Umz
* @classdesc    EQUIP Stage is where the player finds new equip and armour for team
* @version      0.02
*/
export default class Equip extends StageType {

    constructor(scene) {
        super(scene);

        this.setObstacleFrames(['tree1','tree2']);  //  JUST trees
        this.boxes = [];    //  TOUCHED boxes

    } // constructor()

    /** RUN through the forest but getting hit doesn't kill (just KO) */
    update(time, delta) {
        super.update(time, delta);

        //  #   INTERACTIVE

        this.updateTouchable();

        //  #   COLLISIONS between Runners and selected boxes

        loopArray(this.boxes, (ob) => {

            let player = ob.getData('target');
            if ((ob.x - player.x) <= 2) {

                this.getManager().showFX(player, 'fg_star', 1000);
                this.flash(player, 0xFFFFFF);
                this.openBox(player);
                player.busy = false;

                ob.remove = true;
                Phaser.Utils.Array.Remove(this.boxes, ob);

            } // if (close by)
        });

    } // update()


    //  #   LEVEL GENERAION
    //  ========================================================================

    /** @override GENERATE a level of thick forestry then boxes then forest */
    generateLevel() {

        const team = this.scene.save.getPlayerTeam();

        //  #   AT least 1 per team member, MAX 14, MIN 4

        let rand = Phaser.Math.Between(4, 14);
        let min = Math.max(team.length, rand);
        let max = Math.min(14, min);

        //  #   2 blocks of trees, 2 blocks of boxes

        this.generateObstacleSet(1, 2, 14);
        this.generateObstacleSet(3, 2, max, (obj) => {
            return { ...obj,
                image: 'bg_chest',
                dmg: 0,
                type: Consts.OB_BOX
            }
        });

        this.getManager().setStageLengths(6);

        //  #   CHANGE the background type

        const bg = this.scene.background;
        bg.setCustomDecor('bg', ['tree1', 'tree2', 'bush']);
        bg.setCustomDecor('fg', ['tree1', 'tree2', 'bush']);

    } // generateLevel()


    //  #   CHECKS
    //  ========================================================================

    /** @override Collisions into trees is non-lethal */
    checkDangerousObstacles() {
        loopArray(this.dangers, (ob, index) => {
            let player = this.getNextPlayer(ob);
            if (player) {
                if (this.checkColliding(ob, player)) {
                    this.flash(player, 0xFFA500);
                    if (player.knock(ob.getData('dmg'), ob)) {
                        this.scene.manager.showFX(player, 'fg_shock', 1500);
                        this.scene.snd.play(Consts.SND_GAME_PL_DIE);
                    }
                } // if (close)
            } // if (player found)
            else
                Phaser.Utils.Array.Remove(this.dangers, ob);
        });
    } // checkDangerousObstacles()


    //  #   TOUCH HANDLER
    //  ========================================================================

    /** HANDLE dodging obstacles and opening boxes (Code Rep) */
    handle(ob) {

        switch (ob.getData('type')) {

            case Consts.OB_OBSTACLE:
                this.decom(ob);
                this.getCtrl().avoidLane(ob.lane);
            break;

            case Consts.OB_BOX:
                this.setToOpenBox(ob);
            break;

        } // switch (obstacle)
    } // handle()

    /** SET runner to open a box containing weapon or armour for  */
    setToOpenBox(ob) {

        let runner = this.getCtrl().getNextEquipper();
        if (runner) {
            runner.busy = true;
            runner.moveToLane(ob.lane);
            this.getManager().showFX(runner, 'fg_ex2');

            ob.setData('target', runner);
            this.boxes.push(ob);
        } // if (runner available)

        this.decom(ob);

    } // setToOpenBox()

    /** OPEN the box and upgrade this Runner */
    openBox(runner) {

        let armour = runner.getALv();
        let weapon = runner.getWLv() - 1;
        let maxWeapon = runner.getWLv();

        //  #   EQUIP 1 item at a time

        if (runner.isNaked()) {
            let isWeapon = (Math.random() > .5);
            if (isWeapon)
                runner.equipWeapon(weapon);
            else
                runner.equipArmour(armour);
        }
        else if (runner.isSingleEquip() || runner.isNoMax()) {
            if (runner.getWeapon())
                runner.equipArmour(armour)
            else
                runner.equipWeapon(weapon);
        }
        else if (runner.isSingleMax()) {
            if (runner.isMaxWeapon())
                runner.equipArmour(armour);
            else
                runner.equipWeapon(maxWeapon);
        } // if (single maxed out)

        runner.updateTexturesA().playRun();

        this.getManager().playSound(Consts.SND_GAME_EQUIP);

        //  #   UPDATE the HUD display

        let playerData = this.getCtrl().getPlayerData();
        let teamData = this.getCtrl().getTeamData();

        this.getHUD().updatePlayers(playerData, teamData);

    } // openBox()

} // END CLASS //
