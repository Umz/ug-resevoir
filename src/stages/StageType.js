import Consts from 'classes/Consts.js';
import {loopArray, getObject, firstOfArray} from 'classes/Common.js';

/**
* @copyright    Umz
* @classdesc    BASE CLASS for all handlers manages common functioning of all stages
* @version      0.05
*/
export default class StageType {

    constructor(scene) {

        this.scene = scene;

        this.showCount = 7;

        this.isWin = false;
        this.isLose = false;
        this.isChecking = true;
        this.wonBonus = false;

        //  #   BONUS tracking generic

        this.kills = 0;

        //  #   ARRAYS

        this.lvlEnemies = [];
        this.enemyTypes = [];

        this.obstacles = [];    //  ALL obstacles Sprites
        this.dangers = [];      //  DANGER (live for collisions)

        this.obstacleFrames = [];   //  WHICH obstacles to show
        this.levelConfig = [];      //  LEVEL config for deployment

        this.touchMin = 0;      //  MIN distance touchable
        this.touchRange = 48;   //  TOUCH range from min distance

    } // constructor()

    /** HAS the shared update functions, each subclass must customise */
    update(time, delta) {

        this.updateAdder();     //  ADD enemies and obstacles
        this.updateObjects();   //  CLEAR obsolete

        this.checkDangerousObstacles();

        //  #   INTERACTIVE checks in Subclass

    } // update()


    //  #   GENERATORS
    //  ========================================================================

    /**
    * MINOR static obstacles at a reasonable distance that do damage when collide
    * @param freq is how many obstacles per screen width
    */
    generateObstacles(freq = 5) {

        const camera = this.scene.cameras.main;
        const endX = this.scene.stageSize - (camera.width);
        const gap = camera.width / freq;

        //  #   POPULATE the array with objects to create this level

        let posX = camera.width;
        while (posX < endX) {

            let frame = Phaser.Utils.Array.GetRandom(this.obstacleFrames);
            let lane = Phaser.Math.Between(1, 9);

            let obstacle = this.getRandomObstacleConfig(posX, lane);
            this.levelConfig.push(obstacle);

            posX += gap + Phaser.Math.Between(-24, 24);

        } // while (not at end)

        return this.levelConfig;

    } // generateObstacles()

    /**
    * MINOR static obstacles at a reasonable distance that do damage when collide
    * @param start Starting block (number * screen width)
    * @param blocks The amount of blocks (number * width) wide this section is
    */
    generateObstacleSet(start, blocks, amt, convertFn) {

        const camera = this.scene.cameras.main;
        const width = camera.width;
        const gap = (width * blocks) / amt;

        for (let i=0; i<amt; i++) {

            let diff = Phaser.Math.Between(-24, 24);
            let posX = (start * width) + (gap * i) + diff;

            //  #   FRAMES used are the set given or current set

            let frame = Phaser.Utils.Array.GetRandom(this.obstacleFrames);
            let lane = Phaser.Math.Between(1, 9);

            let obstacle = this.getRandomObstacleConfig(posX, lane);
            if (convertFn) obstacle = convertFn(obstacle);
            this.levelConfig.push(obstacle);

        } // while (not at end)

    } // generateObstacleSet()

    /** SAME as set generation- generate a group of enemies from point */
    generateEnemyGroup(start, blocks, amt) {

        const camera = this.scene.cameras.main;
        const width = camera.width;
        const gap = (width * blocks) / amt;
        let gen = [];

        for (let i=0; i<amt; i++) {

            let diff = Phaser.Math.Between(-16, 16);
            let posX = (start * width) + (gap * i) + diff;
            let lane = Phaser.Math.Between(0, 10);

            let en = this.getEnemyConfig(posX, lane)
            this.lvlEnemies.push(en);
            gen.push(en);

        } // for (all enemies)

        return gen;

    } // generateEnemyGroup()


    //  #   ADDERS
    //  ========================================================================

    /** ADD an obstacle to the scene and manage it here */
    addObstacle(config) {

        let obs = this.scene.stageGen.spawnObstacle(config);
        this.obstacles.push(obs);

        if (obs.getData('dmg') > 0)
            this.dangers.push(obs);

        return obs;

    } // addObstacle()

    /** ADD an enemy to the scene and enemy contorller */
    addEnemy(config) {
        let en = this.scene.stageGen.spawnEnemy(config);
        this.scene.enemyCtrl.add(en);
        this.obstacles.push(en);
        return en;
    } // addEnemy()


    //  #   UPDATERS
    //  ========================================================================

    /** ADD an obstacle to the obstacles array and dangers if can damage player */
    updateAdder() {

        const camera = this.scene.cameras.main;
        const spawnX = (camera.scrollX + camera.width) + 24;

        //  #   DEPLOY beyond the screen, always

        firstOfArray(this.levelConfig, (conf)=>{
            if (spawnX >= conf.x) {
                this.addObstacle(conf);
                return true;
            } // if (spawn range)
            return false;
        });

        //  #   DEPLOY enemies beyond the screen also
        firstOfArray(this.lvlEnemies, (conf)=>{
            if (spawnX >= conf.x) {
                this.addEnemy(conf);
                return true;
            } // if (spawn range)
            return false;
        });

    } // updateAdder()

