export {Consts as default};
const Consts = {

    MENU_CELL: 32,

    NONE: 0,

    //  #   SAVE DATA

    SAVE_DEFS: "sv_def_flag",
    SAVE_PLAYER_CHARACTER: "sv_pc",
    SAVE_PLAYER_TEAM: "sv_pt",

    SAVE_STAT_RANK: "sv_rkcl",

    SES_MAP_POS: "map_position_x",
    SES_STAGE_RANK_GAIN: "stage_rank_gain",
    SES_STAGE_ZONE: "stage_last_zone",

    //  #   HUD

    HUD_FULL_INTRO: 401,
    HUD_LEVEL_SELECT: 402,
    HUD_PLAYER: 403,
    HUD_RANK: 404,
    HUD_PAUSE: 405,
    HUD_ITCN: 406,
    HUD_OPTIONS: 407,

    //  #   SCENE

    SCENE_MENU: 1,
    SCENE_STAGE: 2,
    SCENE_PAUSE: 3,
    SCENE_FEEDBACK: 4,

    //  #   STAGE

    STAGE_RESCUE: 1,
    STAGE_NORMAL: 2,
    STAGE_EQUIP: 3,
    STAGE_ENSLAUGHT: 4,
    STAGE_PURSUE: 5,
    STAGE_AMBUSHRESCUE: 6,
    STAGE_CONVERT: 7,
    STAGE_ALLIED: 8,
    STAGE_WALL: 9,

    //  #   EVENTS

    EVENT_MENU_READY: "ev_menu_ready",

    EVENT_GAME_OVER: "ev_game_over",

    EVENT_ADD_SHADOW: "ev_stage_addShadow",
    EVENT_ADD_OBJECT: "ev_add_object",

    EVENT_HUD_BUTTON: "ev_hud_button",
    EVENT_HUD_SHOW: "ev_hud_show",
    EVENT_HUD_SHOW_GAME: "ev_hud_show_game",
    EVENT_HUD_SHOW_MENU: "ev_hud_show_menu",
    EVENT_HUD_STAGENAME: "ev_hud_stagename",
    EVENT_HUD_STAGEDATA: "ev_hud_data",

    //  #   SOUNDS

    SND_UI_SEL_LOC: 1,
    SND_UI_PAUSE: 2,
    SND_UI_OPEN_LOC: 3,
    SND_UI_MENUMOVE: 4,
    SND_UI_SELECT: 5,
    SND_UI_RUNNERLEVEL: 6,  //  Use UZIM (lvl 2)
    SND_UI_RANKUP: 7,
    SND_UI_RANKCHANGE: 8,

    SND_GAME_EQUIP: 101,
    SND_GAME_AVOIDLANE: 102,
    SND_GAME_BANG: 103,
    SND_GAME_BONUS: 104,
    SND_GAME_EN_DIE: 105,
    SND_GAME_TOUCH: 106,
    SND_GAME_CLASH: 107,
    SND_GAME_CONVERT: 108,

    SND_GAME_CHEER: 110,
    SND_GAME_PL_DIE: 111,

    //  Cage open

    //  - Multiple Sounds for single action

    SND_GAME_CLASH_A: 1071,
    SND_GAME_CLASH_B: 1072,
    SND_GAME_CLASH_C: 1073,

    MUS_MENU: 1101,
    MUS_BATTLE: 1102,
    MUS_COLLECT: 1103,

    //  #   OBSTACLES

    OB_OBSTACLE: 1,
    OB_CAGE: 2,
    OB_BOX: 3,

    //  #   BACKGROUND

    AREA_SPRINGS: 1,

    //  #   RUNNER STATES

    STATE_IDLE: 1,
    STATE_RUNNING: 2,
    STATE_WAITING: 3,
    STATE_DEAD: 4,
    STATE_OUT: 5,
    STATE_KO: 6,
    STATE_ATT: 7,
    STATE_CHARGE: 8,
    STATE_RETREAT: 9,
    STATE_UNAWARE: 10,
    STATE_FLEE_FW: 11,
    STATE_WALL: 12,

    //  #   INTERACTIVE TYPES

    PLAYER: 301,
    ENEMY: 302,
    DECOR: 303,

    //  #   CHARACTERS

    BLACK: 1,
    WHITE: 2,
    ASIAN: 3,
    GREMLIN: 4,
    GOBLIN: 5,
    OGOBLIN: 6,
    DEMON: 7,
    DOG: 11,

    //  #   ARMOUR

    CLOTH: 101,
    TUNIC: 102,
    HIDE: 103,
    BONE: 104,
    CHAIN: 105,
    PLATE: 106,
    CAPE: 107,

    HEADBAND: 110,
    BLUE: 111,
    MASK: 112,

    //  #   WEAPONS

    STICK: 201,
    POLE: 202,
    KNIFE: 203,
    FORK: 204,
    RING: 205,
    AXE: 206,
    SWORD: 207,
    SPEAR: 208,
    BOW: 209,

    BOMB: 210,
    STAFF: 211,

    //  #   CLASSES & RANKS (EASE of Reading)

    C_NORMAL: 1,
    C_HERO: 2,
    C_WARRIOR: 3,
    C_CHAMPION: 4,
    C_ELITE: 5,
    C_LEGENDARY: 6,

    R_CIVILIAN: 1,
    R_BRAWLER: 2,
    R_FIGHTER: 3,
    R_PRO: 4,
    R_SEASONED: 5,

    R_BRAVE: 6,
    R_SUPER: 7,
    R_CERTIFIED: 8,
    R_FEARLESS: 9,
    R_TRUE: 10,

    R_COMBATANT: 11,
    R_SOLDIER: 12,
    R_KNIGHT: 13,
    R_VETERAN: 14,
    R_GREAT: 15,

    R_HONOURED: 16,
    R_RESPECTED: 17,
    R_ESTEEMED: 18,
    R_REVERED: 19,
    R_REIGNING: 20,

    R_PLATED: 21,
    R_GOLD_I: 22,
    R_GOLD_II: 23,
    R_GOLD_III: 24,
    R_PLATINUM: 25,

    R_PALADIN: 26,
    R_LEGEND: 27,

    //  #   DEPTHS (Not Used - For reference)

    FLOOR: 1,
    SHADOWS: 2,
    DECOR_ONE: 3,
    DECOR_TWO: 160,
    DECOR_THREE: 192,
    TILES: 3,
    CLOUDS: 4
};

