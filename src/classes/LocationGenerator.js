import Consts from 'classes/Consts.js';
import Location from 'classes/Location.js';

/**
* @author Umz
* @classdesc GENERATES the types of levels available and avoid duplication
* @version 0.0.01
*/
export default class LocationGenerator {

    constructor(scene) {

        this.scene = scene;
        this.locations = [];
        this.active = false;

        //  4-5-6
        for (let i=4; --i>=0;) {

            let loc = new Location(scene);
            this.locations.push(loc);
            this.setRandomLocation(loc);

        } // for (locations)

        scene.updaters.push(this);

    } // constructor

    /** KEEP all the live locations ticking over while on menu */
    update(number, delta) {
        if (this.active)
            for (let loc of this.locations) {
                loc.update(number, delta);
                if (loc.hidden)
                    this.setRandomLocation(loc);
            }
    } // update()

    pauseLocations() {
        this.active = false;
        for (let loc of this.locations)
            loc.hideLocation();
    } // pauseLocations()

    resumeLocations() {
        this.active = true;
    } // resumeLocations()

    /** SET the given location to a random location on screen */
    setRandomLocation(loc) {

        let prc = this.scene.save.getRankClass();

        let camera = this.scene.cameras.main;
        let left = camera.scrollX;

        let fullWidth = (camera.width * prc.class) + Consts.MENU_CELL;
        let maxID = ((fullWidth - Consts.MENU_CELL * 2) / Consts.MENU_CELL) - 1;    //  -1 Because offset

        let range = (camera.width / Consts.MENU_CELL);
        let first = Math.floor(left / Consts.MENU_CELL);
        let last = Math.min(first + range, maxID);

        //  #   KEEP changing until unqiue ID

        while (true) {

            let randID = Phaser.Math.Between(first, last);
            if (!this.locations.find(live => live.locID === randID)) {
                loc.setType(this.getLocType()).setLocation(randID);
                break;
            } // if (unique)

        } // keep looping until unique

    } // setRandomLocation()

    //  #   LOCATION TYPES

    /** GET the the type of location for this spot (calculates) */
    getLocType() {

        const save = this.scene.save;
        let pd = save.getRankClass();
        let pt = save.getPlayerTeam();

        //  #   1st - Equip, then rescue; - generate in caller not here

        let full = [Consts.STAGE_EQUIP];    //  ALWAYS available

        //  #   RECRUIT if less than MAX team

        if (pt.length < (pd.class * 4))
            full.push(Consts.STAGE_RESCUE);

        //  #   NORMAL stage is always available

        full.push(Consts.STAGE_NORMAL, Consts.STAGE_ENSLAUGHT);

        //  #   ADD more per player class

        if (pd.class >= 2)
            full.push(Consts.STAGE_AMBUSHRESCUE);

        if (pd.class >= 3)
            full.push(Consts.STAGE_PURSUE, Consts.STAGE_ALLIED)

        if (pd.class >= 4)
            full.push(Consts.STAGE_CONVERT);

        if (pd.class >= 5)
            full.push(Consts.STAGE_WALL);

        return Phaser.Utils.Array.GetRandom(full);
        //return Phaser.Utils.Array.GetRandom([Consts.STAGE_WALL, Consts.STAGE_EQUIP, Consts.STAGE_NORMAL]);

        //return Phaser.Utils.Array.GetRandom([Consts.STAGE_PURSUE, Consts.STAGE_EQUIP, Consts.STAGE_RESCUE, Consts.STAGE_ENSLAUGHT, Consts.STAGE_NORMAL, Consts.STAGE_AMBUSHRESCUE, Consts.STAGE_CONVERT, Consts.STAGE_ALLIED, Consts.STAGE_WALL]);

    } // getLocType()

} // END CLASS //
