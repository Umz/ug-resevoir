import Consts from 'classes/Consts.js';

/**
* @copyright    Umz
* @classdesc    Sound Manager easy way to play all sounds consistently in volume etc.
* @version      0.01
*/
export default class Snd {

    constructor(scene) {
        this.scene = scene;
    } // constructor()

    /** PLAY a new instance or same instance of sound requested */
    play(id) {

        const playMax = (key, cf = {}, max = 4) => {
            var sndArray = this.sound.getAll(key);
            if (sndArray.length < max)
                this.sound.play(key, cf);
        };

        const key = Consts.SOUNDS.get(id);
        switch (id) {

            case Consts.SND_UI_SEL_LOC: playMax(key, {volume:.3}); break;
            case Consts.SND_UI_PAUSE: this.sound.play(key, {volume:.5}); break;
            case Consts.SND_UI_OPEN_LOC: this.sound.play(key, {volume:.4}); break;
            case Consts.SND_UI_MENUMOVE: this.sound.play(key, {volume:.4}); break;
            case Consts.SND_UI_SELECT: this.sound.play(key, {volume:.6}); break;
            case Consts.SND_UI_RUNNERLEVEL: this.sound.play(key, {volume:1}); break;
            case Consts.SND_UI_RANKUP: this.sound.play(key, {volume:1}); break;
            case Consts.SND_UI_RANKCHANGE: this.sound.play(key, {volume:1}); break;

            case Consts.SND_GAME_EQUIP: this.sound.play(key, {volume:.5}); break;
            case Consts.SND_GAME_AVOIDLANE: this.sound.play(key, {volume:.1}); break;
            case Consts.SND_GAME_BANG: this.sound.play(key, {volume:1}); break;
            case Consts.SND_GAME_BONUS: this.sound.play(key, {volume:1}); break;
            case Consts.SND_GAME_EN_DIE: this.sound.play(key, {volume:1}); break;
            case Consts.SND_GAME_TOUCH: this.sound.play(key, {volume:.3}); break;
            case Consts.SND_GAME_CONVERT: this.sound.play(key, {volume:.4}); break;

            case Consts.SND_GAME_CHEER: this.sound.play(key, {volume:.7}); break;
            case Consts.SND_GAME_PL_DIE: this.sound.play(key, {volume:.6}); break;

            case Consts.SND_GAME_CLASH_A: this.sound.play(key, {volume:1}); break;
            case Consts.SND_GAME_CLASH_B: this.sound.play(key, {volume:1}); break;
            case Consts.SND_GAME_CLASH_C: this.sound.play(key, {volume:1}); break;
            case Consts.SND_GAME_CLASH:
                let opt = Phaser.Utils.Array.GetRandom([Consts.SND_GAME_CLASH_A, Consts.SND_GAME_CLASH_B, Consts.SND_GAME_CLASH_C]);
                let sel = Consts.SOUNDS.get(opt);
                this.sound.play(sel, {volume:1});
            break;

            case Consts.MUS_MENU:
            case Consts.MUS_COLLECT:
            case Consts.MUS_BATTLE:
                let mus = this.sound.add(key, {volume:.4, loop:true});
                mus.play();
                return mus;

        } // switch (id)

    } // play()

    //  #   EASE FN
    //  ========================================================================

    get sound() { return this.scene.sound }

} // END CLASS //
