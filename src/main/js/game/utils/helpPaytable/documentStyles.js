define(function() {
  return ".document { position: absolute; visibility: hidden; width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; background-color: #EEEEEE; font-family: arial, helvetica, sans-serif; }" +

  ".documentHead { width: 100%; height: 48px; line-height: 48px; background: #535353; background: linear-gradient(#535353, #222222); color: #EEEEEE; font-size: 18px; font-weight: bold; text-shadow: #000 0px 1px 1px; text-align: center; }" +

  ".documentBtnBar { width: 100%; background: linear-gradient(hsl(0, 0%, 93%), hsl(0, 0%, 63%)); }" +

  ".documentBtnBar button { padding: 10px 20px; color: #EEEEEE; font-size: 14px; font-weight: bold; text-shadow: #aaa 0px 1px 1px; border-radius: 6px; border: 1px solid #0590d1; background: #0590d1; background: linear-gradient(#69bce3, #0590d1); cursor: pointer; margin: 7px auto; display: block; outline-color: transparent; }" +

  ".documentContent { width: 95%; height: 100%; overflow: auto; -webkit-overflow-scrolling: touch }" +

  ".documentContent section { margin: 10px auto; color: #555555; background-color: #FFFFFF; border: 1px solid #CCCCCC; border-radius: 10px; font-size: 14px; line-height: 1.4em; }" +

  ".document h1 { color: #333333; font-size: 22px; margin: 17px 15px; }" +

  ".document h2 { color: #333333; font-size: 18px; margin: 17px 20px; }" +

  ".document h3 { color: #333333; font-size: 15px; margin: 17px 20px; }" +

  ".document p { margin: 17px 20px; }" +

  ".document table { width: 75%; margin: 6px auto; border: 1px solid black; border-collapse: seperate; border-spacing: 0; border-radius: 11px; font-size: 13px; }" +

  ".document th { height: 15px; padding: 6px 0px 6px 0px; background-color: #0590d1; border: 0; border-right: 1px solid #FFFFFF; color: #FFFFFF; text-align: center; }" +

  ".document th:first-child { border-top-left-radius: 9px; }" +

  ".document th:last-child { border-top-right-radius: 9px; border-right: 0; }" +

  ".document td { width: 12%; padding: 19px 10px; height: 26px; line-height: 26px; border-left: 0; border-top: 0; border-bottom: 1px solid black; border-right: 1px solid black; text-align: center; font-weight: bold; }" +

  ".document tr:last-child td { border-bottom: 0; }" +

  ".document td:last-child { border-right: 0; }";
});
