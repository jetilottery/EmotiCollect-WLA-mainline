/**
 * @module pixiResourceLoader
 * @memberof skbJet/component/pixiResourceLoader
 * @description This module is used for load assets for JET game. This module is based on PIXI game engine.
 * @see www.pixijs.com
 * @property audio {map} - audio map
 * @property images {map} - image map
 * @property i18n {JSON} - JSON object of translated text.
 * @author Alex Wang
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'com/pixijs/pixi',
	'skbJet/component/resourceLoader/resourceLib',
	'skbJet/component/resourceLoader/ResourceLoader',
	'skbJet/component/resourceLoader/subLoaders/TextFilesSubLoader',
	'skbJet/component/resourceLoader/subLoaders/HtmlTagSubLoader',
	'skbJet/component/pixiResourceLoader/PixiSpriteSubLoader',
	'skbJet/component/pixiResourceLoader/PixiImageSubLoader'
], function(msgBus, PIXI, resLib, ResourceLoader, TextFilesSubLoader, HtmlTagSubLoader, PixiSpriteSubLoader, PixiImageSubLoader){
	
	resLib.sounds = resLib.sounds||{};
	resLib.images = resLib.images||{};
	resLib.layout = resLib.layout||{};
	resLib.sprites = resLib.sprites||{};
	resLib.i18n = resLib.i18n||{};
	
	

	var assets = {
		//load:load,
		//setOutsideAudioLoader:setOutsideAudioLoader,
		//getImgObj:getImgObj,
		audio:resLib.sounds,
		images:resLib.images,
		layout:resLib.layout,
		sprites:resLib.sprites,
		i18n:null
	};
	
	var defaultLoader;
	var progress = {};
	
	function onFileLoaded(){
		progress = defaultLoader.currentProgress();
		if(progress.complete){
			assets.i18n = resLib.i18n.game||{};
			assets.i18n.config = resLib.i18n.config.config;
			assets.i18n.helpHTML = resLib.i18n.help;
			assets.i18n.paytableHTML = resLib.i18n.paytable;
		}
		msgBus.publish('resourceLoader.loadProgress', {total: progress.total, current:progress.current, complete:progress.complete});
	}
	
	function onLoadFailed(){
		msgBus.publish('toPlatform', {
			channel: "Kernel",
			topic: "LoadProgress",
			data:{
				id:"game",
				items:progress.total,
				current:progress.current,
				complete:false,
				fail:true
			}
		});
	}
	
	/**
	 * @function load
	 * @description load asset
	 * @instance
	 * @param assetHome {string} - Root asset folder url
	 * @param languageCode {string} - Language Code
	 * @param skingCode {string} - Skin Code
	 * @fires Kernel.LoadProgress only send when load asset error.
	 * @fires resourceLoader.loadProgress asset load progress.
	 */
	assets.load = function(assetHome, languageCode, skingCode){
		try {
            ResourceLoader.initDefault(assetHome, languageCode, skingCode);
        } catch (err) {
            var newResourceLoader = new ResourceLoader(assetHome, languageCode, skingCode);
            ResourceLoader.setDefault(newResourceLoader);
        }
		defaultLoader = ResourceLoader.getDefault();
		defaultLoader.addSubLoader('images', new PixiImageSubLoader({type:'images'}));
		defaultLoader.addSubLoader('sprites', new PixiSpriteSubLoader({type:'sprites'}));
		var i18nSubLoader = new TextFilesSubLoader({type:'i18n', parseJson:true});
		i18nSubLoader.origLoad = i18nSubLoader.load;
		i18nSubLoader.load = function(fileMap, options){
			for(var url in fileMap){
				if(url.match(/splash\.json$/)){//remove splash.json
					delete fileMap[url];
				}
			}
			this.origLoad(fileMap, options);
		};
		defaultLoader.addSubLoader('i18n', i18nSubLoader);
		defaultLoader.addSubLoader('layout', new HtmlTagSubLoader({tagName:'script', tagAttributes:{type:'text/javascript'}, fileExtFilterList:['js'], parentTag:document.getElementsByTagName('head')[0]}));
		//TODO audio subLoader here...

		defaultLoader.load(onFileLoaded, onLoadFailed);
	};

	var imageObjectCache = {};
	var tmpStage = new PIXI.Container();
	
	function convertSpritesToImages(imgName){
		if(PIXI.utils.TextureCache[imgName]){
			var texture = PIXI.utils.TextureCache[imgName];
			var renderer = new PIXI.CanvasRenderer(texture.orig.width,texture.orig.height,{transparent:true});
			var curImg = new PIXI.Sprite(texture);
			tmpStage.addChild(curImg);
			renderer.render(tmpStage);
			var spImg = new Image();
			spImg.src = renderer.view.toDataURL();
			imageObjectCache[imgName] = spImg;
			tmpStage.removeChild(curImg);
		}
	}
	
	/**
	 * @function getImgObj
	 * @description get Image object
	 * @instance
	 * @param imgName {string} - image name
	 * @return Image tag object
	 */
	assets.getImgObj = function(imgName){
		if(!imageObjectCache[imgName]){
			convertSpritesToImages(imgName);
		}
		return imageObjectCache[imgName];
	};
	
	return assets;
});