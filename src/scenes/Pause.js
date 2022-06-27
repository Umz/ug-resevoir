import Consts from 'classes/Consts.js';
import KeyControls from 'classes/KeyControls.js';
import Snd from 'classes/Snd.js';

/**
* @author       Umz
* @classdesc    PAUSE scene shows continue or exit options over Stage
* @version      0.0.03
*/
export default class Pause extends Phaser.Scene {
    constructor() { super({key:'Pause', active:false}) }

    /** CREATE the menu in place and tween in- always the same */
    create(data) {

        const camera = this.cameras.main;
        const cX = camera.width * .5;
        const cY = camera.height * .5;
        const width = camera.width;
        const height = camera.height;

        this.keys = new KeyControls(this);
        this.snd = new Snd(this);

        let cover1 = this.add.image(cX, cY, '_square').setDisplaySize(width, height).setAlpha(.4);
        let cover2 = this.add.image(cX, cY, '_square').setDisplaySize(width * .5, height * .5).setAlpha(.4);
        cover1.setInteractive().on('pointerdown', ()=>{});

        let coverTween = this.tweens.createTimeline();
        coverTween.add({
            targets: cover1,
            duration: 250,
            scaleX: {start:0, from:0, to:cover1.scaleX},
            scaleY: {start:0, from:0, to:cover1.scaleY}
        });
        coverTween.add({
            targets: cover2,
            duration: 250,
            scaleX: {start:0, from:0, to:cover2.scaleX},
            scaleY: {start:0, from:0, to:cover2.scaleY},
            ease: 'Back.Out'
        });
        coverTween.play();

        //  #   INFO on top of the boxes

        let scene = this.scene.get('Stage');
        let music = scene.music;
        music.setVolume(.1);

        let slogo = this.add.image(cX, cover2.getTopCenter().y, 'atlas', '_reservoir');

        let resume = this.add.bitmapText(cX, cY - 6, 'seog14', 'RESUME').setOrigin(.5).setScale(1.5).setTint(0xffe091).setDepth(5);
        let exit = this.add.bitmapText(cX, cY + 24, 'seog14', 'EXIT').setOrigin(.5).setScale(1.5).setTint(0xe73f08).setDepth(5);
        let hud = this.scene.get('HUD');

        let resFn = ()=> {

            hud.input.keyboard.enabled = true;
            this.snd.play(Consts.SND_UI_SELECT);

            music.setVolume(.4);

            this.keys.resetSelect();
            this.scene.resume('Stage');
            this.scene.stop();
        };
        resume.setInteractive().once('pointerdown', resFn, this);

        let exitFn = ()=> {

            hud.input.keyboard.enabled = true;
            this.snd.play(Consts.SND_UI_SELECT);

            music.stop();
            music.destroy();

            this.keys.resetSelect();
            this.scene.stop('Stage');
            this.scene.start('Menu');
        };
        exit.setInteractive().once('pointerdown', exitFn, this);

        const resKey = {ic:resume, fn:resFn};
        const exitKey = {ic:exit, fn:exitFn};

        //  #   TWEEN in the pause

        let btnTween = this.tweens.createTimeline();
        btnTween.add({
            targets: slogo,
            duration: 500,
            alpha: {start:0, from:0, to:1},
            y: {from:slogo.y + 8, to:slogo.y}
        });
        btnTween.add({
            targets: resume,
            duration: 250,
            alpha: {start:0, from:0, to:1},
            y: {from:resume.y + 8, to:resume.y}
        });
        btnTween.add({
            targets: exit,
            duration: 250,
            alpha: {start:0, from:0, to:1},
            y: {from:exit.y + 8, to:exit.y},
            onComplete: ()=>{
                this.keys.assignPause([resKey, exitKey]);
            }
        });
        btnTween.play();

    } // create()

    update(number, delta) {}

} // END CLASS //
