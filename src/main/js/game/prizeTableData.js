/**
 * @module game/idle
 * @description reveal all button control
 */
define([

], function () {   
    
    var particleConfigLandscape = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": 0.2,
            "end": 0.4,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 50,
            "end": 100,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": true,
        "rotationSpeed": {
            "min": 1,
            "max": 0
        },
        "lifetime": {
            "min": 0.1,
            "max": 0.2
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": 1,
        "maxParticles": 300,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 13,
            "y": 21,
            "w": 345,
            "h": 44
        }
    };

    var particleConfigPortrait = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": 0.2,
            "end": 0.4,
            "minimumScaleMultiplier": 1
        },
        "color": {
            "start": "#ffffff",
            "end": "#ffffff"
        },
        "speed": {
            "start": 50,
            "end": 100,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 0,
            "max": 360
        },
        "noRotation": true,
        "rotationSpeed": {
            "min": 1,
            "max": 0
        },
        "lifetime": {
            "min": 0.1,
            "max": 0.2
        },
        "blendMode": "normal",
        "frequency": 0.001,
        "emitterLifetime": 1,
        "maxParticles": 300,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 71,
            "y": 25,
            "w": 501,
            "h": 48
        }
    };

    function getData(orientation){
        var dataToReturn;
        switch(orientation){
            case "portrait":
                dataToReturn = particleConfigPortrait;
                break;
            case "landscape":
                dataToReturn = particleConfigLandscape;
                break;
        }

        return dataToReturn;
    }

    return {
        getData:getData
    };
});