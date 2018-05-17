var level = 1;

var StateMain = {

    init: function(){

        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //this.scale.pageAlignHorizontally = true;
        //this.sclae.pageAlignHorizontally = true;
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.enableBody = true;
        game.physics.arcade.gravity.y = false;
        //game.physics.arcade.gravity.y = false;
        cursors = game.input.keyboard.createCursorKeys();

    },
    
    
    preload: function () {
        var mapPath = "maps/map"+level+".json";
        console.log(mapPath);

        game.load.spritesheet("robot", "../images/robot.png", 80, 111, 28);
        game.load.image("tiles","../images/tiles.png");
        game.load.tilemap("map",mapPath,null,Phaser.Tilemap.TILED_JSON);
    },

    create: function () {
        this.keyCount = [0, 0, 0, 0];
        this.need = this.keyCount[level - 1];
        this.collected = 0;

        //game.physics.startSystem(Phaser.Physics.ARCADE);

        this.robotSize = 0.5;
        
        // load map
        this.map = game.add.tilemap("map");
        this.map.addTilesetImage("tiles");

        this.layer = this.map.createLayer("Tile Layer 1");
        this.layer.resizeWorld();
        this.map.setCollisionBetween(0,1,1);

        this.robot = game.add.sprite(224, 416, "robot");
        this.robot.animations.add("idle", [0,1,2,3,4,5,6,7,8,9],12,true);
        this.robot.animations.add("walk", [10,11,12,13,14,15,16,17],12,true);
        this.robot.animations.add("jump", [18,19,20,21,22,23,24,25],12,false);

        this.robot.scale.x = this.robotSize;
        this.robot.scale.y = this.robotSize;

        this.robot.animations.play("idle");
        this.robot.anchor.set(0.5,0.5);
        game.physics.arcade.enable(this.robot);
        this.robot.body.allowGravity = false;
        //this.robot.body.gravity.y = 100;
        //this.robot.body.bounce.set(0.25);
        this.robot.body.collideWorldBounds = true;
        
        game.camera.follow(this.robot);
        //cursors = game.input.keyboard.createCursorKeys();
        this.map.setTileIndexCallback(3, this.reachedGoal, this);

    },

    gotKey: function(sprite, tile){
        this.map.removeTile(tile.x, tile.y, this.layer);
        this.collected++;
    },

    reachedGoal: function(sprite, tile){
        if (this.collected == this.need){
            level++;
            game.state.start("StateMain");
        }
    },

    update: function () {
        game.physics.arcade.collide(this.robot, this.layer);

        this.robot.body.velocity.x = 0;
        this.robot.body.velocity.y = 0;

        if (cursors.left.isDown){
            this.robot.body.velocity.x = -250;
        }
        else if (cursors.right.isDown){
            this.robot.body.velocity.x = 250;
        }

        if (this.robot.body.velocity.x >=0){
            this.robot.scale.x = this.robotSize;
        }
        else{
            this.robot.scale.x = -this.robotSize;
        }


        if (cursors.up.isDown){
            this.robot.body.velocity.y = -250;
        }

        if (cursors.down.isDown){
            this.robot.body.velocity.y = 250;
        }


        if (Math.abs(this.robot.body.velocity.x)>50 || Math.abs(this.robot.body.velocity.y)>50){
            this.robot.animations.play("walk");
        }
        else{
            this.robot.animations.play("idle");
        }
    }
}