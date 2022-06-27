import Consts from 'classes/Consts.js';

/**
* @author Umz
* @classdesc CREATE new Textures from the default set and save as new
* @version 0.0.02
*/
export default class TextureGenerator {

    constructor(scene) {
        this.scene = scene;
    } // constructor()

    /** PREVENT sheet not existing graphic by always generating sheet */
    getSheet(id, aID, wID) {

        let sheet = Consts.GET_SHEET(id, aID, wID);
        let key = sheet.name;
        if (!this.scene.textures.exists(key))
            this.addSheet(id, aID, wID);

        return sheet;

    } // getSheet()

    /** CREATE another canvas to create the given Spritesheet if not existing */
    addSheet(id, armourID = -1, weaponID = -1) {

        let sheet = Consts.GET_SHEET(id, armourID, weaponID);
        let key = sheet.name;

        let base = Consts.CHARACTERS.get(id);
        let armour = Consts.ARMOURS.get(armourID);
        let weapon = Consts.WEAPONS.get(weaponID);

        const canvas = this.scene.textures.createCanvas(key, 100, 60);
        canvas.drawFrame('characters', `ss_c_${base}`);

        if (armour)
            canvas.drawFrame('characters', `ss_a_${armour}`);

        if (weapon)
            canvas.drawFrame('characters', `ss_w_${weapon}`);

        //  #   LOOP to create Spritesheet

        for (let row = 0; row < 2; row++)
            for (let col = 0; col < 5; col++) {

                let frameID = col + (row * 5);
                let sourceIndex = 0;
                let x = col * 20;
                let y = row * 20;

                canvas.add(frameID, sourceIndex, x, y, 20, 20);

            } // for (columns)

        canvas.refresh();

        //  CREATE the animations

        //  Here we use the 'generateFrameNumbers' function instead to set the start and end frame:
        const configIdle = {
            key: sheet.idle,
            frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        };

        //  Here we use the 'frames' array because we want to specify the exact frames to use:
        const configRun = {
            key: sheet.run,
            frames: this.scene.anims.generateFrameNumbers(key, { frames: [ 5, 6, 7, 8, 9 ] }),
            frameRate: 12,
            repeat: -1
        };

        this.scene.anims.create(configIdle);
        this.scene.anims.create(configRun);

    } // addSheet()

} // END CLASS //
