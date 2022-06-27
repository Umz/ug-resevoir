import Consts from 'classes/Consts.js';

/**
* @author       Umz
* @classdesc    BG Image handles creating the background image for this location that scrolls etc.
* @version      0.04.06
*/
export default class BGImage {

    //  TO CLEAN

    //  MAKE a generic one with functions for vanishing arifacts
    //  MAKE generic constructor with config for tiles, build from the ground backward
    //  EXTEND for other scenes

    constructor(scene) {

        const camera = scene.cameras.main;
        const width = camera.width;

        this.scene = scene;

        this.skies = [];
        this.shadows = [];
        this.passives = [];

        //  #   DEFAULT decor for each season

        this.area = Consts.AREA_SPRINGS;

        this.decorBack = (this.area - 1);
        this.decorMid = (this.area - 1);
        this.decorFront = (this.area - 1);

        this.customDecor = {};

        //  #   BACKGROUND Scenery

        const config = this.getArea(this.area);

        this.sky = scene.add.tileSprite(0, 0, width, config.sky, 'environment', `${config.prefix}sky`).setOrigin(0).setScrollFactor(0).setDepth(3);
        this.horizon = scene.add.tileSprite(0, 104, width, config.horz, 'environment', `${config.prefix}back`).setOrigin(0).setScrollFactor(0).setDepth(3);
        this.floor = scene.add.tileSprite(0, 160, width, config.floor, 'environment', `${config.prefix}floor`).setOrigin(0).setScrollFactor(0).setDepth(1);
        this.tiles = scene.add.tileSprite(0, 192, width, config.tiles, 'environment', `${config.prefix}land`).setOrigin(0).setScrollFactor(0).setDepth(3);
        this.water = scene.add.tileSprite(0, 224, width, 16, 'environment', 'water').setOrigin(0).setScrollFactor(0).setAlpha(.8).setDepth(4);
        this.wX = 0;

        //  #   UPDATE this controller

        scene.updaters.push(this);

    } // constructor()

    /** ANY background elements that need to be constantly moving (add clouds, snow, rain etc) */
    update(n, delta) {

        //  #   UPDATE tile positions based on camera movment

        const camera = this.scene.cameras.main;

        this.tiles.tilePositionX = camera.scrollX;
        this.sky.tilePositionX = camera.scrollX * .45;
        this.horizon.tilePositionX = camera.scrollX * .6;

        let move = (camera.scrollX - this.wX);
        this.water.tilePositionX += (24 * .001 * delta) + move;
        this.wX = camera.scrollX;

        //  #   SKY images scroll always and reset when behind camera

        let left = camera.scrollX;
        let right = left + camera.width;

        for (let cloud of this.skies)
            cloud.x += (move * .45) - (8 * .001 * delta);

        if (this.skies.length > 0) {
            let first = this.skies[0];
            if (first.getRightCenter().x <= left) {
                let last = this.skies[this.skies.length - 1];
                let gap = (camera.width * .1);
                first.x = right + Phaser.Math.Between(gap, gap * 2);
                Phaser.Utils.Array.MoveTo(this.skies, first, this.skies.length-1);
            } // if (off screen left)

        } // if (clouds)

        //  #   PASSIVE images when scrolling disappear behind camera

        if (this.passives.length > 0) {
            let first = this.passives[0];
            if (first.getRightCenter().x <= left) {
                this.randomizeItem(first);
                Phaser.Utils.Array.MoveTo(this.passives, first, this.passives.length-1);
            } // if (off screen left)
        } // if (passive objects)

        //  #   SHADOWS just follow other things

        for (let shadow of this.shadows) {
            let target = shadow.target;
            shadow.setPosition(target.x, target.y);
            if (!target.visible || !target.active)
                shadow.setVisible(false);
        } // for (all live shadows)

    } // update()


    //  #   SEASON specifics (Trailer)
    //  ========================================================================

