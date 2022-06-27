import Consts from 'classes/Consts.js';
import Snd from 'classes/Snd.js';

/**
* @copyright    Umz
* @classdesc    CREATE all the listeners for key events to control the game full from keys
* @version      0.02
*/
export default class KeyControls {

    constructor(scene) {

        this.scene = scene;
        this.camera = scene.cameras.main;
        this.snd = new Snd(scene);

        this.selector = this.scene.add.image(-20, -20, 'atlas', '_arrow').setTintFill(0xFFFFFF).setAlpha(.4).setVisible(false);
        this.selectorTar = null;
        this.selectedFn = null;

        this.keysActive = true;     //  CHECK device

        scene.updaters?.push(this);

    } // constructor

    update(number, delta) {
        if (this.selectorTar) {
            let pos = this.selectorTar.getCenter();
            this.selector.setPosition(pos.x, pos.y);
        } // if (targetting)
    } // update()


    //  #   GENERIC
    //  ========================================================================

    /** MOVE the selector onto the selected item */
    selectItem(item, fn) {

        if (!this.keysActive) return;

        let pos = item.getCenter();
        let frame = item.frame.name;
        this.selector.setFrame(frame).setVisible(true).setPosition(pos.x, pos.y).setDepth(10).setScale(1);
        this.selectorTar = item;
        this.selectedFn = fn;

    } // selectItem()

    /** MOVE the selector to onto the bottom of the item selected */
    selectText(item, fn) {

        if (!this.keysActive) return;

        this.selector.setDisplaySize(item.width + 8, 12);
        this.selector.setVisible(true).setPosition(item.x, item.y + 4);
        this.selectedFn = fn;

    } // selectText()

    /** RESET the select state */
    resetSelect() {
        this.scene.input.keyboard.removeAllListeners();
        this.selector.setVisible(false);
        this.selectedFn = null;
    } // resetSelect()

    /** CLEAR the selection */
    clearSelect() {
        this.selector.setVisible(false);
        this.selectorTar = null;
        this.selectedFn = null;
    } // clearSelect()


    //  #   KEY ASSIGNMENTS
    //  ========================================================================

    /** SET the function for pressing any downward representing key */
    setDownKey(fn) {

        this.scene.input.keyboard.on('keydown-S', fn, this);
        this.scene.input.keyboard.on('keydown-DOWN', fn, this);
        this.scene.input.keyboard.on('keydown-EIGHT', fn, this);

    } // setDownKey()

    /** SET the function for pressing any downward representing key */
    setUpKey(fn) {

        this.scene.input.keyboard.on('keydown-W', fn, this);
        this.scene.input.keyboard.on('keydown-UP', fn, this);
        this.scene.input.keyboard.on('keydown-TWO', fn, this);

    } // setUpKey()

    /** SET the function for pressing any downward representing key */
    setRightKey(fn) {

        this.scene.input.keyboard.on('keydown-D', fn, this);
        this.scene.input.keyboard.on('keydown-RIGHT', fn, this);
        this.scene.input.keyboard.on('keydown-SIX', fn, this);

    } // setRightKey()

    /** SET the function for pressing any downward representing key */
    setLeftKey(fn) {

        this.scene.input.keyboard.on('keydown-A', fn, this);
        this.scene.input.keyboard.on('keydown-LEFT', fn, this);
        this.scene.input.keyboard.on('keydown-FOUR', fn, this);

    } // setLeftKey()

    /** SET the function for pressing any downward representing key */
    setActKey(fn) {

        this.scene.input.keyboard.on('keydown-Z', fn, this);
        this.scene.input.keyboard.on('keydown-ENTER', fn, this);
        this.scene.input.keyboard.on('keydown-FIVE', fn, this);

    } // setActKey()


    //  #   FEEDBACK SCENE
    //  ========================================================================

    /** ASSIGN keys to the character select screen */
    assignCharacterSelect([arrow, tick]) {

        this.selector.setAlpha(.4);

        //  #   RIGHT direction (selects character or switch)

        this.setRightKey(() => {
            if (this.selectedFn == arrow.fn)
                this.selectedFn();
            else
                this.snd.play(Consts.SND_UI_MENUMOVE);

            this.selectItem(arrow.ic, arrow.fn);
        });

        //  #   DOWN direction

        this.setDownKey(() => {
            this.selectItem(tick.ic, tick.fn);
            this.snd.play(Consts.SND_UI_MENUMOVE);
        });

        //  #   ACTION button

        this.setActKey(() => {
            this.selectedFn();
        });

        this.selectItem(arrow.ic, arrow.fn);    //  DEFAULT arrow

    } // assignCharacterSelect()

