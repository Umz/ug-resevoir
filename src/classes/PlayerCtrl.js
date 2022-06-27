import Consts from 'classes/Consts.js';
import Runner from 'classes/Runner.js';

/**
* @copyright    Umz
* @classdesc    PLAYER Controller handles all Player character updating and actions
* @version      0.04
*/
export default class PlayerCtrl {

    //  TO CLEAN (MORE)

    constructor(scene) {

        this.scene = scene;

        this.runners = [];
        this.isChecking = true;

        //  #   LEVEL speed

        this.baseSpeed = 48;
        this.inc = 12;
        this.playSpeed = this.getSpeedByRank();
        this.catchSpeed = this.getCatchSpeed();
        this.slowSpeed = this.playSpeed - 32;

        this.scene.updaters.push(this);

    } // constructor()

    /** UPDATE all characters moving along the screen with Player */
    update(time, delta) {

        //  #   UPDATE runners, remove dead

        for (let i=this.runners.length; --i>=0;) {

            let runner = this.runners[i];

            //  #   SPEED up to catch up when behind

            if (i > 0 && runner.state === Consts.STATE_RUNNING) {
                let front = this.runners[i - 1];
                let gap = (front.x - runner.x);
                let speed = (gap > 16) ? this.catchSpeed : (gap < 12) ? this.slowSpeed : this.playSpeed;
                runner.setSpeed(speed);
            } // if (not leader)

            //  #   ACT according to current state

            switch (runner.state) {
                case Consts.STATE_WAITING:
                    //  #   JOIN running when at the back
                    let lead = this.runners[i - 1];
                    let pX = lead.x - 14;
                    if (runner.x <= pX) {
                        runner.setState(Consts.STATE_RUNNING).playRun();
                        runner.moveToLane(Phaser.Math.Between(3, 9));
                    } // if (right position)
                break;
                case Consts.STATE_OUT:
                    //  #   MOVE to the back of the array
                    if (runner != this.player) {
                        Phaser.Utils.Array.Remove(this.runners, runner);    //  REMOVE
                        this.runners.push(runner);
                    } // if (not player)
                    runner.setState(Consts.STATE_KO);
                break;
                case Consts.STATE_DEAD:
                    Phaser.Utils.Array.Remove(this.runners, runner);    //  REMOVE
                    //  #   UPDATE the HUD
                    let teamData = this.getTeamData();
                    this.scene.scene.get('HUD').updatePlayers(null, teamData);

                    this.scene.snd.play(Consts.SND_GAME_PL_DIE);
                break;
            } // switch(state)

        } // for (runners)

        //  #   AUTO win when player reaches end and auto lose if player dies

        if (this.player.isDead() || this.player.state === Consts.STATE_KO) {
            this.endStage(false);
            this.stopAll();
        }
        else if (this.player.x > this.scene.stageSize)
            this.endStage(true);

    } // update()


    //  #   LOADING PLAYERS
    //  ========================================================================

    /** ADD the main character from data */
    loadPlayer() {

        const camera = this.scene.cameras.main;
        const save = this.scene.save;
        const gen = this.scene.stageGen;

        let pd = save.getPlayerData();
        this.player = gen.generateRunner(pd);
        this.player.setX(0).setLane(5, true).recalcHP().playRun();
        this.runners.push(this.player);

        camera.startFollow(this.player, true, .8, 1, 24);

        return this;

    } // loadPlayer()

    /** ADD the main character team from data */
    loadTeam() {

        const camera = this.scene.cameras.main;
        const save = this.scene.save;
        const gen = this.scene.stageGen;

        let count = 2;
        const dist = 12;
        const team = save.getPlayerTeam();
        for (let i=0; i<team.length; i++) {

            let data = team[i];
            let lane = Phaser.Math.Between(1, 9);

            let runner = gen.generateRunner(data);
            runner.setX(-(dist * (i + 1))).setLane(lane, true).recalcHP().playRun();
            this.runners.push(runner);

            //  #   FLAG bearers - (3) then every 4

            let sf = (i+2) % 4 === 0;
            if (sf && runner.isDoubleEquip()) {
                let flag = (count % 2) == 0 ? 'fg_flag' : 'fg_flag_sword';
                let flagPole = this.scene.add.image(-32, -32, 'atlas', flag).setOrigin(1);
                this.scene.container.add(flagPole);
                runner.carryFlag(flagPole);
                count ++;
            } // if (maxed out)

        } // for (all team members)

        return this;

    } // loadTeam()

    /** ADD a Runner object to this team */
    add(runner) {
        runner.setState(Consts.STATE_WAITING).recalcHP();
        this.runners.push(runner);
    } // add()

