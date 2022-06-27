import Consts from 'classes/Consts.js';

/**
* @copyright    Umz
* @classdesc    EXP bar creates 2 bars to show level when exp has been gained
* @version      0.02
*/
export default class ExpBar {

    constructor(scene, width) {
        this.scene = scene;

        this.bg = this.scene.add.image(0, 0, '_square').setOrigin(0).setDisplaySize(width, 2);
        this.fg = this.scene.add.image(0, 0, '_white').setOrigin(0).setDisplaySize(width, 2).setTintFill(0xFFA500);
        this.label = this.scene.add.bitmapText(0, 0, 'seog14', '1').setScale(.85).setOrigin(1).setVisible(true);

        this.cXP = 0;
        this.prefix = '';
        this.max = 7;

    } // constructor()

    showExp(pre = '') {
        let curr, max, lvl;
        //  Bar to max then level up, need next params
        let lv = pre + 1;
        this.label.setText(lv);
    } // showExp()

    showGrowth(addXP, duration = 2000, fn, sndID = Consts.SND_UI_RUNNERLEVEL) {

        let newXP = this.cXP + addXP;
        let newLv = this.calcLevel(newXP);
        let cLv = this.calcLevel(this.cXP);

        let finWidth = this.getBarWidth(newXP);
        let loops = (newLv - cLv);
        let dur = duration / (loops + 1);
        let start = this.fg.displayWidth;
        let max = this.bg.displayWidth;

        //  #   TIMELINE

        let tl = this.scene.tweens.createTimeline();

        //  #   LOOP to keep showing bar hits

        for (let i=0; i<loops; i++) {
            tl.add({
                targets: this.fg,
                duration: dur,
                displayWidth: {from:start, to:max},
                onComplete: ()=>{
                    this.scene.snd.play(sndID);
                    this.label.setText(this.prefix + (cLv + i + 1));
                }
            });
            start = 0;
        } // for (full bars)

        //  #   LAST go to finishing position

        tl.add({
            targets: this.fg,
            duration: dur,
            displayWidth: {from: start, to: finWidth},
            onComplete: ()=>{
                this.label.setText(this.prefix + newLv);
                if (fn)
                    fn();
            }
        });

        tl.play();

    } // showGrowth()

    /** SET the starting values for the xp and bar size */
    setCurrent(xp, maxLv, pre = '') {

        this.cXP = xp;
        this.prefix = pre;
        this.max = maxLv;

        //  #   SET the bar size currently

        let level = this.calcLevel(xp);

        let tens = xp - ((level - 1) * 100);
        let pc = (level === maxLv) ? 1 : tens * .01;

        let maxWidth = this.bg.displayWidth;
        let barWidth = maxWidth * pc;
        this.fg.setDisplaySize(barWidth, 2).setX(this.bg.x);

        //  #   SET the label showing level

        let lv = pre + level;
        this.label.setText(lv);

    } // setCurrent()

    /** RETURN the bar width for the given XP */
    getBarWidth(xp) {

        let level = this.calcLevel(xp);

        let tens = xp - ((level - 1) * 100);
        let pc = (level === this.max) ? 1 : tens * .01;

        let maxWidth = this.bg.displayWidth;
        let barWidth = maxWidth * pc;

        return barWidth;

    } // getBarWidth()

    /** CALCULATE level based on a simple linear XP system (100xp per level) */
    calcLevel(xp) {
        let level = Math.ceil(xp / 100);    //  Lv.1 0-99xp
        let lv = (xp % 100 === 0) ? level + 1 : level;
        return lv;
    } // calcLevel()

    setTopLeft(x, y) {
        this.bg.setOrigin(0).setPosition(x, y + 1);
        this.fg.setOrigin(0).setPosition(x, y);
        this.label.setPosition(this.bg.getBottomRight().x, this.bg.getBottomRight().y);
        return this;
    }

    setBottomLeft(x, y) {
        this.bg.setOrigin(0,1).setPosition(x, y);
        this.fg.setOrigin(0,1).setPosition(x, y - 1);
        this.label.setPosition(this.bg.getBottomRight().x, this.bg.getBottomRight().y);
        return this;
    }

    setVisible(b) {
        for (let e of this.bar)
            e.setVisible(b);
    }

    /** GET all the elements that make up the bar */
    get bar() {
        return [this.bg, this.fg, this.label];
    } // bar()

} // END CLASS //
