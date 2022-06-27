import Consts from 'classes/Consts.js';

/**
* @author       Umz
* @classdesc    DISPLAY a clickable location to enter a stage and play it
* @version      0.0.04
*/
export default class Location {

    //  TO CLEAN

    constructor(scene) {

        this.scene = scene;

        this.locID = -1;
        this.locType = -1;
        this.ttl = 0;
        this.paused = false;

        this.icon = scene.add.image(-30, 0, 'ss_black').setFrame(0).setVisible(false).setDepth(10);
        this.pointer = scene.add.image(-30, 0, 'atlas', '_location').setVisible(false).setDepth(10);

        //  #   MAKE clickable

        this.icon.setInteractive().once('pointerdown', this.enterLocation, this);
        this.pointer.setInteractive().once('pointerdown', this.enterLocation, this);

        //  #   LEVEL ID

        this.hudFont12 = {
            font: '900 12px monospace',
            align: 'center',
            color: '#ffffff',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000',
                blur: 0,
                fill: true,
                stroke: true
            }
        };
        this.locName = scene.add.bitmapText(-30, 120, 'seog14', '-').setOrigin(.5).setVisible(false).setDepth(11);

    } // constructor()

    /** UPDATE the TTL value to hide this location when timed out or off screen */
    update(number, delta) {

        let camera = this.scene.cameras.main;
        let left = camera.scrollX;
        let right = left + camera.width;

        this.ttl -= (this.paused) ? 0 : delta;
        if (this.ttl <= 0)
            this.hideLocation();

        if (this.icon.x < left || this.icon.x > right)
            this.hideLocation();

    } // update()

    pause() {this.paused = true}
    unpause() {this.paused = false}

    /** ENTER the given location and start level */
    enterLocation() {

        let scrollX = this.scene.cameras.main.scrollX;
        sessionStorage.setItem(Consts.SES_MAP_POS, scrollX);
        sessionStorage.setItem(Consts.SES_STAGE_ZONE, this.calcZone());

        this.scene.music.stop();
        this.scene.music.destroy();
        this.scene.snd.play(Consts.SND_UI_OPEN_LOC);

        //console.log('Entering', this.locID);
        this.scene.scene.start('Stage', {id:this.locID + 1, type:this.locType});

    } // enterLocation

    /** SHOW the location on the menu map to be clicked */
    setLocation(id) {

        let cell = Consts.MENU_CELL;

        let cellX = cell + (cell * id);
        let posX = (cellX) + (cell / 2);
        let iconY = 170, pointY = iconY - 20;

        this.locID = id;
        this.ttl = Phaser.Math.Between(10, 15) * 1000;
        this.icon.setPosition(posX, iconY);
        this.pointer.setPosition(posX, pointY);

        this.locName.setText(id + 1).setPosition(posX, iconY + 16);

        this.showLocation();

        //  #   ADD tween

        this.scene.tweens.add({
            targets: this.pointer,
            duration: 1000,
            loop: true,
            repeat: -1,
            yoyo: true,
            y: {from: 138, to: 146},
            ease: 'Cubic'
        });

        this.scene.tweens.add({
            targets: this.icon,
            duration: 500,
            scaleY: {from: 0, to: 1},
            ease: 'Back.Out'
        });

    } // setLocation

    /** HIDE this location from Player after time out or off screen */
    hideLocation() {
        this.scene.tweens.killTweensOf(this.pointer);
        this.locID = -1;
        this.ttl = -1;
        this.icon.setVisible(false);
        this.pointer.setVisible(false);
        this.locName.setVisible(false);
    } // hideLocation

    showLocation() {
        this.icon.setVisible(true);
        this.pointer.setVisible(true);
        this.locName.setVisible(true);
    } // showLocation()

    /** WHETHER this location is live or hidden */
    get hidden() { return !this.icon.visible && !this.pointer.visible }


    //  ========================================================================

    /** SET the type of level this is */
    setType(type) {
        this.locType = type;
        switch (type) {
            case Consts.STAGE_RESCUE:
                this.icon.setTexture('atlas', 'loc_rescue');
            break;
            case Consts.STAGE_EQUIP:
                this.icon.setTexture('atlas', 'loc_equip');
            break;
            case Consts.STAGE_NORMAL:
                this.icon.setTexture('atlas', 'loc_normal');
            break;
            case Consts.STAGE_ENSLAUGHT:
                this.icon.setTexture('atlas', 'loc_enslaught');
            break;
            case Consts.STAGE_PURSUE:
                this.icon.setTexture('atlas', 'loc_pursue');
            break;
            case Consts.STAGE_AMBUSHRESCUE:
                this.icon.setTexture('atlas', 'loc_ambush');
            break;
            case Consts.STAGE_CONVERT:
                this.icon.setTexture('atlas', 'loc_convert');
            break;
            case Consts.STAGE_ALLIED:
                this.icon.setTexture('atlas', 'loc_allied');
            break;
            case Consts.STAGE_WALL:
                this.icon.setTexture('atlas', 'loc_wall');
            break;
        } // switch()
        return this;
    } // fn() setType

    /** CALCULATE the zone of the current location */
    calcZone() {

        const zoneWidth = 480;
        const cell = Consts.MENU_CELL;
        const zoneCells = (zoneWidth / cell);

        return Math.ceil((this.locID + 1) / zoneCells);

    } // calcZone()

} // END CLASS //