    /** GET the background for the given season ID */
    getArea(id) {

        let green1 = {prefix:'green', sky:104, horz:56, floor:32, tiles:48};
        let sand1 = {prefix:'sand', sky:104, horz:56, floor:32, tiles:48};

        switch (id) {
            case 1: return green1;
            case 2: return sand1;
        }

        return green1;

    } // getArea()

    /** GET the decor for each season */
    getDecor() {

        const allBG = [
            ['brick_flowers', 'bush', 'fence', 'railing', 'sign', 'tree1', 'tree2'],    //  SPRINGS (default)
            ['bush2', 'bush3', 'fence_w', 'railing', 'tree3']   //  SANDS (default)
        ];

        const allFloor = [
            ['flowers'],
            ['flowers', 'flowers2']
        ];

        const allFG = [
            ['bush', 'fence', 'railing', 'sign', 'banner4'],       //  SPRINGS
            ['tree3', 'sign', 'railing', 'sandrock', 'mound', 'fence_w']    //  SANDS
        ];

        //  #   CHOOSE according to selection

        let bg = this.customDecor.bg || allBG[this.decorBack];
        let floor = this.customDecor.floor || allFloor[this.decorMid];
        let fg = this.customDecor.fg || allFG[this.decorFront];

        return [ bg, floor, fg ];

    } // getDecor()

    /** SET the decor of the level to the specified type */
    setCustomDecor(key, arr) {
        if (key === "fg" || key === "bg" || key === "floor")
            this.customDecor[key] = arr;
    } // setCustomDecor()


    //  #
    //  ========================================================================

    /** ADD clouds in the sky above that move automatically like water */
    addSky() {

        const camera = this.scene.cameras.main;

        for (let i=0; i<4; i++) {

            let cW = camera.width / 4;
            let pX = (cW * i) + (cW * .5);
            let frame = 'sky_cloud' + Phaser.Math.Between(1, 4);

            let image = this.scene.add.image(pX, 32, 'atlas', frame).setAlpha(.6).setDepth(4);
            this.skies.push(image);

        } // for (10 items)

    } // addSky()

    /** CREATE passive background elements for the scrolling stage */
    addPassiveBackground() {

        const camera = this.scene.cameras.main;

        for (let i=0; i<7; i++) {

            let cW = camera.width / 7;
            let pX = (cW * i) + (cW * .5);

            let image = this.scene.add.image(-64, 0, 'atlas', 'bg_bush').setOrigin(.5, 1);
            this.passives.push(image);
            this.addShadow(image);

            this.randomizeItem(image);
            image.setX(pX);

        } // for (10 items)

    } // addPassiveBackground()

    /** RANDOMISE the given item and add to the front of the screen */
    randomizeItem(image) {

        const camera = this.scene.cameras.main;
        const right = camera.scrollX + camera.width;

        //  TOP, MIDDLE, BOTTOM

        let ys = [
            (240 - 48 - 30),
            (240 - 48 - 16),
            (240 - 48)
        ];
        let depths = [160, 3, 192];

        const decor = this.getDecor();

        const section = Phaser.Math.Between(1, 3);
        const index = (section - 1);

        let pX = right + ((camera.width / 7) * .5);
        let pY = ys[index];
        let oY = (section === 2) ? .5 : 1;
        let depth = depths[index];
        let tex = Phaser.Utils.Array.GetRandom(decor[index]);

        image.setPosition(pX, pY).setFrame(`bg_${tex}`).setOrigin(.5, oY).setDepth(depth);

        let shadow = this.getShadow(image);
        shadow.setDisplaySize(image.width, 6);
        shadow.setVisible(section !== 2);

    } // randomizeItem()

    /** Adds a shadow on the ground layer behind given object */
    addShadow(target) {

        let shadow = this.scene.add.image(target.x, target.y, '_shadow');
        shadow.target = target;
        shadow.setDisplaySize(target.width, 6).setAlpha(.5).setDepth(2);
        this.shadows.push(shadow);

    } // addShadow()

    /** RETURN the shadow associated with given target */
    getShadow(target) {
        return this.shadows.find(shadow => shadow.target == target);
    } // getShadow()

} // END CLASS //
