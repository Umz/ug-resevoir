import Consts from 'classes/Consts.js';
import SaveData from 'classes/SaveData.js';
import TextureGenerator from 'classes/TextureGenerator.js';
import KeyControls from 'classes/KeyControls.js';
import Snd from 'classes/Snd.js';

/**
* @author       Umz
* @classdesc    HUD Shows above the game screen
* @version      0.02.04
*/
export default class HUD extends Phaser.Scene {

    //  TO CLEAN

    constructor() {
        super({key:'HUD', active:false});
    } // constructor()

    /** CREATE the HUD scene and basic holder elements */
    create(data) {

        this.save = new SaveData();
        this.fns = new Map();      //  KEY-FN pair for showing elements

        this.tgen = new TextureGenerator(this);
        this.keys = new KeyControls(this);
        this.snd = new Snd(this);

        this.group = this.add.group();

        //  #   DEFAULTS to add to fns

        this.fns.set(Consts.NONE, ()=>{ this.group.setVisible(false) });

        this.createLevelSelect();
        this.createPlayers();
        this.createRank();
        this.createPause();

        this.createITCN();      // ITCN
        this.createOptions();   //  OPTIONS

        this.createPlayButton();

        this.group.setVisible(false);

        //  #   EVENTS to listen for

        this.scene.get('Feedback').events.on(Consts.EVENT_MENU_READY, ()=>{
            this.showElements([Consts.HUD_PLAYER, Consts.HUD_RANK, Consts.HUD_LEVEL_SELECT, Consts.HUD_ITCN, Consts.HUD_OPTIONS]);
        });

        //  #   HUD premade sets

        this.events.on(Consts.EVENT_HUD_STAGENAME, (n)=>{ this.showStageName(n) });
        //this.events.on(Consts.EVENT_HUD_STAGEDATA, (n)=>{ this.showStageName(n) });

        this.events.on(Consts.EVENT_HUD_SHOW, (arr)=>{ this.showElements(arr) })
        this.events.on(Consts.EVENT_HUD_SHOW_GAME, (arr)=>{ this.showElements([Consts.HUD_PLAYER, Consts.HUD_PAUSE]) });
        this.events.on(Consts.EVENT_HUD_SHOW_MENU, (arr)=>{
            this.showElements([Consts.HUD_PLAYER, Consts.HUD_RANK, Consts.HUD_LEVEL_SELECT, Consts.HUD_ITCN, Consts.HUD_OPTIONS])
            this.hideButtonIndicator();
            this.hideButton();
            this.disableTouchStage();
        });

    } // create()

    /** SHOW or hide HUD elements according to id */
    showElements(id) {

        if (!this.group) return;    //  NOT initialised yet

        this.keys.resetSelect();

        this.group.setVisible(false);
        for (let ele of this.group.getChildren())
            this.tweens.killTweensOf(ele);

        let ids = Array.isArray(id) ? id : [id];
        for (let fnID of ids) {
            let fn = this.fns.get(fnID);
            fn();
        } // for (all to call)

    } // showElements

    /** CREATE ITCN number and icon to show on Menu */
    createITCN() {

        let camera = this.cameras.main;
        let bY = camera.height - 12;
        let itcn = this.add.image(12, bY, 'atlas', '_itcn').setOrigin(0, 1);
        let id = this.add.bitmapText(30, itcn.getCenter().y, 'seog14S', 'RC1001C').setOrigin(0, .5).setScale(1).setTint(0xCCCCCC);

        this.fns.set(Consts.HUD_ITCN, ()=>{

            let timeline = this.tweens.createTimeline();
            timeline.add({
                targets: [itcn, id],
                duration: 1000,
                alpha: {start:0, from:0, to:1}
            });
            timeline.play();

            id.setVisible(true);
            itcn.setVisible(true);
        });

        this.group.addMultiple([itcn, id]);

    } // createITCN

    /** CREATE Options on the bottom right of the screen */
    createOptions() {

        let camera = this.cameras.main;
        let y = camera.height - 12;
        let x = camera.width - 12;

        let popFn = (tar, frame)=>{
            this.tweens.add({
                targets: tar,
                duration: 500,
                scaleX: 2,
                scaleY: 2,
                yoyo: true,
                onComplete:()=>{tar.setFrame(frame)}
            });
        };

        let fsFn = ()=>{
            this.snd.play(Consts.SND_UI_SELECT);
            this.tweens.killTweensOf(fullscreen);
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
                fullscreen.setFrame('_fullscreen');
            } else {
                this.scale.startFullscreen();
                popFn(fullscreen, '_exit_fullscreen');
            }
        };
        let fullscreen = this.add.image(x, y, 'atlas', '_fullscreen').setOrigin(1).setInteractive().on('pointerdown', fsFn);

