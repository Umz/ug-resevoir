/**
* @copyright    Umz
* @classdesc    DRAG the camera smoothly on the given scene
* @version      0.02
*/
export default class CameraDrag {

    constructor(scene) {

        this.scene = scene;
        this.camera = scene.cameras.main;

        this.dragLastX = 0;
        this.dragLastY = 0;
        this.lastDown = 0;

        this.downTime = 0;
        this.dragCheck = false;
        this.camSpeedX = 0;
        this.camSpeedY = 0;

        this.smoothTime = 0;
        this.smoothLastX = 0;
        this.smoothLastY = 0;

        //  TH - TOUCH HOLDING

        this.th = {
            isDown: false,
            count: 0,
            action: 1500,
            pos: {x:0, y:0}
        };

        this.addToInput();      //  AUTO-adds

    } // constructor

    /** ADD listeners to input to allow the camera to be dragged */
    addToInput() {

        this.scene.input.on('pointermove', this.dragHandler, this);
        this.scene.input.on('pointerdown', this.downHandler, this);
        this.scene.input.on('pointerup', this.upHandler, this);

        this.scene.updaters.push(this);

    } // fn() addToInput

    update(number, delta) {

        //  #   MOUSE held down handler

        if (this.th.isDown && this.th.started) {
            this.th.count += delta;
            //if (this.th.count >= this.th.action) {} // if (held X seconds)
        } // if (holding)

        //  #   CAMERA smooth scroll updating

        if (this.camSpeedX != 0 || this.camSpeedY != 0) {

            let camera = this.camera;

            let speedX = this.camSpeedX;
            let speedY = this.camSpeedY;
            let reduceTime = 1000;

            let scrollX = ((speedX * 2) / reduceTime) * delta;
            let scrollY = ((speedY * 2) / reduceTime) * delta;

            camera.scrollX += scrollX;
            //camera.scrollY += scrollY;

            // Reduce speed of scroll

            this.camSpeedX -= (this.camSpeedX * .8) / 100 * delta;
            //this.camSpeedY -= (this.camSpeedY * .8) / 100 * delta;

            // Absolute values to stop movement

            let absX = Math.abs(this.camSpeedX);
            let absY = Math.abs(this.camSpeedY);
            if (absX <= 8 && absY <= 8) {
                this.camSpeedX = 0;
                //this.camSpeedY = 0;
            } // if (both slowed)

        } // if (camera scrolling)

    } // fn() update

    //  #   INPUT HANDLERS

    /** Input down - register the position and prepare to move the camera */
    downHandler(pointer) {

        let camera = this.camera;

        let distX = (this.dragLastX - pointer.x);
        let distY = (this.dragLastY - pointer.y);
        this.dragLastX = pointer.x;
        this.dragLastY = pointer.y;

        this.th.pos.x = pointer.worldX;
        this.th.pos.y = pointer.worldY;

        // Camera smooth scrolling listener

        this.camSpeedX = 0;
        this.camSpeedY = 0;
        this.dragCheck = false;

        //  #   TOUCH HOLDING

        this.th.isDown = true;
        this.th.started = true;

    } // fn() downHandler

    /** Input dragging - nove the camera in the opposite direction of the mouse */
    dragHandler(pointer) {

        let camera = this.camera;
        let fullWidth = camera.getBounds().width - camera.width;

        let distX = (this.dragLastX - pointer.x) * 1.25;
        let distY = (this.dragLastY - pointer.y) * 1.25;

        if (pointer.isDown && this.th.started) {

            this.smoothTime = this.downTime;
            this.smoothLastX = this.dragLastX;
            this.smoothLastY = this.dragLastY;

            //  #   STOP bumping on edge
            distX = (distX < 0 && camera.scrollX == 0) ? 0 : distX;
            distX = (distX > 0 && camera.scrollX >= fullWidth) ? 0 : distX;

            camera.scrollX += distX;
            //camera.scrollY += distY;
            this.dragLastX = pointer.x;
            this.dragLastY = pointer.y;

        } // if (down)

        // Smooth scroll handling

        this.downTime = this.scene.time.now;
        this.dragCheck = true;

        //  #   TOUCH HOLDING

        this.th.isDown = false;
        this.th.count = 0;

    } // fn()

    /** Input released - keep moving the camera after the mouse is released */
    upHandler(pointer) {

        let distX = (this.smoothLastX - pointer.x);
        let distY = (this.smoothLastY - pointer.y);
        let elapsed = (this.scene.time.now - this.downTime) || 17;    // Default to 60fps
        let mulTime = (1000 / elapsed);     // Mul for dist per second

        // Direction, speed

        if (this.dragCheck && this.th.started) {

            this.camSpeedX = distX * mulTime;
            this.camSpeedY = distY * mulTime;

        } // if (dragged)

        //  #   TOUCH HOLDING

        this.th.isDown = false;
        this.th.started = false;
        this.th.count = 0;

    } // fn() upHandler

} // END CLASS //