    /** UPDATE the first object in the array that needs to be touched */
    updateTouchable() {

        const camera = this.scene.cameras.main;
        const hud = this.getHUD();;
        const player = this.getPlayer();

        hud.hideButtonIndicator();

        //  #   CHECK when the next live obstacle

        let ob = this.getNextObstacle();
        if (ob) {
            //  #   WITHIN touch distance
            if (this.checkInRange(ob)) {
                this.flash(ob, 0x111111);      //  FLASH black
                hud.showButtonIndicator(ob.noTouch);  //  SHOW small button indicator
            } // if (within distance)

        } // if (object)

        //  #   ONLY show for the first few

        if (this.showCount >= 0) hud.showButton(ob?.noTouch);
        else hud.hideButton();

    } // updateTouchable()

    /** CLEAR obstacles once they go beyond the screen left */
    updateObjects() {

        const camera = this.scene.cameras.main;
        const player = this.getPlayer();

        loopArray(this.obstacles, (ob) => {

            //  #   MISSED once beyond player

            if (this.checkMissed(ob)) {

                //  #   CAGE-

                if (ob.getData('type') == Consts.OB_CAGE && (ob.getRightCenter().x < player.getLeftCenter().x) && !ob.flgged) {

                    let fx = ob.addToGarbage('fx');
                    fx.setFrame('fg_shock');
                    this.scene.tweens.killTweensOf(fx);
                    ob.addToGarbage('runner');
                    ob.flagged = true;

                } // if(has effect showing)

            } // if (passed player)

            //  #   OBSTACLE off screen to the left

            if (ob.getRightCenter().x < camera.scrollX - 12 || ob.remove) {

                //  #   REMOVE all of obstacle once off screen

                for (let gg of ob.garbage) {
                    this.scene.tweens.killTweensOf(gg);
                    if (this.scene.container.exists(gg, true))
                        this.scene.container.remove(gg, true);
                    else if (gg)
                        gg.destroy(true, true);
                } // for (all garbage)

                ob.setData();
                ob.garbage.lenth = 0;
                this.scene.container.remove(ob, true);
                Phaser.Utils.Array.Remove(this.obstacles, ob);

            } // if (off screen)
        });

    } // updateObjects()


    //  #   CHECKS
    //  ========================================================================

    /** COLLISIONS between Players and ojbects (basic) */
    checkDangerousObstacles() {

        loopArray(this.dangers, (ob, index) => {
            let player = this.getNextPlayer(ob);
            if (player) {
                if (this.checkColliding(ob, player)) {
                    this.flash(player, 0xFF0000);
                    if (player.hit(ob.getData('dmg'), ob))
                        this.scene.manager.showFX(player, 'fg_skull', 1500);
                } // if (close)
            } // if (player found)
            else
                Phaser.Utils.Array.Remove(this.dangers, ob);
        });

    } // checkDangerousObstacles()

    /** CHECK for any players colliding into any enemies */
    checkEnemyCollisions() {

        const enCt = this.getEnCtrl();

        loopArray(enCt.all, (en, index) => {

            let player = this.getNextPlayer(en);
            if (player) {
                if (this.checkColliding(en, player)) {

                    let cp = en.getLeftCenter();
                    this.getManager().showClash(cp.x, cp.y, 16);
                    this.getManager().playSound(Consts.SND_GAME_CLASH);

                    //  #   DAMAGE to Player (if any)

                    let dmg = en.decom ? 0 : en.str;
                    if (player.hit(dmg, en))
                        this.scene.manager.showFX(player, 'fg_skull', 1500);
                    else if (dmg > 0)
                        this.flash(player, 0xFF0000);
                    let move = Phaser.Math.Between(-1, 1);
                    player.moveToLane(player.lane + move);

                    //  #   DAMAGE to enemy

                    if (en.hit(player.str, player)) {
                        enCt.kill(en, player);
                        this.kills ++;
                    } // if (kill)

                } // if (colliding)
            } // if (player found)
            else
                Phaser.Utils.Array.Remove(enCt.all, en);    //  NO more collision possible
        });

    } // checkEnemyCollisions()

    /** CHECK that this sprite is in range of the Player */
    checkInRange(sprite, front = true) {

        const sX = (front) ? sprite.getLeftCenter().x : sprite.x;
        const player = this.getPlayer();

        let dd = sX - (player.x + this.touchMin);
        return (dd && dd < this.touchRange)

    } // checkInRange()

    /** CHECK if the given object is colliding with the given runner (16px leeway) */
    checkColliding(ob, player) {
        let dist = (ob.getLeftCenter().x - player.getLeftCenter().x);
        return (dist && dist < 16 && ob.lane === player.lane && player.state !== Consts.STATE_DEAD);
    } // checkColliding()

