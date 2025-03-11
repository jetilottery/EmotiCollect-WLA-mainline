/**
 * @module game/revealAllFunc
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'game/audioManager',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'game/utils/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
    'game/boardEmoji',
    'game/accumulateAnim',
    'com/gsap/TweenLite',
    'com/gsap/TweenMax',
    'game/utils/spriteFuncs',
	'com/pixijs/pixi',
    'game/idle'
], function (msgBus, audio, gr, loader, SKBeInstant, config, boardEmoji, accumulateAnim, TweenLite, TweenMax, spriteFuncs, PIXI, idle) {  

    var orientation;

    function show(inObj){
        orientation = SKBeInstant.getGameOrientation();
        initVars();
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.visible =  true;
        generate();
        populate(inObj.col);
    }

    var isGenerated = false;
    var cube = [];
    var columnArrays = [];
    var initialOrderOfCubes = [];
    var main_newPositionArray = [];
    var main_initialOrderOfCubes = [];
    var main_newOrderOfCubes = [];
    var changeInState = false;
    var yPositions = [];
    var xPositions = [];
    var initCascadeCount = 60;
    var cascadeComplete = false;
    var emojiMask;
    var tweenIntervals = [];
    var cubeTweens = [];
    var arrayOfProcessedSquares = [];
    var turnInProgress = false;
    var accumulateClip;
    var arrayOfFreeSpinsFound = [];
    var lookAtWheelArray = [[0,0,1,4,4,4],[0,0,1,3,4,4],[0,0,1,3,4,4],[0,0,1,3,4,4],[0,0,1,2,3,4],[0,0,1,2,3,3],[0,0,1,2,3,3],[0,0,1,2,3,3],[0,0,1,2,3,3],[0,0,1,2,3,3]];
    var startTurnInfo = {};

    function initVars(){
        initCascadeCount = 60;
        initialOrderOfCubes = [];
        main_newPositionArray = [];
        main_initialOrderOfCubes = [];
        main_newOrderOfCubes = [];
        cascadeComplete = false;
        tweenIntervals = [];
        cubeTweens = [];
        arrayOfProcessedSquares = [];
        xPositions = [];
        xPositions = [];
        arrayOfFreeSpinsFound = [];
        startTurnInfo = {};
    }

    var growFreeSpin, freeSpinAnim, endFreeSpinAnim, freeSpinAwarded, freeSpinAwardedText, freespinPlusOneClip;

    function generate(){
        if (isGenerated){
            return;
        }

       for (var i = 1; i < 11; i++){
            cube[i-1] = [];
            for (var j = 1; j < 7; j++){                
                cube[i-1][j-1] = new boardEmoji(gr.lib._gameBoard.sprites._cubesClip.sprites["_cube_"+i+"_"+j].pixiContainer, i, j);
            }
        }

        //now also create the accumulate animations
        accumulateClip = new accumulateAnim(gr.lib._gameBoardDummy.sprites._cubesClipDummy.sprites._accumAnim.pixiContainer);

        //and also the two free spin animations: the growing one, that we position
        growFreeSpin = spriteFuncs.createMovieClip("FreeSpinsSymbolLargeStart_000",1,13,2,0.5);
        growFreeSpin.x = (gr.lib._gameBoard.sprites._cubesClip.pixiContainer.width - 370) / 2;
        growFreeSpin.y = (gr.lib._gameBoard.sprites._cubesClip.pixiContainer.height - 370) / 2;
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.addChild(growFreeSpin);
        growFreeSpin.visible = false;
        //the spinning one
        freeSpinAnim = spriteFuncs.createMovieClip("FreeSpinsSymbolLargeLoop_000",1,6,2,0.5);
        freeSpinAnim.x = (gr.lib._gameBoard.sprites._cubesClip.pixiContainer.width - 370) / 2;
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.addChild(freeSpinAnim);
        freeSpinAnim.visible = false;
        //the end spin one
        endFreeSpinAnim = spriteFuncs.createMovieClip("FreeSpinsSymbolLargeEnd_000",0,13,2,0.5);
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.addChild(endFreeSpinAnim);
        endFreeSpinAnim.visible = false;

        //add the free spin awarded text
        freeSpinAwarded = new PIXI.Container();
        freeSpinAwardedText = new PIXI.Text(loader.i18n.game.freeSpinAwarded,{fontFamily : 'Bowlby One SC', fontSize: 50, stroke: 'black', strokeThickness: 10, fill : 0xFFFFFF, align : 'center'});
        freeSpinAwarded.addChild(freeSpinAwardedText);
        //and the plus one
        freespinPlusOneClip = spriteFuncs.spriteFromTexture("freespinPlusOne");
        freeSpinAwarded.addChild(freespinPlusOneClip);
        freespinPlusOneClip.x = 0 - (freespinPlusOneClip.width / 2);
        freespinPlusOneClip.y = 0 - (freespinPlusOneClip.height / 2) - (freespinPlusOneClip.height / 2);
        //position the text
        freeSpinAwardedText.x = 0 - (freeSpinAwardedText.width / 2);
        freeSpinAwardedText.y = 0 - (freeSpinAwardedText.height / 2);
        freeSpinAwarded.x = gr.lib._gameBoard.sprites._cubesClip.pixiContainer.width / 2;
        freeSpinAwarded.y = gr.lib._gameBoard.sprites._cubesClip.pixiContainer.height / 2;
        freeSpinAwarded.scale.x = 0.25;
        freeSpinAwarded.scale.y = 0.25;
        freeSpinAwarded.alpha = 0;
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.addChild(freeSpinAwarded);
        freeSpinAwarded.visible = false;

        emojiMask = new PIXI.Graphics();
        emojiMask.beginFill("rgba(255,255,255,0)"); // black color
        // x, y, width, height, radius
        emojiMask.drawRoundedRect(0,0,588,370,24);
        emojiMask.endFill();
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.addChild(emojiMask);

        isGenerated = true;
    }

    function populate(col){
        console.log("col: "+col);
        columnArrays = col.slice(); 
        //this is where we will set each cube to their starting state
        //we need to do some trickery here          
        for (var i = 1; i < 11; i++){
            initialOrderOfCubes[i-1] = [];
            //this loop will run per column             
            for (var j = 1; j < 7; j++){
                //this loop will run per row  
                initialOrderOfCubes[i-1][j-1] = "cube_"+i+"_"+j; //cube[i-1][j-1];
                //set the state
                cube[i-1][j-1].setState(col[i-1][j-1]);
            }
        }
        idle.updateCubes(cube);
        storeInitialPositions();
    }

    function storeInitialPositions(){
        //also find out the position of the cubes
        for (var i = 1; i < 11; i++)
        {
            if (!changeInState){
                yPositions[i-1] = [];
                xPositions[i-1] = [];   
            }                           
            
            //this loop will run per column             
            for (var j = 1; j < 7; j++)
            {                   
                //store positions
                
                //yPositions[i-1][j-1] = gameView.gameArea.cubesClip["cube_"+i+"_"+j].y;                    
                //xPositions[i-1][j-1] = gameView.gameArea.cubesClip["cube_"+i+"_"+j].x;
                if (!changeInState){
                    yPositions[i-1][j-1] = cube[i-1][j-1].sprite.y;                  
                    xPositions[i-1][j-1] = cube[i-1][j-1].sprite.x;
                }
                
                //var cube = "cube_"+(i+1)+"_"+(j+1);
                //cubes.repos((i+1),(j+1)); //set it to the correct initial position
                cube[i-1][j-1].cascadeResetPos(j);     
            }               
        } 
        enableCascadeMask();       
    }

    function readyToCascade(){        
        initialCascade();
        changeInState = true;
    }

    function initialCascade(){
        console.log("Oh wow Rob, this bit is going to be fun");   

        tweenIntervals = [];

        //play sound
        audio.play('EmoticollectSfx_22k');
        audio.volume('EmoticollectSfx_22k',0.5);
        
        for (var i = 0; i < 10; i++)
        {
            tweenIntervals[i] = [];     
            cubeTweens[i] = [];             
            tweenIntervals[i][0] = setInterval(tweenCube, (i*50), i, 0);
        }
    }

    function tweenCube(i,j){
        clearInterval(tweenIntervals[i][j]);        
        //PUT THE TWEEN CODE RIGHT HERE!!!
        cubeTweens[i][j] = window.TweenMax.to(cube[i][j].sprite, 0.3, {y:yPositions[i][j], yoyo:false, onComplete:completeInitialCascade, ease: window.Bounce.easeOut});
        j++;        
        if (j < 6){
            tweenIntervals[i][j] = setInterval(tweenCube, 150, i,j);
        }    
    }  

    function completeInitialCascade(){
        initCascadeCount--;

        //playADropSound();
        
        //cubes.moveCompleted();
        
        if (initCascadeCount === 0){
            console.log("Cascade finished, we're good to go!!!");
            //cascadeComplete = true;
            //uiView.helpBtn.visible = true;
            //enable go only if help is not visible
            //if (!gameView.howToPlay.visible) enableGoButton();
            //we only need the cascade mask if we're cascading
            disableCascadeMask();
            //dispatch event
            //gameView.gameArea.cubesClip.dispatchEvent('cascadeComplete');
            //has reveal all already been clicked?
            //if (revealAllEnabled) isTurnInProgress();

            msgBus.publish('cascadeComplete');
        }
    }
    
    function disableCascadeMask(){
        console.log("disable cascade mask");
        //gameView.gameArea.cubesClip.mask = null;
        //gameView.gameArea.cubesClip.cascadeMask = null;

       gr.lib._gameBoard.sprites._cubesClip.pixiContainer.mask = null;
       emojiMask.visible = false;
    }
    
    function enableCascadeMask(){
        console.log("enable cascade mask");
        emojiMask.visible = true;
        gr.lib._gameBoard.sprites._cubesClip.pixiContainer.mask = emojiMask;
    }

    function onWheelStart(){
        for (var i = 1; i < 11; i++){          
            for (var j = 1; j < 7; j++){
                cube[i-1][j-1].lookAtWheel(lookAtWheelArray[i-1][j-1]);
            }
        }
    }

    function onWheelStopped(inTurn){
        //EMOJIW-16 - *BUG* Blank spaces where emoji should be
        //reset everything, that way all the cubes are in their starting position
        //we now do this as the FIRST thing we do, rather than the last
        if (Object.keys(startTurnInfo).length === 0 && startTurnInfo.constructor === Object){
            //first run, we have no information
        }else{
            resetEverything(startTurnInfo.initialOrderOfCubes, startTurnInfo.yPositions, startTurnInfo.newPositionArray);
        }

        console.log("cubeRef = "+cube);

        for (var i = 1; i < 11; i++){          
            for (var j = 1; j < 7; j++){
                //set them all back to idle state
                cube[i-1][j-1].setState(cube[i-1][j-1].state);
                if (cube[i-1][j-1].state.toLowerCase() === inTurn.toLowerCase()){
                    arrayOfProcessedSquares.push(cube[i-1][j-1]); //.explode();
                }
            }
        }

        var lowerAlpha = ["a","b","c","d","e"];

        for (i = 0; i < arrayOfProcessedSquares.length; i++){
            //we know what we're exploding
            arrayOfProcessedSquares[i].explode();    
            //what is the state of this one?
            //if it's LOWER CASE, it's a free spin, so we need to show the free spin animation
            if (lowerAlpha.indexOf(arrayOfProcessedSquares[i].state) > -1){
                arrayOfFreeSpinsFound.push(arrayOfProcessedSquares[i]);
                arrayOfProcessedSquares[i].freeSpinFound();
            }      
        }

        //console.log("arrayOfProcessedSquares = "+arrayOfProcessedSquares);
        //console.log("arrayOfProcessedSquares = "+arrayOfProcessedSquares);

        arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].happyExplode.onComplete = null;
        arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].loveyExplode.onComplete = null;
        arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].shockedExplode.onComplete = null;
        arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].angryExplode.onComplete = null;
        arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].pukeExplode.onComplete = null;

        switch (inTurn){
            case "A":
                arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].happyExplode.onComplete = delayOrBeginAccumulation;
                audio.play('HappyEmojiExplode');
                break;
            case "B":
                arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].loveyExplode.onComplete = delayOrBeginAccumulation;
                audio.play('LoveEmojiExplode1');
                break;
            case "C":
                arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].shockedExplode.onComplete = delayOrBeginAccumulation;
                audio.play('ScaredEmojiExplode');
                break;
            case "D":
                arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].angryExplode.onComplete = delayOrBeginAccumulation;
                audio.play('AngryEmojiExplode');
                break;
            case "E":
                arrayOfProcessedSquares[arrayOfProcessedSquares.length-1].pukeExplode.onComplete = delayOrBeginAccumulation;
                audio.play('PukeyEmojiExplode');
                break;
        }        
    }

    function delayOrBeginAccumulation(){
        //reset the state of all processed squares
        for (var i = 0; i < arrayOfProcessedSquares.length; i++){
            arrayOfProcessedSquares[i].clearAll();
        }

        if (arrayOfFreeSpinsFound.length === 0){
            beginAccumulation();
        }else{
            setTimeout(function(){
                beginAccumulation();
            },1000);
        }
    }

    function beginAccumulation(){
        console.log("beginAccumulation");              

        accumulateClip.happyAnim.onComplete = null;
        accumulateClip.loveyAnim.onComplete = null;
        accumulateClip.shockedAnim.onComplete = null;
        accumulateClip.angryAnim.onComplete = null;
        accumulateClip.pukeAnim.onComplete = null;

        var thisClip;

        switch (arrayOfProcessedSquares[0].state.toLowerCase()){
            case "a":
                thisClip = accumulateClip.happyAnim;
                break;
            case "b":
                thisClip = accumulateClip.loveyAnim;
                break;
            case "c":
                thisClip = accumulateClip.shockedAnim;
                break;
            case "d":
                thisClip = accumulateClip.angryAnim;
                break;
            case "e":
                thisClip = accumulateClip.pukeAnim;
                break;
        }        

        accumulateClip.setStateAndPlay(arrayOfProcessedSquares[0].state);

        thisClip.onComplete = function(){
            accumulateClip.setCounterState(arrayOfProcessedSquares[0].state, arrayOfProcessedSquares.length);            
        };    
    }

    function counterComplete(){       
        setTimeout(function(){
            accumulateClip.gravitateCounter(arrayOfProcessedSquares[0].state);
        },500);   
    }

    /*function startGravitate(){
        accumulateClip.gravitateCounter(arrayOfProcessedSquares[0].state);
    }*/

    function counterGravitated(){
        accumulateClip.fadeOut(arrayOfProcessedSquares[0].state);
        var tempObj = {
            num:arrayOfProcessedSquares.length,
            type:arrayOfProcessedSquares[0].state
        };
        msgBus.publish('accumulateEmoji', tempObj);
    }

    var growTween;
    var freeSpinAlphaTween;
    function cascadeOrShowFreeSpin(){
        if (arrayOfFreeSpinsFound.length === 0){
            accumulateClip.fadeCounter();
            cascadeAfterExplosion();
        }else{
            //console.log('free spins');
            arrayOfFreeSpinsFound[0].freeSpin.visible = false;
            arrayOfFreeSpinsFound[0].spinLoop.visible = false;
            //position it
            growFreeSpin.x = arrayOfFreeSpinsFound[0].sprite.x - (370/2);
            growFreeSpin.y = arrayOfFreeSpinsFound[0].sprite.y - (370/2);
            growFreeSpin.visible = true;

            var tl = new TimelineLite({onComplete: playFreeSpin}); // jshint ignore:line
            tl.to(growFreeSpin, 0.2, {alpha:0})
              .to(growFreeSpin, 0.2, {alpha:1})
              .to(growFreeSpin, 0.2, {alpha:0})
              .to(growFreeSpin, 0.2, {alpha:1});
        }
    }

    function playFreeSpin(){
        growFreeSpin.loop = false;
        growFreeSpin.gotoAndPlay(1);

        //remove from array
        arrayOfFreeSpinsFound.splice(0,1);

        //play sound
        audio.play('Free spin awarded - Speed Up Wheel Sound');

        growTween = window.TweenMax.to(growFreeSpin, 0.25, {y:0, x:109, yoyo:false, onComplete:function(){
            growFreeSpin.visible = false;
            growFreeSpin.gotoAndStop(0);
            freeSpinAnim.visible = true;
            freeSpinAnim.gotoAndPlay(1);
            freeSpinAwarded.visible = true;
            window.TweenMax.to(freeSpinAwarded, 1, {alpha:1});
            window.TweenMax.to(freeSpinAwarded.scale, 1, {x:1, y:1, ease: window.Bounce.easeOut, onComplete:function(){
                endFreeSpinAnim.x = freeSpinAnim.x;
                endFreeSpinAnim.y = freeSpinAnim.y;

                setTimeout(gravitateEndFreeSpin, 1000);
                //now here we need to use the message bus or whatnot
                //to play the wheel spin anim in the spins left section
                //msgBus.publish('freeSpinDisplayed');
            }});
        }});
    }

    function gravitateEndFreeSpin(){
        window.TweenMax.to(freeSpinAwarded, 1, {alpha:0});
        freeSpinAnim.gotoAndStop(0);
        freeSpinAnim.visible = false;
        endFreeSpinAnim.visible = true;
        endFreeSpinAnim.gotoAndPlay(1);
        endFreeSpinAnim.loop = false;

        var xPos = (orientation === "portrait") ? freeSpinAwarded.x + 23 : -257;
        var yPos = (orientation === "portrait") ? freeSpinAwarded.y + 67 : 59;

        window.TweenMax.to(endFreeSpinAnim, 0.5, {x:xPos,y:yPos, onComplete:function(){
            endFreeSpinAnim.visible = false;
            endFreeSpinAnim.gotoAndStop(0);
            msgBus.publish('freeSpinDisplayed');
        }});
    }

    var wheelFadeTween;
    function fadeOutFreeSpin(){
        freeSpinAlphaTween = window.TweenMax.to(freeSpinAwarded, 1, {alpha:0});
        wheelFadeTween = window.TweenMax.to(freeSpinAnim, 1, {alpha:0, onComplete:function(){
            freeSpinAnim.visible = false;
            freeSpinAnim.alpha = 1;

            freeSpinAwarded.scale.x = 0.25;
            freeSpinAwarded.scale.y = 0.25;
            freeSpinAwarded.alpha = 0;
            freeSpinAwarded.visible = false;

            cascadeOrShowFreeSpin();
        }});
    }

    function cascadeAfterExplosion(){
        enableCascadeMask();

        var arrayOfSquaresToReplenish = [];
            
        var newPositionArray = columnArrays.slice();
        var newOrderOfCubes = initialOrderOfCubes.slice();
		
		var i, j, across, up, thisCube;

        for (j = 0; j < arrayOfProcessedSquares.length; j++){
            //look at the element
           // console.log("arrayOfProcessedSquares["+j+"] = "+arrayOfProcessedSquares[j]);              
            across = arrayOfProcessedSquares[j].across;
            up = arrayOfProcessedSquares[j].up;

            var temp = "cube_"+across+"_"+up;
            arrayOfSquaresToReplenish.push(temp);
            
            across -= 1;
            up -= 1;                        
            
            newPositionArray[across][up] = null;
        }

        //console.log("arrayOfSquaresToReplenish = "+arrayOfSquaresToReplenish); 

        //console.log("The newPositionArrays are as follows:");	
            
        for (i = 0; i < arrayOfSquaresToReplenish.length; i++){
            //find out which column this belongs to
            var tempArr = arrayOfSquaresToReplenish[i].split("_");
            across = tempArr[1];
            up = tempArr[2];                
            newOrderOfCubes[across-1].push(arrayOfSquaresToReplenish[i]);

            thisCube = cube[across-1][up-1];
            
            //TEMPORARY             
            thisCube.cascadeResetPos(thisCube.up);
            thisCube.resetState();           
        }
       
        for (i = 0; i < newPositionArray.length; i++){
            for (j = 0; j < newPositionArray[i].length; j++){
                if (newPositionArray[i][j] === null)
                {               
                    newPositionArray[i].splice(j,1);
                    newOrderOfCubes[i].splice(j,1);
                    j--;
                }
            }
            console.log("newOrderOfCubes["+i+"] "+newOrderOfCubes[i]);
        }

        //return;

        /*
            
        RIGHT, at this stage we now know where the cubes currently ARE
    
        and also know where the cubes NEED TO BE
        
        So we need to compare the initialOrderOfCubes array with the newOrderOfCubes array
        
        work out if the cube needs to move or not
        
        Then call the function that moves the cube
        
        We need to move X cube to Y position

        *****************************************************************************************************************************

        THIS IS NOT LIKE COLOR CUBES WHERE WE MOVED EVERYTHING AT ONCE, WE NEED TO MOVE THE EXISTING CUBES DOWN

        AND THEN WHEN SETTLED, ADD THE REPLENISHED SQUARES

        *****************************************************************************************************************************
        
        */          
        
        //EVERYTHING ABOVE THIS POINT IS CORRECT
        
        //run for the columns
        //we already know the x and y positions
        //so we need to look this up
        //then call the function that moves the cube

        var arrayOfSquaresToCascade = [];

        for (i = 1; i < 11; i++){               
            //run for the cubes
            for (j = 1; j < 7; j++){
                //take the cube
                thisCube = "cube_"+i+"_"+j;
                //WORK OUT WHETHER THIS IS AN EXISTING CUBE OR ONE TO REPLENISH
                if (arrayOfSquaresToReplenish.indexOf(thisCube) > -1){
                    //console.warn('one to replenish');
                }else{
                    arrayOfSquaresToCascade.push(cube[i-1][j-1]);
                    //find out its current position
                    var currPos = findMe(thisCube, newOrderOfCubes, newPositionArray);
                    
                    //find out the new STATE of this cube
                    cube[i-1][j-1].setState(currPos[2]);
                    
                    //we know the cube and we know the destination position
                    //therefore call this function
                    cube[i-1][j-1].moveCube(yPositions[(currPos[0])-1][(currPos[1])-1]);
                }               
            }

            playADropSound();
        }      

        arrayOfSquaresToCascade[arrayOfSquaresToCascade.length-1].cubeTween.vars._onComplete = function(){
            //EMOJIW-70 - JM Can we speed up the drop in between spins.
            for (i = 1; i < 11; i++){               
                //run for the cubes
                for (j = 1; j < 7; j++){
                    //take the cube
                    var thisCube = "cube_"+i+"_"+j;                
                    //WORK OUT WHETHER THIS IS AN EXISTING CUBE OR ONE TO REPLENISH
                    if (arrayOfSquaresToReplenish.indexOf(thisCube) > -1){
                        //find out its current position
                        var currPos = findMe(thisCube, newOrderOfCubes, newPositionArray);      
                        console.log("currPos = "+currPos);                  
                        //find out the new STATE of this cube
                        cube[i-1][j-1].setState(currPos[2]);                        
                        //we know the cube and we know the destination position
                        //therefore call this function
                        cube[i-1][j-1].moveCube(yPositions[(currPos[0])-1][(currPos[1])-1]);
                    }              
                }
            }

            playADropSound();

            var tempAcross = arrayOfSquaresToReplenish[arrayOfSquaresToReplenish.length-1].split("_")[1];
            var tempUp = arrayOfSquaresToReplenish[arrayOfSquaresToReplenish.length-1].split("_")[2];
            cube[tempAcross-1][tempUp-1].cubeTween.vars._onComplete = function(){
                setTimeout(function(){
                    replenish(newPositionArray, newOrderOfCubes);
                }, 750);
            };
        };        
    }

    function playADropSound(){
        var igiRandom = Math.floor(Math.random()*(1+5-1))+1;
        switch(igiRandom){
            case 1:
                audio.play('emoji_drop1');
                break;
            case 2:
                audio.play('emoji_drop2');
                break;
            case 3:
                audio.play('emoji_drop3');
                break;
            case 4:
                audio.play('emoji_drop4');
                break;
            case 5:
                audio.play('emoji_drop5');
                break;
        }
    }

    function replenish(newPositionArray, newOrderOfCubes){       
        columnArrays = [];
        columnArrays = newPositionArray.slice();
        initialOrderOfCubes = [];        
        console.log("columnArrays "+columnArrays);       
                    
        for (var i = 1; i < 11; i++){
            initialOrderOfCubes[i-1] = [];
            //this loop will run per column             
            for (var j = 1; j < 7; j++){
                //this loop will run per row  
                initialOrderOfCubes[i-1][j-1] = "cube_"+i+"_"+j; //cube[i-1][j-1];

            }
        }     

        main_newPositionArray = newPositionArray.slice();
        main_initialOrderOfCubes = initialOrderOfCubes.slice();
        main_newOrderOfCubes = newOrderOfCubes.slice();   

        console.log("initial order of cubes "+initialOrderOfCubes);   
        console.log("initial order of cubes "+main_initialOrderOfCubes);  

        moveCompleted();
    }

    function findMe(thisCube, newOrderOfCubes, newPositionArray){
        for (var i = 1; i < 11; i++){
            //run for the cubes
            for (var j = 1; j < 7; j++){
                if (newOrderOfCubes[i-1][j-1] === thisCube)
                {
                    //and find the state
                    var state = newPositionArray[i-1][j-1];
                    return [i, j,state];
                }
            }
        }
    }

    var moveCounter = 0;
    var tempInterval;
    function moveCompleted(){
        clearInterval(tempInterval);

        moveCounter++;

        if (turnInProgress){
            tempDelay(main_newPositionArray, main_initialOrderOfCubes);
            arrayOfProcessedSquares = [];
            main_newOrderOfCubes = [];
            main_initialOrderOfCubes = [];
            main_newOrderOfCubes = [];
        }
    }

    function tempDelay(newPositionArray, initialOrderOfCubes){
        clearInterval(tempInterval);

        //EMOJIW-16 - *BUG* Blank spaces where emoji should be
        //instead of resetting everything, store the info so it can be reset when the next turn starts
        startTurnInfo.initialOrderOfCubes = initialOrderOfCubes;
        startTurnInfo.yPositions = yPositions;
        startTurnInfo.newPositionArray = newPositionArray;
        
        //reset everything, that way all the cubes are back in their starting position
        //resetEverything(initialOrderOfCubes, yPositions, newPositionArray);
        
        disableCascadeMask();

        //update cube
        idle.updateCubes(cube);
        
        //we're good for another turn
        msgBus.publish('turnCompleted');
    }   

    function resetEverything(inArr, yPos, states){           
        for (var i = 1; i < 11; i++){
            //this loop will run per column             
            for (var j = 1; j < 7; j++){
                cube[i-1][j-1].resetState();                 
                cube[i-1][j-1].resetPos(yPos[i-1][j-1]);
                cube[i-1][j-1].setState(states[i-1][j-1]);
            }
        }
    }

    function setTurnInProgress(){
        turnInProgress = true;
    }

    function setTurnFinished(){
        turnInProgress = false;        
    }

    function resetEyesAfterIW(){
        //make them all look forward using the stopIdle function
        for (var i = 1; i < 11; i++){
            for (var j = 1; j < 7; j++){
                cube[i-1][j-1].stopIdle();                 
            }
        }
    }

    function onEmojiPulse(inTurn){
        //play their anticipation animations
        console.log("onEmojiPulse: "+inTurn);
        if (inTurn === "IW"){
            //no need to explode on an instant win
            return;
        }

        for (var i = 1; i < 11; i++){
            for (var j = 1; j < 7; j++){
                if (cube[i-1][j-1].state === inTurn){
                    cube[i-1][j-1].anticipate();
                }                                 
            }
        }
    }

    msgBus.subscribe('readyToCascade', readyToCascade);
    msgBus.subscribe('wheelStarted', onWheelStart);
    msgBus.subscribe('counterComplete', counterComplete);
    msgBus.subscribe('accumulationFinished', cascadeOrShowFreeSpin);
    msgBus.subscribe('wheelStoppedOnEmoji', onWheelStopped);
    msgBus.subscribe('scenarioProcessed', show);
    msgBus.subscribe('moveCompleted', moveCompleted);
    msgBus.subscribe('turnInProgress', setTurnInProgress);
    msgBus.subscribe('turnNoLongerInProgress', setTurnFinished);
    msgBus.subscribe('fadeOutFreeSpin', fadeOutFreeSpin);
    msgBus.subscribe('instantWinFound', resetEyesAfterIW); 
    msgBus.subscribe('counterGravitated', counterGravitated);    
    msgBus.subscribe('emojiPulse', onEmojiPulse); 

    return {
       
    };
});