import Consts from 'classes/Consts.js';
import Runner from 'classes/Runner.js';
import Obstacle from 'classes/Obstacle.js';

/**
* @copyright    Umz
* @classdesc    GENERATOR of all data used to build the stage elements
* @version      0.05
*/
export default class StageGen {

    constructor(scene) {
        this.scene = scene;
    } // constructor()


    //  #   RESCUE MISSION
    //  ========================================================================

    /** GET the full obstacle object with all parts */
    spawnObstacle(config) {

        let obstacle = this.generateSprite(config.x, config.lane, config.image);    //  MAIN
        obstacle.setAll({
            dmg: config.dmg,
            type: config.type
        });

        //  #   RUNNER stuck in cage

        if (config.runner) {
            let bg = this.generateRunner(this.getRunnerConfig());
            bg.setX(config.x).setLane(config.lane, true).setLane(config.lane).playIdle();
            obstacle.setData('runner', bg);
        } // if (bg character)

        //  #   FX pointer or indicator etc.

        if (config.fx)
            obstacle.setData('fx', this.generateFX(obstacle.getData('runner'), config.fx));

        return obstacle;

    } // spawnObstacle()

    /** GET the enemy object in full */
    spawnEnemy(config) {

        let data = this.getEnemyConfig(config.type);
        let en = this.generateRunner(data);
        en.setX(config.x).setLane(config.lane, true).setLane(config.lane).playIdle();
        en.setData('type', config.type);
        en.type = config.type;
        en.garbage = [];

        return en;

    } // spawnEnemy()


    //  #   NON-INTERACTIVE
    //  ========================================================================

    /** SPAWNS an Runner Sprite (Obstacle) in the given lane - for non-interactive use */
    spawnBody(x, lane) {

        let conf = this.getRunnerConfig();
        let body = this.generateRunner(conf);
        body.setX(x).setLane(lane, true).setFrame(4);
        body.garbage = [];
        return body;

    } // spawnBody()


    //  #   CONFIGS
    //  ========================================================================

    /** GET a runner Sprite config for the Rescue */
    getRunnerConfig() {

        const save = this.scene.save;

        let rc = save.getRankClass();

        //  #   WEAPON and ARMOUR change according to level (no weapons if caged)

        const zone = sessionStorage.getItem(Consts.SES_STAGE_ZONE) || 1;

        let maxXP = Math.max(0, ((zone - 1) * 50) - 1);
        let minXP = Math.max(0, maxXP - 50);
        let startXP = Phaser.Math.Between(minXP, maxXP);

        let aLv = Math.max(0, (zone - 3));
        let armour = (aLv > 0) ? aLv + 100 : 0;

        let race = Phaser.Utils.Array.GetRandom([Consts.BLACK, Consts.ASIAN, Consts.WHITE]);
        return {race:race, armour:armour, weapon:Consts.NONE, exp:startXP, newXP:0};

    } // getRunnerConfig()

    /** GET the config for an enemy runner */
    getEnemyConfig(race) {
        let config = {race:race, armour:Consts.NONE, weapon:Consts.NONE, exp:0};
        return config;
    } // getEnemyConfig()


    //  #   GENERATORS
    //  ========================================================================

    /** GENERATE a new Runner object with the given data */
    generateRunner(data) {

        const texgen = this.scene.tgen;
        const sheet = texgen.getSheet(data.race, data.armour, data.weapon);

        let runner = new Runner(this.scene, -24, -24, sheet.name);
        runner.setPlayerData(data).setSheet(sheet);

        this.scene.container.add(runner);
        this.scene.events.emit(Consts.EVENT_ADD_SHADOW, runner);

        return runner;

    } // generateRunner()

    /** GENERATE a new Sprite for the stage, with lane, data and shadow */
    generateSprite(x, lane, frame) {

        const obs = new Obstacle(this.scene, x, 0, 'atlas', frame);
        obs.setLane(lane);

        this.scene.container.add(obs);
        this.scene.events.emit(Consts.EVENT_ADD_SHADOW, obs);
        return obs;

    } // generateSprite()

    /** GENERATE the FX item that indicates or points to main sprite */
    generateFX(target, frame, tween) {

        let pos = target.getCenter();
        let fx = this.scene.add.image(pos.x, pos.y, 'atlas', frame).setOrigin(.5, 1).setDepth(190);

        this.scene.tweens.add({
            targets: fx,
            duration: 750,
            loop: true,
            repeat: -1,
            yoyo: true,
            y: {from: pos.y - 4, to: pos.y - 14},
            ease: 'Cubic'
        });

        return fx;

    } // generateFX()

} // END CLASS //
