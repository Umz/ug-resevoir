/**
* @author       Umz
* @classdesc    BOOT loads and creates all assets required for the loading screen and creates settings
* @version      0.02.01
*/
export default class Boot extends Phaser.Scene {

    constructor() {
        super({key:'Boot', active:true});
    } // constructor()

    /** LOAD the UG graphics and game icon to show while loading */
    preload() {

        this.load.setBaseURL('assets/');

        this.load.image('boot_ic', 'boot_rcic.png');
        this.load.image('ugic', 'boot_ugic.png');
        this.load.image('ugname', 'boot_ugname.png');

        this.load.audio('ugpreload', 'ug_preload.ogg');

    } // preload()

    create(data) {
        this.scene.start('Preload');
    } // create()

    update(number, delta) {} // update()

} // END CLASS //
