/**
* @copyright    Umz
* @classdesc    COMMON.js to export functions used across the scenes
* @version      0.01
*/

/**
* GET the 2 background squares used to cover the screen
*/
export function getBGCover(scene, label, cf) {

    const camera = scene.cameras.main;
    const width = camera.width;
    const height = camera.height;
    const cX = width * .5;
    const cY = height * .5;

    let alpha1 = cf?.a1 ?? .4;
    let alpha2 = cf?.a2 ?? .6;
    let c2H = cf?.height ?? (height * .8);

    //  #   CREATE the objects for cover

    let cover1 = scene.add.image(cX, cY, '_square').setDisplaySize(width, height).setAlpha(alpha1);
    cover1.setInteractive().on('pointerdown', ()=>{});
    let cover2 = scene.add.image(cX, cY, '_square').setDisplaySize(width * .4, c2H).setAlpha(alpha2);

    let titY = cover2.getTopCenter().y + (c2H * .1);
    let title = scene.add.bitmapText(cX, titY, 'seog14', label).setOrigin(.5).setScale(1.2);

    //  #   CREATE the default tween for background entry

    let timeline = scene.tweens.createTimeline();
    timeline.add({
        targets: cover1,
        duration: 200,
        scaleX: {start:0, from:0, to:cover1.scaleX},
        scaleY: {start:0, from:0, to:cover1.scaleY}
    });
    timeline.add({
        targets: cover2,
        duration: 300,
        scaleX: {start:0, from:0, to:cover2.scaleX},
        scaleY: {start:0, from:0, to:cover2.scaleY},
        ease: 'Back.Out'
    });
    timeline.add({
        targets: title,
        duration: 500,
        alpha: {from:0, to:1, start:0}
    });

    //  #   RETURN the objects to be used (Tween will not play until called)

    return {
        cover1: cover1,
        cover2: cover2,
        title: title,
        timeline: timeline
    };
};

/** GET a random name for the Player Selection (5 chars) */
export function getRandomName() {

    const c1 = 'ADFGKMPQTVZ';
    const c2 = 'AEIOU';
    const c3 = 'GHJNESVXYZ';

    let l1 = Phaser.Utils.Array.GetRandom(c1.split(""));
    let l2 = Phaser.Utils.Array.GetRandom(c2.split(""));
    let l3 = Phaser.Utils.Array.GetRandom(c2.split(""));
    let l4 = Phaser.Utils.Array.GetRandom(c3.split(""));
    let l5 = Phaser.Utils.Array.GetRandom(c2.split(""));

    return (l1 + l2 + l3 + l4 + l5);

};


//  #   ARRAY GROUP FUNCTIONS
//  ============================================================================

/** KEEP grabbing the first item in the array list, perform function and check to remove */
export function firstOfArray(arr, fn, data) {
    if (arr.length > 0) {
        let item = arr[0];
        if (fn(item, data, arr))
            Phaser.Utils.Array.Remove(arr, item);
    } // if (array size > 0)
};

/** LOOP backward through an array performing the given fn on each item */
export function loopArray(arr, fn, data) {
    for (let i=arr.length; --i>=0;) {
        let obj = arr[i];
        fn(obj, i, arr, data);
    } // for (items)
};

/** LOOP backward through array of time sensitive elements calling when complete */
export function clearTimed(arr, delta, fn) {
    for (let i=arr.length; --i>=0;) {
        let obj = arr[i];
        obj.time -= delta;
        if (obj.time <= 0)
            fn(obj, arr);
    } // for (flashes)
};

/** GET the object from the array matching the conditional or create a new object */
export function getObject(arr, conditionFn, newObject, oldObj) {

    let rett = arr.find(conditionFn);
    if (!rett) {
        rett = newObject();
        arr.push(rett);
    }
    else
        oldObj(rett);

    return rett;
};

export function template(scene) {};
