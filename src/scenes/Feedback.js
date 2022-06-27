import Consts from 'classes/Consts.js';
import SaveData from 'classes/SaveData.js';
import TextureGenerator from 'classes/TextureGenerator.js';
import ExpBar from 'classes/ExpBar.js';
import KeyControls from 'classes/KeyControls.js';
import Snd from 'classes/Snd.js';

import { getBGCover, getRandomName } from 'classes/Common.js';

/**
* @author       Umz
* @classdesc    FEEDBACK for options, level end, level up, messages etc.
* @version      0.02.03
*/
export default class Feedback extends Phaser.Scene {
    constructor() { super({key:'Feedback', active:false}) }

    /** CREATE the stage objects and load data for this stage */
    create(data) {

        this.group = this.add.group();

        this.save = new SaveData();
        this.tgen = new TextureGenerator(this);
        this.keys = new KeyControls(this);
        this.snd = new Snd(this);

        this.showIntroTitle();      //  SHOW Game Title
        //this.showStageComplete();

    } // create

    /** CLEAR everything on scene rather than stopping it */
    clearScene() {

        while (this.group.getFirstAlive()) {
            let member = this.group.getFirstAlive();
            this.tweens.killTweensOf(member);
            this.group.remove(member, true, true);
        } // while (members in group)

        this.keys.resetSelect();

    } // clearScene ()


    //  #   INTRO SCENE
    //  ========================================================================

    /** SHOW the game title intro before the game starts */
    showIntroTitle() {

        const camera = this.cameras.main;
        const cX = camera.width * .5;
        const cY = camera.height * .5;

        let logo = this.add.image(cX, cY, 'atlas', '_reservoir').setScale(1.5);
        let pd = this.save.getPlayerData();

        let timeline = this.tweens.createTimeline();
        timeline.add({
            targets: logo,
            duration: 100,
            //duration: 1000,
            //hold: 1000,
            alpha: {from:0, to:1},
            y: {from:(camera.height * 1.5), to: cY},
            ease: 'Back.Out'
        });
        timeline.add({
            targets: logo,
            duration: 100,
            //duration: 500,
            scaleX: {from:1, to:.5},
            scaleY: {from:1, to:.5},
            y: -cY,
            ease: 'Back.In',
            onComplete:()=>{

                logo.destroy();

                //  -   HUD or SELECT   -
                if (pd.race === -1) this.createHeroSelect();
                else this.events.emit(Consts.EVENT_MENU_READY);
            }
        });
        timeline.play();

    } // showIntroTitle()


    //  #   SHOW EXTRA MESSAGES
    //  ========================================================================

    showMessage(label, {left, right, msg}) {

        const camera = this.cameras.main;
        const cX = camera.width * .5;
        const cY = camera.height * .5;

        const { cover1, cover2, title, timeline } = getBGCover(this, label, {a1:.4, height:cY});

        //  #   ADD all messages to the board

        let topL = cover2.getTopLeft();
        let topR = cover2.getTopRight();

        let leftMsg = this.add.bitmapText(topL.x + 8, topL.y + 28, 'seog14S', left).setOrigin(0);
        let rightMsg = this.add.bitmapText(topR.x - 8, topR.y + 38, 'seog14S', right).setOrigin(1, 0);
        let message = this.add.bitmapText(cX, cY, 'seog14', msg).setOrigin(.5, 0).setCenterAlign();
        message.setLetterSpacing(1);

        //  #   CROSS to close the box

        let tr = cover2.getTopRight();
        let cross = this.add.image(tr.x, tr.y, 'atlas', '_cross2');
        let crossFn = ()=>{
            this.clearScene();
        };
        cross.setInteractive().on('pointerdown', crossFn, this);
        this.group.addMultiple([cover1, cover2, title, cross, message, leftMsg, rightMsg]);

        //  #   TWEEN in all

        timeline.add({
            targets: [message, leftMsg, rightMsg],
            duration: 500,
            alpha: {start:0, from: 0, to: 1}
        });
        timeline.add({
            targets: cross,
            duration: 300,
            alpha: {start: 0, from: 0, to: 1},
            y: {from: cross.y + 32, to: cross.y},
            onComplete: ()=>{
                this.keys.assignRoundEnd(crossFn);
            }
        });
        timeline.play();

    } // showMessage()


    //  #   STAGE COMPLETION
    //  ========================================================================