    /** ANY key press will perform the fn */
    assignRoundEnd(fn) {
        this.setActKey(() => { fn() });
    } // assignRoundEnd()


    //  #   PAUSE SCENE
    //  ========================================================================

    /** ASSIGN a selector to the pause screen as a bar behind the text */
    assignPause([resume, exit]) {

        this.selector.setFrame('sky_cloud3').setAlpha(1).setDepth(1);

        this.setUpKey(() => {
            this.selectText(resume.ic, resume.fn);
            this.snd.play(Consts.SND_UI_MENUMOVE);
        });
        this.setDownKey(() => {
            this.selectText(exit.ic, exit.fn);
            this.snd.play(Consts.SND_UI_MENUMOVE);
        });
        this.setActKey(() => { this.selectedFn() });

        this.selectText(resume.ic, resume.fn);     //  DEFAULT on resume

    } // assignPause()


    //  #   GAME SCENE
    //  ========================================================================

    /** ASSIGN the up button to pause the game */
    assignHUDGamePause(fn) {
        this.setUpKey(fn);
    } // assignHUDGamePause()

    /** ASSIGN the action button to play the game */
    assignHUDGamePlay(fn) {
        this.setActKey(fn);
    } // assignHUDGamePlay

    /** ASSIGN Key controls for the HUD during showing the menu */
    assignHUDMenu(hudArr) {

        let index = 0;

        //  #   CYCLE through the HUD (bottom stuffs)

        this.setDownKey(() => {
            let selected = hudArr[index];
            index = ((index + 1) % hudArr.length === 0) ? 0 : index + 1;
            this.selectItem(selected.ic, selected.fn);
            this.snd.play(Consts.SND_UI_MENUMOVE);
        });
        this.setActKey(() => { if (this.selectedFn) this.selectedFn() });

        this.setRightKey(this.clearSelect);
        this.setLeftKey(this.clearSelect);

    } // assignHUDMenu()


    //  #   MENU SCENE
    //  ========================================================================

    /** ASSIGN the left and right keys to select the level (UP for sign-? Touch only) */
    assignMenu(locGen) {

        this.selector.setAlpha(.6).setDepth(20);

        let index = -1;
        let selected = null;

        //  #   CYCLE through the locations

        this.setLeftKey(() => {

            let locations = locGen.locations;
            Phaser.Utils.Array.StableSort(locations, (a, b) => a.locID - b.locID);  //  SORT ORDER

            //  #   SELECT right most location

            if (index > locations.length)
                index = locations.length;
            index --;

            //  #   SELECT or MOVE camera

            selected?.unpause();

            if (index < 0) {
                this._cameraMove(-1);
                this.clearSelect();
                selected = null;
            }
            else {
                selected = locations[index];
                this.selectItem(selected.pointer, ()=>{selected.enterLocation()});
                selected.pause();
                this.snd.play(Consts.SND_UI_SEL_LOC);
            } // else (on a location)

        });
        this.setRightKey(()=>{

            let locations = locGen.locations;
            Phaser.Utils.Array.StableSort(locations, (a, b) => a.locID - b.locID);  //  SORT ORDER

            //  #   SELECT left most location (by default -1 + 1)

            //  #   SELECT or MOVE camera

            if (index < 0)
                index = -1;
            index ++;

            selected?.unpause();

            if (index >= locations.length) {
                this._cameraMove(1);
                this.clearSelect();
                selected = null;
            }
            else {
                selected = locations[index];
                this.selectItem(selected.pointer, ()=>{selected.enterLocation()});
                selected.pause();
                this.snd.play(Consts.SND_UI_SEL_LOC);
            } // else (on a location)
        });
        this.setActKey(() => { if (this.selectedFn) this.selectedFn() });

        let clearFn = ()=>{
            this.clearSelect();
            index = -1;
            selected?.unpause();
        };
        this.setUpKey(clearFn)
        this.setDownKey(clearFn);

    } // assignMenu()

    /** HELPER function to move the camera left and right without the bumping */
    _cameraMove(dir) {

        const camSpeed = 7 * dir;
        const fullWidth = this.camera.getBounds().width - this.camera.width;

        let move = this.camera.scrollX + camSpeed;
        move = Math.max(0, Math.min(fullWidth, move));
        this.camera.scrollX = move;

    } // _cameraMove()

} // END CLASS //
