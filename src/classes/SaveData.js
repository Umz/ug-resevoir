import Consts from 'classes/Consts.js';

/**
* @copyright    Umz
* @classdesc    SAVE DATA create data and saves to storage
* @version      0.01
*/
export default class SaveData {

    constructor() {} // constructor()

    /** CREATE default data for the game all at once */
    createDefaults() {

        let flag = localStorage.getItem(Consts.SAVE_DEFS);
        if (!flag) {

            let playerEquip = {race:-1, armour:Consts.NONE, weapon:Consts.NONE, name:'UMZI', exp:0, newXP:0};
            let playerRank = {rank:Consts.R_CIVILIAN, class:Consts.C_NORMAL, exp:0};

            //let playerEquip = {race:1, armour:Consts.CAPE, weapon:Consts.SPEAR, name:'UMZI', exp:600, newXP:0};
            //let playerRank = {rank:Consts.R_LEGEND, class:Consts.C_LEGENDARY, exp:1598};

            this.saveObjectToStorage(Consts.SAVE_PLAYER_CHARACTER, playerEquip);
            this.saveObjectToStorage(Consts.SAVE_STAT_RANK, playerRank);

            let team = [
                //{race:Consts.BLACK, armour:Consts.CLOTH, weapon:Consts.POLE, exp:0, newXP:0},
                //{race:Consts.BLACK, armour:Consts.CLOTH, weapon:Consts.POLE, exp:0, newXP:0},
            ];
            //for (let i=0;i<(4*4);i++)
                //team.push({race:Consts.BLACK, armour:Consts.CLOTH, weapon:Consts.POLE, exp:0, newXP:0});
                //team.push({race:Consts.BLACK, armour:Phaser.Math.Between(Consts.CLOTH, Consts.CHAIN), weapon:Phaser.Math.Between(Consts.STICK, Consts.KNIFE), exp:Phaser.Math.Between(200,500), newXP:0});
            this.savePlayerTeam(team);

            let track = {kills:0, complete:0, failed:0, playtime:0, stagetime:0};
            //  perfect presses
            //  null presses

        } // if (no defaults flag)
        localStorage.setItem(Consts.SAVE_DEFS, true);

    } // createDefaults()

    //  #   SESSION HANDLING

    /** GENERIC function to add value to property values of save objects */
    addToSession(key, value) {
        let item = parseInt(sessionStorage.getItem(key)) || 0;
        sessionStorage.setItem(key, (item + value));
    } // addToProperty()

    //  #   RANK

    /** SAVE the full ranking information */
    saveRankClass(cl, rank, exp) {
        this.setProperty(Consts.SAVE_STAT_RANK, 'class', cl);
        this.setProperty(Consts.SAVE_STAT_RANK, 'rank', rank);
        this.setProperty(Consts.SAVE_STAT_RANK, 'exp', exp);
    } // saveRankClass()
    getRankClass() { return this.getObjectFromStorage(Consts.SAVE_STAT_RANK) }

    //  #   PLAYER CHARACTER DATA : Ease of use functions
    //  ========================================================================

    updateAllXP() {

        let pd = this.getPlayerData();
        pd.exp = Math.min(pd.exp + pd.newXP, 600);   //  MAX Lv. 7
        pd.newXP = 0;
        this.savePlayerData(pd);

        let td = this.getPlayerTeam();
        for (let dat of td) {
            dat.exp = Math.min(dat.exp + dat.newXP, 600);   //  MAX Lv. 7
            dat.newXP = 0;
        } // for (all members)
        this.savePlayerTeam(td);

    } // updateAllXP()

    /** CLEAR all exp gained in the last levels */
    clearAllXP() {

        let pd = this.getPlayerData();
        pd.newXP = 0;
        this.savePlayerData(pd);

        let td = this.getPlayerTeam();
        for (let dat of td)
            dat.newXP = 0;
        this.savePlayerTeam(td);

    } // clearAllXP()

    savePlayerData(data) { this.saveObjectToStorage(Consts.SAVE_PLAYER_CHARACTER, data) }