//  #   MAPPING

Consts.CHARACTERS = new Map([
    [Consts.BLACK, 'black'],
    [Consts.WHITE, 'white'],
    [Consts.ASIAN, 'asian'],
    [Consts.GREMLIN, 'gremlin'],
    [Consts.GOBLIN, 'goblin'],
    [Consts.OGOBLIN, 'ogoblin'],
    [Consts.DEMON, 'demon'],
    //[Consts.DOG, 'dog'],
]);

Consts.ARMOURS = new Map([
    [Consts.CLOTH, 'cloth'],
    [Consts.TUNIC, 'tunic'],
    [Consts.HIDE, 'hide'],
    [Consts.BONE, 'bone'],
    [Consts.CHAIN, 'chain'],
    [Consts.PLATE, 'plate'],
    [Consts.CAPE, 'cape'],

    [Consts.HEADBAND, 'headband'],
    [Consts.BLUE, 'blue'],
    [Consts.MASK, 'mask'],
]);

Consts.WEAPONS = new Map([
    [Consts.STICK, 'stick'],
    [Consts.POLE, 'pole'],
    [Consts.KNIFE, 'knife'],
    [Consts.FORK, 'fork'],
    [Consts.RING, 'ring'],
    [Consts.AXE, 'axe'],
    [Consts.SWORD, 'sword'],
    [Consts.SPEAR, 'spear'],
    [Consts.BOW, 'bow'],

    [Consts.BOMB, 'bomb'],
    [Consts.STAFF, 'staff'],
]);

Consts.GET_SHEET = function(id, armourID = -1, weaponID = -1) {

    const character = Consts.CHARACTERS.get(id);
    const armour = Consts.ARMOURS.get(armourID) || 'none';
    const weapon = Consts.WEAPONS.get(weaponID) || 'none';

    let sheet = `${character}_${armour}_${weapon}`;
    let run = sheet + "_run";
    let idle = sheet + "_idle";

    return {name:sheet, run:run, idle:idle};
};

//  #   SOUNDS