    /** REMOVE a runner from this team */
    remove(runner) {
        Phaser.Utils.Array.Remove(this.runners, runner);    //  REMOVE
        let teamData = this.getTeamData();
        this.scene.scene.get('HUD').updatePlayers(null, teamData);
    } // remove()

    //  #   CHECKING THE GROUP
    //  ========================================================================

    /** AVOID the given lane if on a collision course */
    avoidLane(lane) {

        let sm = this.scene.manager;
        let snd = false;

        for (let r of this.runners)
            if (r.lane == lane) {

                let move = Phaser.Math.Between(2, 3);
                let pLane = Math.max(1, Math.min(9, lane + (Math.random() > .5 ? move : -move)));
                let toLane = (lane == 1) ? lane + move : (lane == 9) ? lane - move : pLane;

                r.moveToLane(toLane);
                r.addExp(1);
                sm.showFX(r, 'fg_ex2');

                if (r == this.player)
                    this.scene.save.addToSession(Consts.SES_STAGE_RANK_GAIN, 1);    //  1 EXP per dodge

                snd = true;

            } // if (matching lane)

        if (snd)
            this.scene.manager.playSound(Consts.SND_GAME_AVOIDLANE);

    } // avoidLane()

    /** CHECK if there is space for a new recruit with player (4 per class) */
    canRecruit() {
        let pd = this.scene.save.getRankClass();
        return this.runners.length < (pd.class * 4) + 1;
    } // canRecruit()

    getTeamMax() {
        let pd = this.scene.save.getRankClass();
        return (pd.class * 4) + 1;
    } // getTeamMax()


    //  #   COLLISION AND GAME CHECKS
    //  ========================================================================

    /** GET the next runner in line to collide with given item */
    getNextRunner(ob) {

        //  #   COLLISION happens with object front to Player centre

        for (let runner of this.runners) {
            if (ob.getLeftCenter().x > runner.x && runner.lastCollide != ob)
                return runner;
        } // for (runners)

    } // getNextRunner()

    /** GET the next Runner in line to get equipment */
    getNextEquipper() {

        //  #   PRIORITISE front runners, for ANY weapon or armour, then BETTER

        let equip = this.runners.find(r => r.isNaked() && r.isAvailable());                 //  NAKED
        if (!equip) equip = this.runners.find(r => r.isSingleEquip() && r.isAvailable())    //  1 ITEM
        if (!equip) equip = this.runners.find(r => r.isNoMax() && r.isAvailable())          //  NO MAX
        if (!equip) equip = this.runners.find(r => r.isSingleMax() && r.isAvailable())      //  1 MAX

        return equip;   //  ALL maxed returns a null

    } // getNextEquipper()


    //  #   GROUP CONTROLS
    //  ========================================================================

    /** SET the speed of all characters */
    setSpeed(spd) {
        for (let r of this.runners)
            r.setSpeed(spd);
    } // setSpeed()

    /** GET the current speed of the Runners (calculated by Zone) */
    getSpeedByRank() {
        const zone = sessionStorage.getItem(Consts.SES_STAGE_ZONE) || 1;
        let speed = this.baseSpeed + (this.inc * zone);
        return speed;
    } // getSpeedByRank()

    /** GET the speed to catch up to character */
    getCatchSpeed() {
        return this.getSpeedByRank() + 16;
    } // getCatchSpeed()

    /** START all the Sprites running */
    startAll() {
        for (let r of this.runners)
            r.setState(Consts.STATE_RUNNING).setSpeed(this.playSpeed).playRun(Phaser.Math.Between(0, 100));
    } // startAll()

    /** STOP all the Sprites running */
    stopAll() {
        for (let r of this.runners) {
            if (r.state === Consts.STATE_RUNNING) {
                r.setState(Consts.STATE_IDLE);
                r.stop().setFrame(0);
                r.playIdle();
            } // if (still active)
        } // for (all runners)
    } // stopAll()


    //  #   STATE AND DATA
    //  ========================================================================

    /** GET the current Player Data from this Sprite */
    getPlayerData() { return this.player.pd }

    /** GET the current team data from these Sprites */
    getTeamData() {
        let team = this.runners.slice(1);
        let td = team.map(run => run.pd);
        return td;
    } // getTeamData()

    /** END this Stage when the Player dies or exits */
    endStage(isWin) {
        if (this.isChecking) {
            this.scene.events.emit(Consts.EVENT_GAME_OVER, isWin);

            let snd = (isWin) ? Consts.SND_GAME_CHEER : Consts.SND_GAME_PL_DIE;
            this.scene.snd.play(snd);
        }
        this.isChecking = false;
    } // endStage()

} // END CLASS //
