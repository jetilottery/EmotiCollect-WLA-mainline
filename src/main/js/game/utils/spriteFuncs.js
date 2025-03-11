/**
 * 
 */
define(function module(require) {
    
    //var setupData               =   require('game/data/setupData');
    var PIXI                    =   require('com/pixijs/pixi');

    /**
     * Since there are a lot of instances where it's time consuming to track down what contains what
     * (such as the assets/movieclips setup in gameNameGame.js) this is just a quick shortcut to see
     * what's inside an object
     * @param {*} data 
     * @param {*} defaultId 
     */
    function keysInObject(obj){
        var keys = [];
        for(var key in obj){
            keys.push(key);
        }
        return keys;
    }

    /**
     * Rotate an object in degrees, since PIXI uses rads
     * @param {*} mc 
     * @param {*} degs 
     * @param {*} addDegrees //If you want to add the degrees to the existing rotation, not just set it to a specific amount
     */
    function rotateDegrees(mc, degs, addDegrees){
        if(addDegrees === undefined){addDegrees = false;}
        var rads = 0.0174532925;
        mc = mc.pixiContainer ? mc.pixiContainer : mc;
        mc.rotation = (addDegrees ? mc.rotation : 0) + (degs * rads);
        return getDegrees(mc);
    }

    /**
     * get the current rotation in degrees, since PIXI uses rads
     * @param {*} mc 
     */
    function getDegrees(mc){
        if(!mc.rotation && mc.pixiContainer){
            mc = mc.pixiContainer;
        }
        else if(!mc.pixiContainer && !mc.rotation){
            console.log("miscUtils.getDegrees - " + mc + " is not a MovieClip or Sprite with rotation property!", "WARNING");
            return;
        }
        return mc.rotation / 0.0174532925;
    }

    /**
     * Just change degrees to radians
     * @param {*} degrees 
     */
    function degToRad(degrees){
        return degrees * 0.0174532925;
    }


    /**
     * In case we want to generate a sprite without all the GLAD faffing
     * @param {*} textureName 
     */
    function spriteFromTexture(textureName, anchor){
        if(anchor === undefined){anchor = "topLeft";}
        
        if(PIXI.Texture.fromFrame(textureName)){
            var texture = PIXI.Texture.fromFrame(textureName);
            var sprite = new PIXI.Sprite(texture);
            if(anchor === "centre"){
                sprite.anchor.set(0.5, 0.5);
            }
            else if(anchor === "bottomRight"){
                sprite.anchor.set(1, 1);
            }
            
            return sprite;
        }
        else{
            console.log("miscUtils.spriteFromTexture(" + textureName + ") - Does not exist!", "WARNING");
        }
        return {};
    }

    /**
     * Create MovieClip animation - this assumes that each filename is apended with sequential numbers
     * @param {*} textureName //Don't include the numbers e.g. if the 1st frame is "frame_01" just pass "frame_"
     * @param {*} startFrame //usually 0 or 1
     * @param {*} endFrame 
     * @param {*} numFormat //How the numbers are laid out. e.g. pass '1' for 1,2,3, pass '2' for 01,02,03 etc. 
     */
    function createMovieClip(textureName, startFrame, endFrame, numFormat, animationSpeed){
        var frames = [];
        var formatNum = function(num){
            if(numFormat === 3){return (num > 99 ? num : (num > 9 ? "0" + num : "00" + num));}
            else if(numFormat === 2){return (num > 9 ? num : "0" + num);}
            else{return num;}
        };
        if(numFormat === undefined){numFormat = 2;}
        if(animationSpeed === undefined){animationSpeed = 1;}
        
        //loop and put each frame into an array
        for(var i = startFrame; i <= endFrame; i++){
            var texName = textureName + formatNum(i);
            if(PIXI.Texture.fromFrame(texName)){
                frames.push(PIXI.Texture.fromFrame(texName));
            }
            else{
                console.log("miscUtils.createMovieClip() frame:'" + texName + "' not found!", "WARNING");
            }
        }

        //if we have frames, add them to a new movieclip and return it
        if(frames.length > 0){
            var mc = new PIXI.extras.AnimatedSprite(frames);
            mc.animationSpeed = animationSpeed;
            return mc;
        }
        else{
            console.log("miscUtils.createMovieClip() no frames found for:'" + textureName + "'!", "WARNING");
        }
        return {};
    }

    /**
     * Create MovieClip animation - this assumes that each filename is apended with sequential numbers
     * @param {*} textureName //Don't include the numbers e.g. if the 1st frame is "frame_01" just pass "frame_"
     * @param {*} startFrame //usually 0 or 1
     * @param {*} endFrame 
     * @param {*} numFormat //How the numbers are laid out. e.g. pass '1' for 1,2,3, pass '2' for 01,02,03 etc. 
     */
    function createMovieClipFromArray(inArr){
        var frames = [];
        /*var formatNum = function(num){
            if(numFormat === 3){return (num > 99 ? num : (num > 9 ? "0" + num : "00" + num));}
            else if(numFormat === 2){return (num > 9 ? num : "0" + num);}
            else{return num;}
        };
        if(numFormat === undefined){numFormat = 2;}*/
        //if(animationSpeed === undefined){animationSpeed = 1;}
        
        //loop and put each frame into an array
        for(var i = 0; i < inArr.length; i++){
            var texName = inArr[i];
            if(PIXI.Texture.fromFrame(texName)){
                frames.push(PIXI.Texture.fromFrame(texName));
            }
            else{
                //console.log("miscUtils.createMovieClip() frame:'" + texName + "' not found!", "WARNING");
            }
        }

        //if we have frames, add them to a new movieclip and return it
        if(frames.length > 0){
            var mc = new PIXI.extras.AnimatedSprite(frames);
            mc.animationSpeed = 1;
            return mc;
        }
        else{
            //console.log("miscUtils.createMovieClip() no frames found for:'" + textureName + "'!", "WARNING");
        }
        return {};
    }

    return{
        keysInObject: keysInObject,
        rotateDegrees: rotateDegrees,
        getDegrees: getDegrees,
        degToRad: degToRad,
        spriteFromTexture: spriteFromTexture,
        createMovieClip: createMovieClip,
        createMovieClipFromArray:createMovieClipFromArray
    };
});