        //  #   HERO select button

        let heroFn = ()=>{
            this.snd.play(Consts.SND_UI_SELECT);
            this.scene.get('Feedback').createHeroSelect();
            this.keys.resetSelect();
        };
        let hero = this.add.image(x - 28, y, 'atlas', '_switchHero').setOrigin(1).setInteractive().on('pointerdown', heroFn, this);

        //  CLEAR data?
        //  #   ADD all to group and command

        let keysAll = [{ic:fullscreen, fn:fsFn}, {ic:hero, fn:heroFn}];
        let all = [fullscreen, hero];
        this.fns.set(Consts.HUD_OPTIONS, ()=>{

            let timeline = this.tweens.createTimeline();
            timeline.add({
                targets: all,
                duration: 1000,
                alpha: {start:0, from:0, to:1}
            });
            timeline.play();

            this.keys.assignHUDMenu(keysAll);

            for (let img of all) img.setVisible(true);
        });
        this.group.addMultiple(all);

    } // createOptions()

    /** CREATE the button to press to play the game */
    createPlayButton() {

        let camera = this.cameras.main;
        let cX = camera.width * .5;
        let cY = camera.height * .5;

        let frame = (true) ? 'btn' : 'finger';
        let frames = {
            bUp: `_bUp_${frame}`,
            bDown: `_bDown_${frame}`,
            sUp: `_sUp_${frame}`,
            sDown: `_sDown_${frame}`,
            anim: `${frame}SmallPress`
        };
        const {bUp,bDown,sUp,sDown,anim} = frames;

        let pressButton = this.add.sprite(cX, cY + 20, 'atlas', 'sky_cloud3');
        pressButton.setInteractive().on('pointerdown', ()=>{
            bBtn.setFrame(bDown);
            this.events.emit(Consts.EVENT_HUD_BUTTON);
        });
        pressButton.setInteractive().on('pointerup', ()=>{ bBtn.setFrame(bUp) });
        pressButton.setDisplaySize(camera.width, camera.height - 40).setAlpha(.01);

        let bBtn = this.add.sprite(cX, camera.height - (12 + 14), 'atlas', bUp);
        let bCross = this.add.sprite(cX, camera.height - (12 + 14), 'atlas', '_cross');

        //  #   KEY controls

        //  #   CLEARS so stops-? HACK-
        this.addPlayKey = ()=>{

            this.keys.assignHUDGamePlay(()=>{
                this.events.emit(Consts.EVENT_HUD_BUTTON);
                bBtn.setFrame(bDown);
            });
            this.input.keyboard.on('keyup-Z', ()=>{ bBtn.setFrame(bUp) });  //  Additional

        } // addPlayKey()

        let sbtn = this.add.sprite(cX + 22, camera.height * .57, 'atlas', sUp).play(anim);
        let sCross = this.add.sprite(cX + 22, camera.height * .57, 'atlas', '_crossSmall');

        //  #   FUNCTIONS created here to access vars instead of using members

        const setVis =  function(objs, vis) { for (let o of objs) o.setVisible(vis) }

        //  #   SHOW and HIDE buttons indicating touch

        this.showButtonIndicator = function(crossed = false) { setVis([sbtn], true); setVis([sCross], crossed) };
        this.hideButtonIndicator = function() { setVis([sbtn, sCross], false) };
        this.showButton = function(crossed = false) { setVis([bBtn], true); setVis([bCross], crossed) };
        this.hideButton = function() { setVis([bBtn, bCross], false) };

        this.enableTouchStage = () => { pressButton.setVisible(true) };
        this.disableTouchStage = () => { pressButton.setVisible(false) };

        //  #   ALL are off to begin with

        this.hideButtonIndicator();
        this.hideButton();
        this.disableTouchStage();

    } // createPlayButton()

    //  #   PLAYER STATS
    //  ========================================================================

    /** ADD all Players to display along top */
    createPlayers() {

        //  #   LOAD Player info from storage

        let pd = this.save.getPlayerData();
        const sheet = this.tgen.getSheet(pd.race, pd.armour, pd.weapon);

        this.all = [];
        this.playerIcon = this.add.image(12, 12, sheet.name).setOrigin(0).setFrame(0);
        this.playerName = this.add.bitmapText(30, 14, 'seog14', 'UMZ').setOrigin(0);

        this.fns.set(Consts.HUD_PLAYER, ()=>{

            this.updatePlayers();   //  UPDATE icons, amounts and equip

            let timeline = this.tweens.createTimeline();
            timeline.add({
                targets: this.playerIcon,
                duration: 500,
                alpha: {start:0, from:0, to:1},
                x: {start:0, from:0, to:12},
                ease: 'Back.Out'
            });
            timeline.add({
                targets: this.playerName,
                duration: 250,
                alpha: {start:0, from:0, to:1},
                x: {start:0, from:0, to:30},
                ease: 'Cubic.Out'
            });

            //  #   EACH head of the team members

            for (let member of this.all) {
                timeline.add({
                    targets: member,
                    duration: 100,
                    alpha: {start:0, from:0, to:1},
                    y: {from:member.y - 12, to:member.y},
                    ease: 'Back.Out'
                });
            } // for (team heads)

            timeline.play();

            //  #   SET all to visible

            this.playerIcon.setVisible(true);
            this.playerName.setVisible(true);
            for (let p of this.all)
                p.setVisible(true);
        });

        this.group.addMultiple([this.playerIcon, this.playerName]);

    } // createPlayers()

    /** UPDATE the Player display according to current info saved in data storage */
    updatePlayers(playerData, teamData) {

        //  #   MAIN Character update first

        let pd = playerData || this.save.getPlayerData();
        const sheet = this.tgen.getSheet(pd.race, pd.armour, pd.weapon);
        this.playerIcon.setTexture(sheet.name);
        this.playerIcon.setFrame(0);
        this.playerName.setText(pd.name);

        //  #   CLEAR the current while

        for (let head of this.all)
            this.group.remove(head, true, true);
        this.all.length = 0;

        //  #   CREATE faces for all of the characters in team

        let team = teamData || this.save.getPlayerTeam();
        for (let data of team) {

            let sheet = this.tgen.getSheet(data.race, data.armour, data.weapon);
            let face = this.add.image(12, 12, sheet.name).setFrame(0).setCrop(0, 0, 20, 10);
            this.all.push(face);

        } // for (all team)
        Phaser.Actions.GridAlign(this.all, {
            x: 12,
            y: 34,
            width: 10,
            height: 3,
            cellWidth: 8,
            cellHeight: 8
        });
        this.group.addMultiple(this.all);

    } // updatePlayers()

    //  #   PLAYER RANK
    //  ========================================================================

    /** CREATE the rank information to be displayed on the menu screen */
    createRank() {

        let camera = this.cameras.main;
        let rX = camera.width - 12;

        let index = 2;
        let all = ['normal', 'hero', 'warrior', 'champion', 'elite', 'legendary'];
        this.classIC = this.add.image(rX, 12, 'atlas', `class_normal`).setOrigin(1,0);

        this.rankName = this.add.bitmapText(rX - 20, 12, 'seog14', 'FEARLESS').setOrigin(1, 0).setScale(1.1);
        this.className = this.add.bitmapText(rX - 20, 24, 'seog14', 'Hero').setOrigin(1, 0);

        this.classIC.setInteractive().on('pointerdown', ()=>{
            let texture = all[index - 1];
            this.classIC.setFrame(`class_${texture}`);
            index = (index % all.length) + 1;
        });

        this.fns.set(Consts.HUD_RANK, ()=>{

            this.updateRank();

            let timeline = this.tweens.createTimeline();
            timeline.add({
                targets: this.classIC,
                duration: 500,
                alpha: {start:0, from:0, to:1},
                x: {start:camera.width, from:camera.width, to:rX},
                ease: 'Back.Out'
            });
            timeline.add({
                targets: this.rankName,
                duration: 250,
                alpha: {start:0, from:0, to:1},
                x: {start:camera.width, from:camera.width, to:rX - 20},
                ease: 'Cubic.Out'
            });
            timeline.add({
                targets: this.className,
                duration: 250,
                alpha: {start:0, from:0, to:1},
                x: {start:camera.width, from:camera.width, to:rX - 20},
                ease: 'Cubic.Out'
            });
            timeline.play();

            this.classIC.setVisible(true);
            this.className.setVisible(true);
            this.rankName.setVisible(true);
        });
        this.group.addMultiple([this.classIC, this.className, this.rankName]);

    } // createRank()

    /** UPDATE the current rank, tite and icon of the Player */
    updateRank() {

        let data = this.save.getRankClass();
        let cl = Math.ceil (data.rank / 5);
        let rank = data.rank;
        let file = Consts.CLASSES.get(cl).toLowerCase();

        this.classIC.setFrame(`class_${file}`);
        this.className.setText(Consts.CLASSES.get(cl));
        this.rankName.setText(Consts.RANKS.get(rank));

    } // updateRank

    //  #   LEVEL DETAILS AND PAUSE
    //  ========================================================================

    /** CREATE the level information for in stage */
    createPause() {

        let camera = this.cameras.main;
        let rX = camera.width - 12;

        this.stageName = this.add.bitmapText(rX - 24, 14, 'seog14', 'BLESSED SPRINGS').setOrigin(1, 0);

        let pause = this.add.image(rX, 12, 'atlas', '_pause').setOrigin(1,0);
        let pauseFn = ()=>{

            this.snd.play(Consts.SND_UI_PAUSE);

            this.scene.pause('Stage');
            this.scene.launch('Pause');
            this.input.keyboard.enabled = false;
        };
        pause.setInteractive().on('pointerdown', pauseFn);

        this.fns.set(Consts.HUD_PAUSE, ()=>{

            let timeline = this.tweens.createTimeline();
            timeline.add({
                targets: pause,
                duration: 500,
                alpha: {start:0, from:0, to:1},
                x: {start:camera.width, from:camera.width, to:rX},
                ease: 'Back.Out',
                onComplete: ()=>{
                    this.keys.assignHUDGamePause(pauseFn);
                    this.addPlayKey();
                }
            });
            timeline.add({
                targets: this.stageName,
                duration: 250,
                alpha: {start:0, from:0, to:1},
                x: {start:camera.width, from:camera.width, to:rX - 24},
                ease: 'Cubic.Out'
            });
            timeline.play();

            this.stageName.setVisible(true);
            pause.setVisible(true);
        });
        this.group.addMultiple([pause, this.stageName]);

    } // createPause()

    /** SHOW the name of the stage on the HUD */
    showStageName(name) {

        const camera = this.cameras.main;
        const cX = camera.width * .5;
        const cY = camera.height * .5;
        const width = camera.width;
        const height = camera.height;

        let cover = this.add.image(cX, cY, '_square').setDisplaySize(width * .5, height * .2).setAlpha(.3);
        let title = this.add.bitmapText(cX, cY, 'seog14', name).setOrigin(.5).setScale(1.5);
        this.stageName.setText(name);

        let tl = this.tweens.createTimeline();
        tl.add({
            targets: cover,
            duration: 250,
            scaleX: {start:0, from:0, to:cover.scaleX},
            scaleY: {start:0, from:0, to:cover.scaleY},
            ease: 'Back.Out'
        });
        tl.add({
            targets: title,
            duration: 500,
            alpha: {start:0, from:0, to:1},
            y: {from:title.y + 8, to:title.y}
        });
        tl.add({
            targets: [title, cover],
            alpha: 0,
            delay: 1000,
            onComplete:()=>{
                title.destroy();
                cover.destroy();
            }
        });
        tl.play();

    } // showStageName()

    //  #   MENU ITEMS
    //  ========================================================================

    /** SETUP the elements that will need to show on the menu screen */
    createLevelSelect() {

        const logoH = 100, logoHalf = 50;
        let slogo = this.add.image(240, -logoHalf, 'atlas', '_reservoir').setOrigin(.5, 0);
        let select = this.add.bitmapText(240, -20, 'seog14', 'LEVEL SELECT').setOrigin(.5, 0).setTint(0x1874b3);

        //this.showElements([Consts.HUD_PLAYER, Consts.HUD_RANK, Consts.HUD_LEVEL_SELECT]);

        //  -   ADD to group and fns

        this.group.addMultiple([slogo, select]);
        this.fns.set(Consts.HUD_LEVEL_SELECT, ()=>{

            //  #   ANIMATE the logo in

            let timeline = this.tweens.createTimeline();
            timeline.add({
                targets: slogo,
                duration: 500,
                y: {start:-100, from:-100, to:24},
                delay: 500,
                ease: 'Back.Out'
            });
            timeline.add({
                targets: select,
                duration: 500,
                y: {start:-100, from:-100, to:(24 + 50)},
                ease: 'Back.Out'
            });
            timeline.play();

            slogo.setVisible(true);
            select.setVisible(true);

        });

    } // createLevelSelect()

} // END CLASS //
