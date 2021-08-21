var userID = Math.random() * 10

const socket = io(`http://localhost:3000?token=${userID}`, {transports: ['websocket'], upgrade: false});
function hello(){
  console.log("dayyy nè")
}
socket.once('connect', () => {

  const game = new Phaser.Game(800, 600, Phaser.AUTO, '', {
      preload: preload,
      create: create,
      update: update
  })
    
    // Declare shared variables at the top so all methods can access them
    let score = 0
    let scoreText
    let guide
    let platforms
    let diamonds
    let cursors
    let player
    let door
    let itemBox
    let sky
    let player1 // hide player
    let playerName // hide player
    let playerNameOther = []// hide player


    var buttonOkGuide;
    let playerOther = []
    
    function preload () {
      // Load & Define our game assets
      game.load.image('sky', '../assets/sky.png')
      game.load.image('ground', '../assets/platform.png')
      game.load.image('diamond', '../assets/diamond.png')
      game.load.image('door', '../assets/door.png')
      game.load.image('itemBox', '../assets/box2.png')
      game.load.spritesheet('woof', './assets/woof.png', 32, 32)
      game.load.spritesheet('woofHide', './assets/ava2.png', 32, 32)

      game.load.spritesheet('button', './assets/box2.png', 20,70);
      // game.load.spritesheet('buttonOpenGuide', './assets/buttonOpenGuide.png', 20,70);


    }
    let screen  = 1;
    function create (screen) {
      socket.emit('CSS_JOIN_GAME', { name : `user${userID}` });
    
      //  We're going to be using physics, so enable the Arcade Physics system
      game.physics.startSystem(Phaser.Physics.ARCADE)
    
      //  A simple background for our game
      sky = game.add.sprite(0, 0, 'sky')
    
      //  The platforms group contains the ground and the 2 ledges we can jump on
      platforms = game.add.group()
    
      //  We will enable physics for any object that is created in this group
      platforms.enableBody = true
    
      // Here we create the ground.
      const ground = platforms.create(0, game.world.height - 64, 'ground')
    
      //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
      ground.scale.setTo(2, 2)
    
      //  This stops it from falling away when you jump on it
      ground.body.immovable = true
    
      //  Now let's create two ledges
      // let ledge = platforms.create(400, 450, 'ground')
      // ledge.body.immovable = true
    
      ledge = platforms.create(-75, 350, 'ground')
      ledge.body.immovable = true
    

      //  Finally some diamonds to collect
      diamonds = game.add.group()
    
      //  Enable physics for any object that is created in this group
      diamonds.enableBody = true
      
      //  Create 12 diamonds evenly spaced apart
      for (var i = 0; i < 12; i++) {
        const diamond = diamonds.create(i * 70, 0, 'diamond')
    
        //  Drop em from the sky and bounce a bit
        diamond.body.gravity.y = 1000
        diamond.body.bounce.y = 0.3 + Math.random() * 0.2
      }

      //  Now let's create door
      door = game.add.group()
      door.enableBody = true
      let _door = door.create(23000, 9500, 'door')
      door.width = 40;
      door.height = 60;
      _door.type = 1;
      // this screen have two dooe
      if(screen == 2){
        console.log('----?')
        let _door2 = door.create(20000, 7000, 'door')
        _door2.type = 2;
      }
    

      //  Now let's create itemBox
  
      itemBox =  game.add.group();
      itemBox.enableBody = true
      let _box = itemBox.create(0, 290, 'itemBox')
      _box.width = 40;
      _box.height = 60;
      console.log({_box})
      // if(screen == 1){
      //   //  Create 12 diamonds evenly spaced apart
      //   for (var i = 0; i < 12; i++) {
      //     const diamond = diamonds.create(i * 70, 0, 'itemBox')
      
      //     //  Drop em from the sky and bounce a bit
      //     diamond.body.gravity.y = 1000
      //     diamond.body.bounce.y = 0.3 + Math.random() * 0.2
      //   }
      // }
      
      // if(screen == 1){
      //   let _box = box.create(23000, 7000, 'door')
      //   box.width = 40;
      //   box.height = 60;
      //   // _box.type = 1;
      // }


      // The player and its settings
      player = game.add.sprite(32, game.world.height - 150, 'woof')
    
      //  We need to enable physics on the player
      game.physics.arcade.enable(player)
    
      //  Player physics properties. Give the little guy a slight bounce.
      player.body.bounce.y = 0.2
      player.body.gravity.y = 800
      player.body.collideWorldBounds = true
    
      //  Our two animations, walking left and right.
      player.animations.add('left', [0, 1], 10, true)
      player.animations.add('right', [2, 3], 10, true)
      player.animations.add('top', [2, 3], 10, true)
      player.animations.add('bottom', [2, 3], 10, true)

      playerName = game.add.text(player.x, player.y, '', { fontSize: '15px', fill: '#000' });
      playerName.text = `User_${userID}`;
  
      //  Create the score text
      scoreText = game.add.text(16, 16, '', { fontSize: '10px', fill: '#000' });

      // Create the guide
      guide       =  game.add.text(16, 16, '', { fontSize: '10px', fill: '#000' });
      guide.text  = '';
      showGuide(true);
    
      // buttton OK guide

      // buttonOkGuide.

      //  And bootstrap our controls
      cursors = game.input.keyboard.createCursorKeys();

    }
    
    function update (isNewUser) {
      //  We want the player to stop when not moving
      player.body.velocity.x = 0
    
      //  Setup collisions for the player, diamonds, and our platforms
      // game.physics.arcade.collide(player, platforms)
      // game.physics.arcade.collide(diamonds, platforms)
      game.physics.arcade.collide(player, platforms)
      game.physics.arcade.collide(diamonds, platforms)
      game.physics.arcade.collide(door, platforms)
    
      //  Call callectionDiamond() if player overlaps with a diamond
      game.physics.arcade.overlap(player, diamonds, collectDiamond, null, this)

      //  Call callectionDiamond() if player overlaps with a door
      game.physics.arcade.overlap(player, door, nextDoor, null, this)

      //  Call callectionDiamond() if player overlaps with a box
      game.physics.arcade.overlap(player, itemBox, hideInbox, null, this)

      // Configure the controls!
      if (cursors.left.isDown) {
        player.body.velocity.x = -150
        player.animations.play('left');
        playerMoving()
      } 
      if (cursors.right.isDown) {
        player.body.velocity.x = 150
        player.animations.play('right')
        playerMoving()
      } 
      if (cursors.down.isDown) {
          player.body.velocity.y =  150
          player.animations.play('bottom');
          playerMoving()
        }
      if (cursors.up.isDown) {
        player.body.velocity.y =  - 150
        player.animations.play('top');
        playerMoving()

      }
      // If no movement keys are pressed, stop the player
      // player.animations.stop()
    
      //  This allows the player to jump!
      if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -400
      }

      // Show an alert modal when score reaches 120
      // if (score === 120) {
      //   alert('You win!')
      //   score = 0
      // }
    }
    function nextDoor(player, door){
      var keyObj = game.input.keyboard.addKey('65');  // Get key object
      if(keyObj.isDown){
        console.log('/.press A')
        // delete old sceen
        platforms.destroy();
        diamonds.destroy();

        if(door.type && door.type != screen){
          screen = door.type;
        }

        if(door.type === screen){
          screen = screen + 1;
        }
        
        console.log('hello', screen );
        create(screen);
      }
    
    }

    function showGuide(isShow){

      if(isShow){
        guide.text = ' Press A to get/use item or open door\n Move up, down, left right with key updown left right \n fly is space';
        if (buttonOkGuide && typeof buttonOkGuide.destroy !== "undefined") { 
          buttonOkGuide.destroy();
        }
        buttonOkGuide = game.add.button(20, 130, 'button', actionOnClickOkGuide, this, 2, 1, 0);
        console.log({ buttonOkGuide });
        buttonOkGuide.open = false;
      }else{
        // game.load.spritesheet('button', './assets/buttonOpenGuide.png', 20,70);
        guide.text = '';
        buttonOkGuide.destroy();
        buttonOkGuide = game.add.button(20, 10, 'button', actionOnClickOkGuide, this, 2, 1, 0);
        buttonOkGuide.open = true;
      
      }
      buttonOkGuide.width = 40;
      buttonOkGuide.height = 60;
    }

    function collectDiamond (player, diamond) {

      // Removes the diamond from the screen
      diamond.kill()
    
      //  And update the score
      score += 10
      scoreText.text = 'Score: ' + score
    }

    function actionOnClickOkGuide(){
      console.log('okkkk');
      guide.text = '';
      if(buttonOkGuide.open){
        showGuide(true);
        return
      }else{
        showGuide(false);
      }
    }

    function hideInbox(){
      console.log('ehllooo hide in here')
      player.loadTexture('woofHide');
    }


    function playerMoving(){
      itemBox.forEach(box=>{
        console.log({x : box.x, y : box.y, yP : player.y , xP : player.x })
        if( player.x > box.x +40  ||   ( player.y > box.y +60 ||  player.y < box.y )){
          player.loadTexture('woof');
        }
      })
      playerName.x = player.x;
      playerName.y = player.y;

      socket.emit('CSS_USER_MOVING', { name : `user${userID}`, x : player.x, y : player.y});

    }

    function createUser(id){
      console.log({id, userID})
      if(id ==  `user${userID}`){
        return
      }
        // The player and its settings
        playerOther[id] = game.add.sprite(32, game.world.height - 150, 'woof')
        playerOther[id]._id = id;
        //  We need to enable physics on the player
        // game.physics.arcade.enable(playerOther[id])
      
        // //  Player physics properties. Give the little guy a slight bounce.
        //  playerOther[id].body.bounce.y = 0.2
        //  playerOther[id].body.gravity.y = 800
        //  playerOther[id].body.collideWorldBounds = true
      
        // //  Our two animations, walking left and right.
        //  playerOther[id].animations.add('left', [0, 1], 10, true)
        //  playerOther[id].animations.add('right', [2, 3], 10, true)
        //  playerOther[id].animations.add('top', [2, 3], 10, true)
        //  playerOther[id].animations.add('bottom', [2, 3], 10, true)

        // Create the guide
        // guide       =  game.add.text(player.x, player.y, '', { fontSize: '12px', fill: '#000' });
        // guide.text  = id;

        playerNameOther[id] = game.add.text(playerOther[id].x+20, playerOther[id].y+20, '', { fontSize: '15px', fill: '#000' });
        playerNameOther[id].text = `User_${id}`;
      
    }
    function UpdateLocationUser({id, _x, _y}){
      if(id ==  `user${userID}`){
        return
      }
      if(!playerOther[id]){
        createUser(id)
      }
        
      playerOther[id].x = _x;
      playerOther[id].y = _y;


      playerNameOther[id].x = _x;
      playerNameOther[id].y = _y;

    }

    socket.on('SSC_NEW_USER', resp =>{
      console.log({socketID :  resp})
      resp.arrayUser.forEach(user=>{
        if(resp.user != user){
          createUser(user);
        }
      })
    })
    socket.on('SSC_USER_MOVING', resp =>{
      console.log({resp})
      let name  = resp.name;
      UpdateLocationUser({id : name, _x : resp.x, _y : resp.y})
      // player.forEach(player=>{
      //   console.log({playerID : player._id})
       
      // })
      // createUser(resp.user);
    })
})