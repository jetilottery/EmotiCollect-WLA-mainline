/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
    predefinedStyle: {
        landscape:{
            loadDiv:{
                width:960,
                height:600,
                position:'absolute',
                left: "50%",
                top: "50%"
            },
            gameLogoDiv:{
                width:'100%',
                height:469,
                top: 36,
                left: 0,
                position:'absolute',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '750px 469px'
            },
            progressBarDiv:{
                top: 486,
                left: 283,
                width:394,
                height:16,
                padding:0,
                position:'absolute',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '394px 16px'
            },
            progressDiv:{
                height:16,
                width:"0%",
                position:'absolute'
            },
            copyRightDiv:{
                width:'100%',
                textAlign : 'center',
                bottom:20,
                fontSize:20,
                fontFamily: '"Roboto Condensed"',
                position:'absolute'
            }
        },
        portrait:{
            loadDiv:{
                width:600,
                height:818,
                position:'absolute',
                left: "50%",
                top: "50%"
            },
            gameLogoDiv:{
                width:'100%',
                height:399,
                top: 189,
                left: 0,
                position:'absolute',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '600px 399px'
            },
            progressBarDiv:{
                top:566,
                left:103,
                width:394,
                height:16,
                padding:0,
                position:'absolute',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: '394px 16px'
            },
            progressDiv:{
                height:16,
                width:"0%",
                position:'absolute'
            },
            copyRightDiv:{
                width:'100%',
                textAlign : 'center',
                bottom:20,
                fontSize:20,
                fontFamily: '"Roboto Condensed"',
                position:'absolute'
            }
        }
    }
});