    /** IF this object is passed the touchable point */
    checkMissed(ob, front = true) {
        const sX = (front) ? ob.getLeftCenter().x : ob.x;
        const player = this.getPlayer();
        return (sX - (player.x + this.touchMin) < 0);
    } // checkMissed()

    /** ADD bonus XP if all conditions are met */
    checkWinBonus(count, max, bonus) {
        if (count === max && !this.wonBonus) {
            this.play(Consts.SND_GAME_BONUS);
            this.scene.save.addToSession(Consts.SES_STAGE_RANK_GAIN, bonus);
            this.wonBonus = true;
        } // if (all rescued)
    } // checkWinBonus()


    //  #   OBJECT AND OBSTACLE FUNCTIONS
    //  ========================================================================

    /** CHECK if there is a valid object touched and pass to relevant handler */
    handleTouch() {

        const player = this.scene.playerCtrl.player;
        const hud = this.scene.scene.get('HUD');

        //  #   CHECK for valid obstacle

        let current = this.getNextTouchableObstacle();
        if (current) {

            this.getManager().playSound(Consts.SND_GAME_TOUCH);

            hud.hideButtonIndicator();
            this.handle(current);

            this.showCount --;

        } // if (good touch)

    } // handleTouch()

    /** DECOMMISSION this obstacle to remove the danger and all dodge it */
    decom(ob) {
        ob.decom = true;
        this.flash(ob, 0xFFFFFF);
        Phaser.Utils.Array.Remove(this.dangers, ob);
    } // decom()

    /** SORT the obstacles by ascending X live */
    sortObstaclesByX() {
        Phaser.Utils.Array.StableSort(this.obstacles, (a, b) => {
            return a.getLeftCenter().x - b.getLeftCenter().x;
        });
    } // sortObstaclesByX()


    //  #   GETTERS AND SETTERS
    //  ========================================================================

    /** GET the next obstacle that can be touched */
    getNextTouchableObstacle() {
        let next = this.getNextObstacle();
        if (next && this.checkInRange(next))
            return next;
    } // getNextTouchableObstacle()

    /** GET the next obstacle in the array there is one */
    getNextObstacle() {
        let ob = this.obstacles.find(o => {
            return (!this.checkMissed(o) && !o.decom);
        });
        return ob;
    } // getNextObstacle()

    /** @return single obstacle config object */
    getRandomObstacleConfig(pX, lane) {
        let frame = Phaser.Utils.Array.GetRandom(this.obstacleFrames);
        return {x:pX, lane:lane, image:`bg_${frame}`,  dmg:1, type:Consts.OB_OBSTACLE};
    } // getRandomObstacleConfig()

    /** GET random enemy config data from level settings */
    getEnemyConfig(x, lane) {
        let type = Phaser.Utils.Array.GetRandom(this.enemyTypes);
        return { x:x, lane:lane, type:type };
    } // getEnemyConfig()

    /** GET the next Player in any lane to left of object */
    getNextPlayer(obj) {
        return this.scene.playerCtrl.getNextRunner(obj)
    } // getNextPlayer()

    /** SET the obstacle frames used for this stage type */
    setObstacleFrames(frames) {
        this.obstacleFrames = frames;
    } // setObstacleFrames()

    /** SET the obstacle frames used for this stage type */
    setEnemyTypes(types) {
        this.enemyTypes = types;
    } // setEnemyTypes()

    /** GET the type of enemy according to current level Rank (Grem-O) */
    getEnemyTypes() {

        const zone = parseInt(sessionStorage.getItem(Consts.SES_STAGE_ZONE) || 1);
        switch (zone) {
            case 1: return [Consts.GREMLIN];
            case 2: return [Consts.GREMLIN, Consts.GOBLIN];
            case 3: return [Consts.GOBLIN];
            case 4: return [Consts.GOBLIN, Consts.OGOBLIN];
            case 5:
            case 6: return [Consts.OGOBLIN];
        } // switch (zone)

    } // getEnemyTypes()


    //  #   QUICK FNs AND GETTERS
    //  ========================================================================

    flash(sprite, tint) { this.scene.manager.flashObject(sprite, tint) }
    play(id) { this.scene.manager.playSound(id) }

    getCtrl() { return this.scene.playerCtrl }
    getEnCtrl() { return this.scene.enemyCtrl }
    getPlayer() { return this.scene.playerCtrl.player }
    getGen() { return this.scene.stageGen }

    getHUD() { return this.scene.scene.get('HUD') }
    getManager() { return this.scene.manager }


    //  #   SUBCLASSES TO OVERRIDE
    //  ========================================================================

    handle(ob) {}   //  OBSTACLE was touched valid
    generateLevel() {}  //  WHICH level to generate

    checkWinCondition() { return this.isWin; }
    checkLoseCondition() { return this.isLose; }

} // END CLASS //
