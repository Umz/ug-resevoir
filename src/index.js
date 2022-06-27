import 'phaser';

import Boot from 'scenes/Boot.js';
import Preload from 'scenes/Preload.js';
import Menu from 'scenes/Menu.js';
import Stage from 'scenes/Stage.js';
import Feedback from 'scenes/Feedback.js';
import Pause from 'scenes/Pause.js';
import HUD from 'scenes/HUD.js';

var config = {

    type: Phaser.AUTO,
    width: 480,
    height: 240,

    parent: 'phaser-canvas',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,

    /*
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    */

    scene: [
        Boot,
        Preload,
        Menu,
        Stage,
        HUD,
        Feedback,
        Pause
    ]
};
const game = new Phaser.Game(config);
