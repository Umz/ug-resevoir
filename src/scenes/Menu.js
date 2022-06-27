import Consts from 'classes/Consts.js';
import BGImage from 'classes/BGImage.js';
import CameraDrag from 'classes/CameraDrag.js';
import LocationGenerator from 'classes/LocationGenerator.js';
import TextureGenerator from 'classes/TextureGenerator.js';
import KeyControls from 'classes/KeyControls.js';
import SaveData from 'classes/SaveData.js';
import Snd from 'classes/Snd.js';

/**
* @author       Umz
* @classdesc    PRELOAD loads and creates all assets while showing loading screen
* @version      0.0.02
*/
export default class Menu extends Phaser.Scene {
    constructor() { super({key:'Menu', active:false}) }

    /** CREATE all the objects for displaying the Menu */
    create(data) {

        this.updaters = [];

        //  #   CREATE all objects needed for this class

        this.tgen = new TextureGenerator(this);
        this.save = new SaveData();
        this.keys = new KeyControls(this);
        this.snd = new Snd(this);

        const background = new BGImage(this);
        const locationGen = new LocationGenerator(this);
        const dragger = new CameraDrag(this);

        const prc = this.save.getRankClass();

        const feedback = this.scene.get('Feedback');
        const hud = this.scene.get('HUD');

        //  #   CREATE the Camera size for the scene

        const camera = this.cameras.main;
        camera.setBounds(0, 0, (camera.width * prc.class) + Consts.MENU_CELL, 240);
        camera.fadeIn(500, 0);

        camera.scrollX = sessionStorage.getItem(Consts.SES_MAP_POS) || 0;       //  LAST position

        //  #   BUILD up the Scene

        this.addZoneNames();
        this.addZoneSigns();

        //  #   LOCATION GEN hidden until Menu is ready

        locationGen.pauseLocations();
        this.lgr = function() { locationGen.resumeLocations() };
        feedback.events.on(Consts.EVENT_MENU_READY, ()=>{
            this.showLocation = true;
        });

        hud.events.emit(Consts.EVENT_HUD_SHOW_MENU);   //  SHOW HUD when Menu Ready

        //  #   KEYBOARD

        this.keys.assignMenu(locationGen);

        this.events.on('shutdown', ()=>{ this.keys.resetSelect() });

        //   MUSIC

        this.music = this.snd.play(Consts.MUS_MENU);

    } // create()

    /** HANDLE all updaters for the menu */
    update(number, delta) {

        for (let upd of this.updaters)
            upd.update(number, delta);

        if (this.showLocation)
            this.lgr();

    } // update()


    //  #   ADD ZONES AND NAMES
    //  ========================================================================

    /** ADD the names of the zones on the map */
    addZoneNames() {

        const camera = this.cameras.main;
        const width = camera.width;
        const sX = (width * .5);

        let it = Consts.CLASSES.values();
        for (let i=0; i<Consts.CLASSES.size; i++) {
            let name = `${it.next().value.toUpperCase()} ZONE`;
            this.add.bitmapText((sX + (width * i)), 160 + 16, 'seog14', name).setOrigin(.5).setDepth(4).setAlpha(.6)//.setTint(0x42AD37);
        } // for (names)

    } // addZoneNames()

    /** ADD an interactive sign post at the edge of every zone */
    addZoneSigns() {

        const camera = this.cameras.main;

        const signData = {
            left: "< NORMAL CLASS",
            right: "HERO CLASS >",
            msg: "ONLY Heroes apply.\nGremlins carry knives.\nRun faster!"
            // The good are two, I dare be sworn, and one is dead, and one unborn
        }
        //  Enemies: Expect trouble / Goblins carry knives / Hob Goblins ahead

        for (let i=0; i<Consts.CLASSES.size; i++) {
            let sign = this.add.image(camera.width * (i + 1), 162, 'atlas', 'bg_sign').setDepth(4).setOrigin(.5, 1);
            sign.setInteractive().on('pointerdown', ()=>{

                let fb = this.scene.get('Feedback');
                fb.showMessage('Hey, Listen!', signData);

            });
        } // for (all zones)

    } // addZoneSigns()

} // END CLASS //
