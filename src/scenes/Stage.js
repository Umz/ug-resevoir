import Consts from 'classes/Consts.js';
import BGImage from 'classes/BGImage.js';
import SaveData from 'classes/SaveData.js';
import TextureGenerator from 'classes/TextureGenerator.js';
import Snd from 'classes/Snd.js';

import StageManager from 'classes/StageManager.js';
import StageGen from 'classes/StageGen.js';
import PlayerCtrl from 'classes/PlayerCtrl.js';
import EnemyCtrl from 'classes/EnemyCtrl.js';

/**
* @author       Umz
* @classdesc    STAGE for each level
* @version      0.0.01
*/
export default class Stage extends Phaser.Scene {
    constructor() { super({key:'Stage', active:false}) }

    //  TO CLEAN

    /** CREATE the stage objects and load data for this stage */
    create(data) {

        //  #   VARIABLES from calling Scene

        const stageID = data.id;
        const type = data.type;

        this.stageData = data;
        this.stageSize = (480 * 5);     //  Default (Change in StageManager)

        const camera = this.cameras.main;
        camera.setBounds(0, 0, this.stageSize, 240);
        camera.fadeIn(500, 0);

        //  #   STAGE variables

        this.container = this.add.container().setDepth(166);
        this.group = this.add.group();
        this.updaters = [];

        this.createEvents();

        //  #   OBJECTS used for the stage building and gen

        this.save = new SaveData();
        this.tgen = new TextureGenerator(this);
        this.background = new BGImage(this);
        this.playerCtrl = new PlayerCtrl(this);
        this.enemyCtrl = new EnemyCtrl(this);
        this.manager = new StageManager(this);
        this.stageGen = new StageGen(this);
        this.snd = new Snd(this);

        //  #   ADD all background elements

        this.playerCtrl.loadPlayer().loadTeam();
        this.manager.setup(type);

        this.background.addSky();
        this.background.addPassiveBackground();

        this.playerCtrl.startAll();

        //  #   HUD to show Stage and relevant HUD structure

        const hud = this.scene.get('HUD');
        hud.events.emit(Consts.EVENT_HUD_SHOW_GAME);
        hud.events.emit(Consts.EVENT_HUD_STAGENAME, `BLESSED SPRINGS ${stageID}`);
        hud.enableTouchStage();

        //  #   MUSIC

        let mus = (type === Consts.STAGE_EQUIP) ? Consts.MUS_COLLECT : Consts.MUS_BATTLE;
        this.music = this.snd.play(mus);

        this.snd.play(Consts.SND_GAME_CHEER);

    } // create()

    /** UPDATE the current stage */
    update(time, delta) {

        for (let upd of this.updaters)
            upd.update(time, delta);

        this.container.each(sprite => sprite.update(time, delta));
        this.container.sort('y');

    } // update()


    //  #   STAGE CONTROL
    //  ========================================================================

    /** CREATE the emitters to handle passing data between objects of this Stage */
    createEvents() {

        //  #   TESTING KEYS

        this.input.keyboard.on('keydown-T', ()=>{
            this.playerCtrl.player.x = this.stageSize - 120;
        });
        this.input.keyboard.on('keydown-Y', ()=>{
            this.playerCtrl.player.hit(1000);
        });
        this.input.keyboard.on('keydown-U', ()=>{
            this.playerCtrl.runners[1].hit(50);
        });

        this.input.keyboard.on('keydown-I', ()=>{
            let cam = this.cameras.main;
            this.manager.showPuff(cam.scrollX + 100, 100, 7);
        });
        this.input.keyboard.on('keydown-O', ()=>{
            console.log(this.playerCtrl.player.anims.getFrameName());
        });


        //  #   RESET listeners (remove all)

        for (let ev of [Consts.EVENT_ADD_SHADOW, Consts.EVENT_GAME_OVER, Consts.EVENT_ADD_OBJECT])
            this.events.removeAllListeners(ev);

        //  #   HUD EVENTS to listen for (End level / )

        const hud = this.scene.get('HUD');
        hud.events.removeAllListeners([Consts.EVENT_HUD_BUTTON]);
        hud.events.on(Consts.EVENT_HUD_BUTTON, ()=>{
            this.manager.touch();
        });

        //  #   LEVEL has been complete or failed

        this.events.on(Consts.EVENT_GAME_OVER, (isWin) => {

            for (let upd of this.updaters)
                upd.isChecking = false;

            //  #   PASS exp gained, new team,

            let playerData = this.playerCtrl.getPlayerData();
            let teamData = this.playerCtrl.getTeamData();

            this.save.savePlayerData(playerData);
            this.save.savePlayerTeam(teamData);

            //  #   START the Feedback Scene to show results

            let fb = this.scene.get('Feedback');
            fb.stageComplete(isWin);

            hud.showElements([]);
            hud.hideButtonIndicator();
            hud.hideButton();
            hud.disableTouchStage();

        });

        //  #   ADD a shadow to the given object

        this.events.on(Consts.EVENT_ADD_SHADOW, (obj)=>{
            this.background.addShadow(obj)
        });

    } // createEvents()


    //  #   STAGE SETUP
    //  ========================================================================

    /** GET the Y value for the given lane */
    getLaneY(lane) {
        const minY = 166, maxY = minY + 20;
        return minY + (lane * 2);
    } // getLaneY()

} // END CLASS //