    /** SHOW stage complete or stage failed */
    stageComplete(isComplete) {
        let res = (isComplete) ? this.showStageComplete : this.showStageFailed;
        res.call(this);
    } // stageComplete()

    /** SHOW the Player Stage has been failed, don't lose any progress */
    showStageFailed() {

        const camera = this.cameras.main;
        const height = camera.height;
        const cX = camera.width * .5;
        const cY = camera.height * .5;

        const { cover1, cover2, title, timeline } = getBGCover(this, 'STAGE FAILED', {a1:.2, a2:.6, height:height});

        //  #   ADD all messages to the board

        title.setTint(0xff5555);
        let sub = this.add.bitmapText(cX, 36, 'seog14', 'Try Again').setOrigin(.5, 0).setCenterAlign();

        //  #   PLAYER image full scale

        let pd = this.save.getPlayerData();
        let sheet = this.tgen.getSheet(pd.race, pd.armour, pd.weapon)
        let sprite = this.add.image(cX, cY - 16, sheet.name).setFrame(4).setScale(4).setTint(0xFF5555);

        //  #   TICK to try again

        let tick = this.add.image(cX, (height * .9), 'atlas', '_tick');
        let tickFn = ()=>{

            this.snd.play(Consts.SND_UI_SELECT);

            this.stopMusic();

            this.scene.stop('Stage');
            this.scene.launch('Menu');
            this.events.emit(Consts.EVENT_MENU_READY);
            this.clearScene();
        };
        tick.setInteractive().on('pointerdown', tickFn, this);
        this.group.addMultiple([cover1, cover2, title, tick, sub, sprite]);

        //  #   TWEEN in all

        timeline.add({
            targets: [sub, sprite],
            duration: 1500,
            alpha: {start:0, from: 0, to: 1}
        });
        timeline.add({
            targets: tick,
            duration: 300,
            delay: 300,
            alpha: {start: 0, from: 0, to: 1},
            y: {from: tick.y + 32, to: tick.y},
            onComplete: ()=>{
                this.keys.assignRoundEnd(tickFn);
            }
        });
        timeline.play();

        //  #   CLEAR any exp gained in the last level, but save teams (no penalty)

        this.save.clearAllXP();
        sessionStorage.removeItem(Consts.SES_STAGE_RANK_GAIN);

    } // showStageFailed()

    /** SHOW the stage complete results whether success or failure */
    showStageComplete() {

        const camera = this.cameras.main;
        const cX = camera.width * .5;
        const cY = camera.height * .5;
        const width = camera.width;
        const height = camera.height;

        const { cover1, cover2, title, timeline } = getBGCover(this, 'STAGE COMPLETE', {a1:.2, height:height});
        title.setTint(0x32CD32);    //  GREEN title

        //  #   DROP in elements during the tween

        const left = cover2.getLeftCenter().x + 12;
        const top = height * .17;

        //sessionStorage.setItem(Consts.SES_STAGE_RANK_GAIN, 133);      //  TEST- gain

        let tick = this.add.image(cX, height * .925, 'atlas', '_tick');
        let tickFn = ()=>{

            this.snd.play(Consts.SND_UI_SELECT);
            this.stopMusic();

            this.scene.stop('Stage');
            this.scene.launch('Menu');
            this.events.emit(Consts.EVENT_MENU_READY);
            this.clearScene();

            //  #   AND for fail
        };
        tick.setInteractive().on('pointerdown', tickFn);

        this.group.addMultiple([cover1, cover2, title, tick]);

        //  #   TWEEN in the elements

        timeline.add({
            targets: cover1,
            duration: 200,
            onComplete: ()=> { this.addRankLevel(left, top) }
        });
        timeline.add({
            targets: cover1,
            duration: 200,
            onComplete: ()=> { this.addHeroLevel(left, top + 40) }
        });
        timeline.add({
            targets: cover1,
            duration: 200,
            onComplete: ()=> { this.addTeamLevels(left, top + 64) }
        });
        timeline.add({
            targets: tick,
            duration: 500,
            alpha: {start: 0, from: 0, to: 1},
            y: {from: tick.y + 32, to: tick.y},
            onComplete: ()=> {
                this.saveStageData()
                this.keys.assignRoundEnd(tickFn);
            }
        });
        timeline.play();

    } // showStageComplete

