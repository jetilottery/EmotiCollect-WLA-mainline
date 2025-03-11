/**
 * @module WinEmoji
 */
define([
	'game/utils/spriteFuncs'
	], function(spriteFuncs){


	function WinEmoji(sprite){
		this.sprite = sprite;

        //hide the original image
        this.sprite.children[0].visible = false;
		
        //now we also need to add the various numbers
        this.happyImg = spriteFuncs.spriteFromTexture("winHappyEmoji");
        this.loveyImg = spriteFuncs.spriteFromTexture("winLoveyEmoji");
        this.shockedImg = spriteFuncs.spriteFromTexture("winShockedEmoji");
        this.angryImg = spriteFuncs.spriteFromTexture("winAngryEmoji");
        this.pukeImg = spriteFuncs.spriteFromTexture("winPukeEmoji");	

        this.happyImg.x = this.sprite.children[0].x;
        this.loveyImg.x = this.sprite.children[0].x;
        this.shockedImg.x = this.sprite.children[0].x;
        this.angryImg.x = this.sprite.children[0].x;
        this.pukeImg.x = this.sprite.children[0].x; 

        //crown of instant win coins
        this.iwCrown = spriteFuncs.spriteFromTexture("instantWinMultipleEmojisToken");        
        this.iwCrown.scale.x = 0.778;
        this.iwCrown.scale.y = 0.778;
        this.iwCrown.x = this.sprite.children[0].x + 3; 

        this.sprite.addChild(this.happyImg, this.loveyImg, this.shockedImg, this.angryImg, this.pukeImg, this.iwCrown);	

		//hide absolutely everything
		this.sprite.children.forEach(function(obj){
			obj.visible = false;
		});
	}

    WinEmoji.prototype.setState = function(inVal,iwFound){
    	this.clearState();	
    	this.state = inVal;

    	//so we have the state, which is as follows
    	// A = happy
    	// B = lovey
    	// C = shocked
    	// D = angry
    	// E = puke

    	//we will show the idle animation for each one
    	//since this will technically be the default

    	switch (inVal.toLowerCase()){
    		case "happy":
    			this.happyImg.visible = true;
    			break;
    		case "lovey":
    			this.loveyImg.visible = true;
    			break;
    		case "shocked":
    			this.shockedImg.visible = true;
    			break;
    		case "angry":
    			this.angryImg.visible = true;
    			break;
    		case "puke":
    			this.pukeImg.visible = true;
    			break;
    	}

        if (iwFound){
            this.iwCrown.visible = true;
        }
    };

    WinEmoji.prototype.clearState = function(){
    	//hide absolutely everything
		this.sprite.children.forEach(function(obj){
			obj.visible = false;
		});

		this.state = null;
    };

    WinEmoji.prototype.getState = function(){
    	return this.state;
    };
	
    return WinEmoji;
});