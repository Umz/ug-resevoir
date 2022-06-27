import Consts from 'classes/Consts.js';

/**
* @author       Umz
* @classdesc    RUNNER has a set speed and moves along path until dead ot stopped
* @version      0.01.08
*/
export default class Runner extends Phaser.GameObjects.Sprite {

    //  #   NEEDS CLEANING AGAIN
    //  DATA
    //  VISUAL
    //  CONTROLS

    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        this.setOrigin(.5, 1);
        scene.add.existing(this);

        //  #   VARIABLES

        this.lastCollide = this;
        this.busy = false;

        this.state = Consts.STATE_IDLE;

        this.defSpeed = 60;
        this.speed = 0;
        this.hp = 1;

        this.baseHP = 1;
        this.baseStr = 1;

        this.target = null;

        this.startY = 0;
        this.offset = 0;
        this.move = 0;
        this.toY = 0;

        this.lane = 1;

        return this;

    } // constructor()

    /** MOVE in a single direction */
    update(time, delta) {

        this.x += (this.speed * delta * .001);

        //  #   FLAG BEARERS

        if (this.flag && this.speed != 0) {
            let currFrame = this.anims.getFrameName();
            let minus = (currFrame == 6 || currFrame == 9) ? 1 : 2;
            this.flag?.setPosition(this.x - minus, this.y - 1);
        } // if (has flag)

        //  #   IF moving from lane to lane

        if (this.move !== 0) {

            let spd = (32 * delta * .001) * this.move;
            this.y += spd;
            if ((this.y + this.offset) * this.move >= this.startY * this.move) {
                this.y = this.toY;
                this.move = 0;
            } // if (reached)

        } // if (moving lanes)
        else if (this.moveFin) {
            this.moveFin();
            this.moveFin = null;
        } // if (action to perform)

    } // update()


    //  #   SPRITE DATA AND CREATION
    //  ========================================================================

    setSheet(sheet) { this.sheet = sheet; return this; }
    setPlayerData(pd) {this.pd = pd; return this; }

    /** ADD new XP points to the holder data */
    addExp(exp) { this.pd.newXP += exp }

    equipArmour(armour) { this.pd.armour = armour }
    equipWeapon(weapon) { this.pd.weapon = weapon }

    setRace(race) { this.pd.race = race }

    unequipWeapon() {
        const wep = this.pd.weapon;
        this.pd.weapon = Consts.NONE;
        return wep;
    } // unequipWeapon()

    /** UPDATE the texture for this Runner */
    updateTexturesA() {

        const texgen = this.scene.tgen;
        const sheet = texgen.getSheet(this.pd.race, this.pd.armour, this.pd.weapon);

        this.setSheet(sheet);
        this.stop();
        this.setTexture(sheet.name);

        return this;

    } // updateTexturesA()


    //  #   PLAYER GAME DATA AND SPRITE STATE
    //  ========================================================================

    /** SET the current state of this Runner */
    setState(s) {

        this.state = s;

        //  #   NORMAL state

        switch (s) {
            case Consts.STATE_RUNNING:
                this.speed = this.defSpeed;
            break;

            case Consts.STATE_IDLE:
            case Consts.STATE_WAITING:
                this.speed = 0;
                this.move = 0;
            break;
        } // switch (state)

        return this;

    } // setState()

    /** SET this Runner speed to the given speed */
    setSpeed(spd) { this.speed = spd; return this }

    /** WHEN this Runner has been hit */
    hit(dmg, obj) {

        this.lastCollide = obj;

        this.hp -= dmg;
        if (this.hp <= 0) {
            this.state = Consts.STATE_DEAD;
            this.stop().setFrame(4);
            this.speed = 0;

            if (this.flag)
                this.scene.container.remove(this.flag, true);

            return true;
        }

        return false;

    } // hit()

    /** HIT but non-lethal leaves runner knocked out (Equip stage) */
    knock(dmg) {
        this.hp -= dmg;
        if (this.hp <= 0) {
            this.state = Consts.STATE_OUT;
            this.stop().setFrame(4);
            this.speed = 0;

            if (this.flag)
                this.scene.container.remove(this.flag, true);

            return true;
        }
        return false;
    } // knock()

    /** CALCULATE and set the HP according to current equipment */
    recalcHP() {
        let armour = parseInt(this.pd.armour) - 100;
        this.hp = (this.baseHP + armour) < 0 ? this.baseHP : this.baseHP + armour;
        return this;
    } // recalcHP()

    setHP(hp) { this.hp = hp; return this }
    setBaseHP(hp) { this.baseHP = hp; return this }
    setStr(str) { this.baseStr = str; return this }

    /** ALL HP has been depleted */
    isDead() { return (this.state === Consts.STATE_DEAD) }

    get def() { return (this.pd.armour - 100) }
    get str() { return this.baseStr + Math.max(0, (parseInt(this.pd.weapon) - 200)) }

    /** SET a target for this Runner to keep in step */
    setTarget(tar) { this.target = tar; return this; }

    /** EXP gained for killing this runner */
    getExp() { return parseInt(this.pd.exp) }


    //  #   CHECK EQUIPMENT
    //  ========================================================================

    isNaked() { return (this.getArmour() == 0 && this.getWeapon() == 0) }
    isSingleEquip() { return (!this.isNaked() && (this.getArmour() == 0 || this.getWeapon() == 0)) }
    isDoubleEquip() { return (this.getArmour() != 0 && this.getWeapon() != 0) }
    isNoMax() { return (this.getArmour() < this.getALv() && this.getWeapon() < this.getWLv()) }
    isSingleMax() { return (this.getArmour() < this.getALv() || this.getWeapon() < this.getWLv()) }
    isDoubleMax() { return (this.getArmour() >= this.getALv() && this.getWeapon() >= this.getWLv()) }

    getLv() { return Consts.CALCLEVEL(this.pd.exp) }
    getALv() { return this.getLv() + 100 }
    getWLv() { return this.getLv() + 201 }
    getArmour() { return this.pd.armour }
    getWeapon() { return this.pd.weapon }

    isMaxArmour() { return this.getArmour() >= this.getALv() }
    isMaxWeapon() { return this.getWeapon() >= this.getWLv() }

    isAvailable() { return this.state === Consts.STATE_RUNNING && !this.busy }


    //  #   MOVEMENT AND ANIMATION
    //  ========================================================================

    /** INTERNAL move to the given Y position and stop */
    _moveToY(toY, fn) {

        this.toY = toY;

        this.startY = this.y;
        this.offset = (this.y - toY);

        this.move = (toY == this.y) ? 0 : (toY > this.y) ? 1 : -1;
        this.moveFin = fn;

        return this;

    } // _moveToY()

    /** SET the current lane this Runner is in */
    setLane(l, lanePos = false) {

        this.lane = Math.max(0, Math.min(10, l));   //  0-10
        if (lanePos) this.setY(this.scene.getLaneY(l));
        return this;

    } // setLane()

    /** MOVE this Runner to the desired lane */
    moveToLane(lane, fn) {
        let toLane = Math.max(0, Math.min(10, lane));   //  0-10
        let y = this.scene.getLaneY(toLane);
        this.lane = toLane;
        this._moveToY(y, fn);
    } // moveToLane()

    /** PLAY the running animation of this Sprite */
    playRun(delay = 0) {
        this.playAfterDelay(this.sheet.run, delay);
        return this;
    } // playRun()

    /** PLAY the idle animation of this Sprite */
    playIdle(delay = 0) {
        this.playAfterDelay(this.sheet.idle, delay);
        return this;
    } // playIdle()

    /** CARRY the flag and keep it with Runner at all times */
    carryFlag(flag) {
        flag.setPosition(this.x - 1, this.y - 1);
        this.flag = flag;
    } // carryFlag()

    carryRunner() {
    }

} // END CLASS //