    /** ADD all the ranking level info to show  */
    addRankLevel(left, top) {

        const camera = this.cameras.main;
        const width = camera.width;

        const pd = this.save.getRankClass();
        const zone = sessionStorage.getItem(Consts.SES_STAGE_ZONE) || 1;
        const gained = sessionStorage.getItem(Consts.SES_STAGE_RANK_GAIN) || 0;
        const addXP = (zone >= pd.class) ? gained : 0;

        let classIC = this.add.image(left, top, 'atlas', `class_normal`).setOrigin(0);
        let rankName = this.add.bitmapText(left + 32, top, 'seog14', 'RANK').setOrigin(0, 0).setScale(1.1);
        let className = this.add.bitmapText(left + 32, top + 12, 'seog14', 'Class').setOrigin(0, 0);

        let bar = new ExpBar(this, (width * .2) - 12);
        bar.setBottomLeft(width * .5, top + 24).setCurrent(pd.exp, 27, 'RANK ');

        //  #   RETURN FN - UPDATE the rank and class names

        let updateClassRank = (tween = true) => {

            let data = this.save.getRankClass();

            let file = Consts.CLASSES.get(data.class).toLowerCase();
            classIC.setFrame(`class_${file}`);
            className.setText(Consts.CLASSES.get(data.class));
            rankName.setText(Consts.RANKS.get(data.rank));

            if (tween) {

                let snd = (data.class != pd.class) ? Consts.SND_UI_RANKCHANGE : Consts.SND_UI_RANKUP;
                if (data.rank != pd.rank || data.class != pd.class)
                    this.snd.play(snd);

                if (data.rank != pd.rank) {
                    this.tweens.add({
                        targets: rankName,
                        duration: 200,
                        alpha: {start:0, from: 0, to:1},
                        x: {from: left, to: left + 32}
                    });
                }

                if (data.class != pd.class) {

                    this.tweens.add({
                        targets: className,
                        duration: 200,
                        delay: 200,
                        alpha: {start:0, from: 0, to:1},
                        x: {from: left, to: left + 32}
                    });
                    this.tweens.add({
                        targets: classIC,
                        duration: 200,
                        delay: 200,
                        alpha: {start:0, from: 0, to:1},
                        x: {from: left-32, to: left}
                    });

                } // if (data class)

            } // if (after bar tween)
        };
        updateClassRank(false);

        bar.showGrowth(parseInt(addXP), 3000, updateClassRank);

        this.group.addMultiple([classIC, rankName, className]);
        this.group.addMultiple(bar.bar);

    } // addRankLevel()

    /** ADD the main Player hero profile and level */
    addHeroLevel(left, top) {

        const camera = this.cameras.main;
        const width = camera.width;
        const barWidth = (width * .4 - 24) - 20;

        const pd = this.save.getPlayerData();
        const sheet = this.tgen.getSheet(pd.race, pd.armour, pd.weapon);

        let playerIcon = this.add.image(left, top, sheet.name).setOrigin(0).setFrame(0);
        let playerName = this.add.bitmapText(left + 20, top, 'seog14', pd.name).setOrigin(0);

        let bar = new ExpBar(this, barWidth);
        bar.setBottomLeft(left + 20, playerIcon.getBottomRight().y).setCurrent(pd.exp, 7, 'Lv.');
        if (pd.newXP > 0)
            bar.showGrowth(pd.newXP, 2500);

        //  TWEEN:: SLIP in both, bar beneath, Lvl beneath

        this.group.addMultiple([playerIcon, playerName]);
        this.group.addMultiple(bar.bar);

    } // addHeroLevel()

    /** ADD exp to each member of the team and show growth for level */
    addTeamLevels(left, top) {

        const camera = this.cameras.main;
        const width = camera.width;

        const team = this.save.getPlayerTeam();

        let fullColumn = (width * .4) - (12 * 2);
        let gap = 2;
        let colWidth = (fullColumn - (gap * 2)) / 3;
        let barWidth = colWidth - 20;

        //  #   3 columns of 8

        for (let row = 0; row < 8; row ++)
            for (let col = 0; col < 3; col ++) {

                let index = (row * 3) + col;        //  HORIZONTAL
                //let index = (col * 8) + row;      //  VERTICAL
                if (index >= team.length) break;

                let rX = left + (col * colWidth) + (col * gap);
                let rY = top + (row * 11);

                let data = team[index];
                let sheet = this.tgen.getSheet(data.race, data.armour, data.weapon);

                let ic = this.add.image(rX, rY - 4, sheet.name).setOrigin(0).setFrame(0).setCrop(0, 0, 20, 14);
                let bar = new ExpBar(this, barWidth);
                bar.setBottomLeft(rX + 20, rY + 10).setCurrent(data.exp, 7);
                if (data.newXP > 0)
                    bar.showGrowth(data.newXP);

                this.group.add(ic);
                this.group.addMultiple(bar.bar);

            } // for (columns)

    } // addTeamLevels()