    /** SAVE the new race of the Player (keeps the current equipment) */
    savePlayerRace(race) { this.setProperty(Consts.SAVE_PLAYER_CHARACTER, 'race', race) } // savePlayerRace()
    savePlayerName(name) { this.setProperty(Consts.SAVE_PLAYER_CHARACTER, 'name', name) } // savePlayerName()

    getPlayerData() { return this.getObjectFromStorage(Consts.SAVE_PLAYER_CHARACTER) }      //  MAIN Character
    getPlayerTeam() { return this.getObjectFromStorage(Consts.SAVE_PLAYER_TEAM) || [] }     //  MAIN Team

    /** ADD a new Player to team */
    addToPlayerTeam(data) {
        let team = this.getPlayerTeam();
        team.push(data);
        this.saveObjectToStorage(Consts.SAVE_PLAYER_TEAM, team);
    } // addToPlayerTeam()

    savePlayerTeam(teamArray) { this.saveObjectToStorage(Consts.SAVE_PLAYER_TEAM, teamArray) }

    //  QUICK fn's for arrays
    //  ADD, REMOVE, UPDATE

    //  #   TESTERS below

    getPlayerTeam2() { return [
        {race:Consts.WHITE, armour:Consts.TUNIC, weapon:Consts.NONE},
        {race:Consts.ASIAN, armour:Consts.NONE, weapon:Consts.NONE}
    ] }

    getPlayerTeam2() { return [
        {race:Consts.BLACK, armour:Consts.CAPE, weapon:Consts.BOW},
        {race:Consts.ASIAN, armour:Consts.PLATE, weapon:Consts.SPEAR},
        {race:Consts.WHITE, armour:Consts.CHAIN, weapon:Consts.SWORD},
        {race:Consts.BLACK, armour:Consts.BONE, weapon:Consts.AXE},
        {race:Consts.ASIAN, armour:Consts.HIDE, weapon:Consts.RING},
        {race:Consts.WHITE, armour:Consts.TUNIC, weapon:Consts.FORK},
        {race:Consts.BLACK, armour:Consts.CLOTH, weapon:Consts.KNIFE},
        {race:Consts.ASIAN, armour:Consts.NONE, weapon:Consts.POLE},
        {race:Consts.WHITE, armour:Consts.BONE, weapon:Consts.STICK},
    ] }


    //  #   STORAGE HANDLING
    //  ========================================================================

    /** LOAD data string from storage */
    loadFromStorage(key) {
        return localStorage.getItem(key);
    } // loadFromStorage()

    /** SAVE data string to storage key */
    saveToStorage(key, string) {
        localStorage.setItem(key, string);
    } // saveToStorage()

    //  -   CREATING Strings for Storage

    /** TAKES an object and creates a string for saving */
    encodeObjectToString(obj) {
        let str = JSON.stringify(obj);
        let encoded = window.btoa(str);
        return encoded;
    } // encryptJSON()

    /** TAKES a saved String and returns an object */
    decodeStringToObject(asc) {
        let jsonstr = window.atob(asc);
        let parse = (str) => { try { return JSON.parse(str) } catch (e) { return null } };
        let obj = parse(jsonstr);
        return obj;
    } // decryptJSON()

    //  -   OBJECT storage

    /** CONVERT the object to string and save in storage */
    saveObjectToStorage(key, data) {
        let str = this.encodeObjectToString(data);
        this.saveToStorage(key, str);
    } // saveObjectToStorage()

    /** GET a useable data object from storage */
    getObjectFromStorage(key) {
        let str = this.loadFromStorage(key);
        return this.decodeStringToObject(str);
    } // getObjectFromStorage()

    /** GENERIC function to change property values of save objects */
    setProperty(storeKey, property, value) {
        const data = this.getObjectFromStorage(storeKey);
        data[property] = value;
        this.saveObjectToStorage(storeKey, data);
    } // setProperty

    /** GENERIC function to add value to property values of save objects */
    addToProperty(storeKey, property, value) {
        const data = this.getObjectFromStorage(storeKey);
        data[property] += value;
        this.saveObjectToStorage(storeKey, data);
    } // addToProperty()

} // END CLASS //