Consts.SOUNDS = new Map([

    [Consts.SND_UI_SEL_LOC, 'ui_pong'],
    [Consts.SND_UI_PAUSE, 'ui_phaserUp6'],
    [Consts.SND_UI_OPEN_LOC, 'ui_locOpen'],
    [Consts.SND_UI_MENUMOVE, 'ui_menuClick'],
    [Consts.SND_UI_SELECT, 'ui_select'],
    [Consts.SND_UI_RUNNERLEVEL, 'ui_runner_level'],
    [Consts.SND_UI_RANKUP, 'ui_rankUp'],
    [Consts.SND_UI_RANKCHANGE, 'ui_rankChange'],

    [Consts.SND_GAME_EQUIP, 'game_beltHandle2'],
    [Consts.SND_GAME_AVOIDLANE, 'game_cloth3'],
    [Consts.SND_GAME_BANG, 'game_bang'],
    [Consts.SND_GAME_BONUS, 'game_bonus'],
    [Consts.SND_GAME_EN_DIE, 'game_en_die'],
    [Consts.SND_GAME_TOUCH, 'game_touch'],
    [Consts.SND_GAME_CLASH_A, 'game_clash1'],
    [Consts.SND_GAME_CLASH_B, 'game_clash2'],
    [Consts.SND_GAME_CLASH_C, 'game_clash3'],
    [Consts.SND_GAME_CONVERT, 'game_convert'],

    [Consts.SND_GAME_CHEER, 'game_cheer'],
    [Consts.SND_GAME_PL_DIE, 'game_pl_die'],

    [Consts.MUS_MENU, 'mus_menu'],
    [Consts.MUS_COLLECT, 'mus_easy'],
    [Consts.MUS_BATTLE, 'mus_battle'],
]);

//  #   CLASSES AND RANKS

Consts.CLASSES = new Map([
    [Consts.C_NORMAL, 'Normal'],
    [Consts.C_HERO, 'Hero'],
    [Consts.C_WARRIOR, 'Warrior'],
    [Consts.C_CHAMPION, 'Champion'],
    [Consts.C_ELITE, 'Elite'],
    [Consts.C_LEGENDARY, 'Legendary']
]);

Consts.RANKS = new Map([

    [Consts.R_CIVILIAN, 'CIVILIAN'],
    [Consts.R_BRAWLER, 'BRAWLER'],
    [Consts.R_FIGHTER, 'FIGHTER'],
    [Consts.R_PRO, 'PRO'],
    [Consts.R_SEASONED, 'SEASONED'],

    [Consts.R_BRAVE, 'BRAVE'],
    [Consts.R_SUPER, 'SUPER'],
    [Consts.R_CERTIFIED, 'CERTIFIED'],
    [Consts.R_FEARLESS, 'FEARLESS'],
    [Consts.R_TRUE, 'TRUE'],

    [Consts.R_COMBATANT, 'COMBATANT'],
    [Consts.R_SOLDIER, 'SOLDIER'],
    [Consts.R_KNIGHT, 'KNIGHT'],
    [Consts.R_VETERAN, 'VETERAN'],
    [Consts.R_GREAT, 'GREAT'],

    [Consts.R_HONOURED, 'HONOURED'],
    [Consts.R_RESPECTED, 'RESPECTED'],
    [Consts.R_ESTEEMED, 'ESTEEMED'],
    [Consts.R_REVERED, 'REVERED'],
    [Consts.R_REIGNING, 'REIGNING'],

    [Consts.R_PLATED, 'PLATED'],
    [Consts.R_GOLD_I, 'GOLD_I'],
    [Consts.R_GOLD_II, 'GOLD_II'],
    [Consts.R_GOLD_III, 'GOLD_III'],
    [Consts.R_PLATINUM, 'PLATINUM'],

    [Consts.R_PALADIN, 'PALADIN'],
    [Consts.R_LEGEND, 'LEGEND']

]);

/** CALCULATE level based on a simple linear XP system (100xp per level) */
Consts.CALCLEVEL = function(xp) {
    let level = Math.ceil(xp / 100);    //  Lv.1 0-99xp
    let lv = (xp % 100 === 0) ? level + 1 : level;
    return lv;
} // calcLevel()

/** CALCULATE current class based on the given rank */
Consts.CALCCLASS = function(rank) {
    return Math.ceil(rank / 5);
};