    /** SAVE the new rank, player and team data from this level then clear storage */
    saveStageData() {

        const rankData = this.save.getRankClass();

        let addRankXP = parseInt(sessionStorage.getItem(Consts.SES_STAGE_RANK_GAIN)) || 0;
        let newXP = Math.min(rankData.exp + addRankXP, (Consts.R_LEGEND - 1) * 100);
        let newRank = Consts.CALCLEVEL(newXP);
        let newClass = Consts.CALCCLASS(newRank);

        this.save.saveRankClass(newClass, newRank, newXP);
        this.save.updateAllXP();    //  UPDATE all the EXP gained and save

        //  #   CLEAR the session data from last round

        sessionStorage.removeItem(Consts.SES_STAGE_RANK_GAIN);

    } // saveStageData()


    //  #   HERO SELECTION
    //  ========================================================================

    /** SHOW the hero selection screen */
    createHeroSelect() {

        const camera = this.cameras.main;
        const cX = camera.width * .5;
        const cY = camera.height * .5;
        const width = camera.width;
        const height = camera.height;

        const { cover1, cover2, title, timeline } = getBGCover(this, 'SELECT HERO');

        //  #   PLAYER IMAGE - LOAD current if available else from black

        let pd = this.save.getPlayerData();
        const opts = [Consts.BLACK, Consts.ASIAN, Consts.WHITE];
        const find = opts.findIndex(id => id == pd.race);
        const idx = (find>-1) ? find : 0;

        let sheets = opts.map(id => this.tgen.getSheet(id, pd.armour, pd.weapon));
        let player = this.add.image(cX, cY + 8, sheets[idx].name).setFrame(0).setScale(4);
        let name = this.add.bitmapText(cX, player.getTopCenter().y - 16, 'seog14', pd.name).setOrigin(.5, 1).setScale(.9);

        //  #   BUTTONS

        let index = 1;
        let arrow = this.add.image(width * .7, cY, 'atlas', '_arrow');
        let arrowFn = ()=>{

            this.snd.play(Consts.SND_UI_MENUMOVE);

            index = (index % sheets.length) + 1;
            let sht = sheets[index - 1];
            player.setTexture(sht.name);
            player.setFrame(0);
            name.setText(getRandomName());
        };
        arrow.setInteractive().on('pointerdown', arrowFn);

        let tick = this.add.image(cX, height * .8, 'atlas', '_tick');
        let tickFn = ()=>{

            this.snd.play(Consts.SND_UI_SELECT);

            let race = opts[index - 1];
            this.save.savePlayerRace(race);
            this.save.savePlayerName(name.text);
            this.scene.get('HUD').updatePlayers();

            this.events.emit(Consts.EVENT_MENU_READY);

            this.clearScene();  //  #   CLEAR everything on scene

            let menu = this.scene.get('Menu');
            menu.input.keyboard.enabled = true;
        };
        tick.setInteractive().on('pointerdown', tickFn);

        this.group.addMultiple([cover1, cover2, title, player, arrow, tick, name]);

        //  #   TWEEN in the background and elements

        timeline.add({
            targets: [player, arrow, tick, name],
            duration: 500,
            alpha: {from:0, to:1, start:0},
            onComplete: ()=>{
                this.keys.assignCharacterSelect([{ic:arrow, fn:arrowFn}, {ic:tick, fn:tickFn}]);
            }
        });
        timeline.play();

        //  #   STOP Menu keys

        let menu = this.scene.get('Menu');
        menu.input.keyboard.enabled = false;

    } // createHeroSelect()

    /** STOP the BG music */
    stopMusic() {
        let scene = this.scene.get('Stage');
        let music = scene.music;
        music.stop();
        music.destroy();
    } // stopMusic()

} // END CLASS //
