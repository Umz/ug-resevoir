import Consts from 'classes/Consts.js';
import SaveData from 'classes/SaveData.js';
import TextureGenerator from 'classes/TextureGenerator.js';

const SKIP = false;

/**
* @author       Umz
* @classdesc    PRELOAD loads and creates all assets while showing loading screen
* @version      0.0.02
*/
export default class Preload extends Phaser.Scene {
    constructor() { super({key:'Preload', active:false}) }

    /** LOAD any graphics to be used in the game */
    preload() {

        this.load.setBaseURL('assets/');

        //  #   DISPLAY loading graphics

        const camera = this.cameras.main;
        this.logo = this.add.image(camera.width * .5, camera.height * .5, 'boot_ic');
        this.sound.play('ugpreload', {volume:.5});

        //  #   LOAD GAME ASSETS - Graphical and Fonts

        let font = "seog14";
        this.load.bitmapFont(font, `${font}_1.png`, `${font}.xml`);
        this.load.bitmapFont(`${font}S`, `${font}_S.png`, `${font}.xml`);

        this.load.atlas('atlas', 'atlas.png', 'atlas.json');
        this.load.atlas('environment', 'environment.png', 'environment.json');
        this.load.atlas('characters', 'characters.png', 'characters.json');

        //  #   LOAD ALL SOUNDS

        Consts.SOUNDS.forEach((value, key, map) => {
            let filepath = `snd/${value}.ogg`;
            this.load.audio(value, filepath);
            //console.log('Loaded', key, value);
        });

    } // preload()

    /** SHOW the load screen while creating assets for the game */
    create(data) {

        //  #   CREATE or LOAD the data

        //sessionStorage.clear();
        //localStorage.clear();

        let save = new SaveData();
        save.createDefaults();

        //  #   CREATE the assets needed for the game

        this.createGraphics();
        this.createDefaultCharacters();
        this.createAnimations();

        //  #   TWEEN in the game

        if (SKIP) this.switchScene();
        else this.tweenOut();

    } // create()


    //  #   GRAPHICS creation
    //  ========================================================================

    /** CREATE the graphics and shapes required for the game */
    createGraphics() {

        let graphics = this.make.graphics();

        Square: {
            graphics.fillStyle(0, 1);
            graphics.fillRect(0, 0, 2, 2);
            graphics.generateTexture("_square", 2, 2);
            graphics.clear();
        };

        Blank: {
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillRect(0, 0, 2, 2);
            graphics.generateTexture("_white", 2, 2);
            graphics.clear();
        };

        Shadow_Circle_Gradient: {

            const diameter = 10, radius = diameter * .5;

            for (let i=0; i<10; i++) {

                let alpha = (i + 1) * .1;
                let calcRad = radius * (10 - i) * .1;

                graphics.fillStyle(0x000000, alpha);
                graphics.fillCircle(radius, radius, calcRad);

            } // for (shadow circle)

            graphics.generateTexture("_shadow", diameter, diameter);
        };

        graphics.clear();

    } // createGraphics()

    /** GENERATE the default frames most others will be using */
    createDefaultCharacters() {

        const tgen = new TextureGenerator(this);

        tgen.addSheet(Consts.BLACK);
        tgen.addSheet(Consts.WHITE);
        tgen.addSheet(Consts.ASIAN);

        tgen.addSheet(Consts.GREMLIN);
        tgen.addSheet(Consts.DEMON);
        //  Goblin, etc

    } // createDefaultCharacters()

    /** CREATE any animations that will be used in-game */
    createAnimations() {

        const configButton = {
            key: 'btnSmallPress',
            frames: this.anims.generateFrameNames('atlas', { frames:['_sDown_btn', '_sUp_btn'] }),
            frameRate: 6,
            repeat: -1
        };
        const configFinger = {
            key: 'fingerSmallPress',
            frames: this.anims.generateFrameNames('atlas', { frames:['_sDown_finger', '_sUp_finger'] }),
            frameRate: 6,
            repeat: -1
        };

        this.anims.create(configButton);
        this.anims.create(configFinger);

        const configBoom = {
            key: 'boomAnim',
            frames: this.anims.generateFrameNames('atlas', { prefix:'fx_boom', start:1, end:10 }),
            frameRate: 10,
            repeat: 0
        };
        this.anims.create(configBoom);

    } // createAnimations()


    //  #   LOADING TWEENS
    //  ========================================================================

    /** TWEEN out the logo's one after the other slowly */
    tweenOut() {

        const camera = this.cameras.main;
        const cY = camera.height * .5;

        let timeline = this.tweens.createTimeline();
        timeline.add({
            targets: this.logo,
            delay: 500,
            duration: 500,
            alpha: {from:1, to:0},
            y: {from:cY, to: cY-12},
            onComplete:()=>{ this.logo.setTexture('ugic') }
        });
        timeline.add({
            targets: this.logo,
            duration: 500,
            hold: 500,
            alpha: {from:0, to:1},
            y: {from:cY + 12, to:cY}
        });
        timeline.add({
            targets: this.logo,
            delay: 500,
            duration: 500,
            alpha: {from:1, to:0},
            y: {from:cY, to: cY-12},
            onComplete:()=>{ this.logo.setTexture('ugname') }
        });
        timeline.add({
            targets: this.logo,
            duration: 500,
            hold: 500,
            alpha: {from:0, to:1},
            y: {from:cY + 12, to:cY}
        });
        timeline.add({
            targets: this.logo,
            delay: 500,
            duration: 500,
            alpha: {from:1, to:0},
            y: {from:cY, to: cY-12},
            onComplete: this.switchScene,
            onCompleteScope: this,
        });
        timeline.play();

    } // tweenOut()

    /** SWITCH the scene to */
    switchScene() {
        this.scene.start('Menu');
        this.scene.launch('HUD');
        this.scene.launch('Feedback');
    } // switchScene()

} // END CLASS //
