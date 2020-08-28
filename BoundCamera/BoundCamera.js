//=============================================================================
// RPG Maker MZ - Bound Camera
//=============================================================================

/*:
 * @target MZ
 * @plugindesc [v0.1] Bounds the scrolling of the camera to tiles other than the edges of the map.
 * @author LuciusAxelrod
 *
 * @help BoundCamera.js
 * 
 * https://github.com/LuciusAxelrod/MZ_Plugins
 *
 * This plugin bounds the camera scrolling to tiles other than the edges of the
 * map.
 * 
 * ==HOW TO USE==
 * Set the bounds of the camera using four properties:
 * Min X: the leftmost X coordinate that the camera will scroll.
 * Max X: the rightmore X coordinate that the camera will scroll.
 * Min Y: the topmost Y coordinate that the camera will scroll.
 * Max Y: the bottommost Y coordinate that the camera will scroll.
 * 
 * These properties can be set using tags or Plugin Commands.
 * Maps will remember their set bounds through saves and map transfers.
 * 
 * Set the default bounds of a map in the Notes using the following tags:
 * <minX:#>
 * <maxX:#>
 * <minY:#>
 * <maxY:#>
 * 
 * If no defaults are set, the bounds of the map will be the edges of the map
 * until they are set using a Plugin Command.
 * 
 * Change change the bounds of the current map using the "Set Camera Bounds" 
 * Plugin Command.

 * If you need to transfer to a part of a map that may be outside 
 * that map's set bounds, you can use the "Set Camera Bounds Next Map" 
 * Plugin Command. This will set the bounds of the next map the player 
 * transfers to.
 *
 * @command setScrollBoundries
 * @text Set Camera Bounds
 * @desc Change the bounds of the camera for the current map.
 * 
 * @arg minX
 * @type number
 * @text Min X
 * @desc Minimum X column the camera will show when scrolling.
 *  
 * @arg maxX
 * @type number
 * @text Max X
 * @desc Maximum X column the camera will show when scrolling.
 *
 * @arg minY
 * @type number
 * @text Min Y
 * @desc Minimum Y row the camera will show when scrolling.
 *  
 * @arg maxY
 * @type number
 * @text Max Y
 * @desc Maximum Y row the camera will show when scrolling.
 *      
 * @command setScrollBoundriesNextMap
 * @text Set Camera Bounds Next Map
 * @desc Change the bounds of the camera for next map after transfer. If this is called, the default bounds for the map will be ignored.
 * 
 * @arg minX
 * @type number
 * @text Min X
 * @desc Minimum X column the camera will show when scrolling.
 *  
 * @arg maxX
 * @type number
 * @text Max X
 * @desc Maximum X column the camera will show when scrolling.
 *
 * @arg minY
 * @type number
 * @text Min Y
 * @desc Minimum Y row the camera will show when scrolling.
 *  
 * @arg maxY
 * @type number
 * @text Max Y
 * @desc Maximum Y row the camera will show when scrolling.
 */

(() => {
  const pluginName = "BoundCamera";

  $cameraBounds = [];
  $cameraBoundsNextMap = null;

  PluginManager.registerCommand(pluginName, "setScrollBoundries", args => {
    if(args.minX !== "") $cameraBounds[$gameMap.mapId()].minX = Math.max(Number(args.minX), 0);
    if(args.maxX !== "") $cameraBounds[$gameMap.mapId()].maxX = Math.min(Number(args.maxX), $dataMap.width - 1);
    if(args.minY !== "") $cameraBounds[$gameMap.mapId()].minY = Math.max(Number(args.minY), 0);
    if(args.maxY !== "") $cameraBounds[$gameMap.mapId()].maxY = Math.min(Number(args.maxY), $dataMap.height - 1);
  });

  PluginManager.registerCommand(pluginName, "setScrollBoundriesNextMap", args => {
    $cameraBoundsNextMap = {};
    if(args.minX !== "") $cameraBoundsNextMap.minX = Number(args.minX);
    if(args.maxX !== "") $cameraBoundsNextMap.maxX = Number(args.maxX);
    if(args.minY !== "") $cameraBoundsNextMap.minY = Number(args.minY);
    if(args.maxY !== "") $cameraBoundsNextMap.maxY = Number(args.maxY);
  });

  const _Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function() {
    _Game_Map_setup.apply(this, arguments);
    if($cameraBoundsNextMap) {
      $cameraBounds[this.mapId()] = {
        minX: Math.max($cameraBoundsNextMap.minX, 0),
        maxX: Math.min($cameraBoundsNextMap.maxX, $dataMap.width - 1),
        minY: Math.max($cameraBoundsNextMap.minY, 0),
        maxY: Math.min($cameraBoundsNextMap.maxY, $dataMap.height - 1)
      };
      $cameraBoundsNextMap = null;
    }
    if(this.mapId() !== 0 && !$cameraBounds[this.mapId()]) {
      $cameraBounds[this.mapId()] = {
        minX: Number($dataMap.meta.minX) || 0,
        maxX: Number($dataMap.meta.maxX) || $dataMap.width - 1,
        minY: Number($dataMap.meta.minY) || 0,
        maxY: Number($dataMap.meta.maxY) || $dataMap.height - 1
      }
    }
  };

  Game_Map.prototype.setDisplayPos = function(x, y) {
    if (this.isLoopHorizontal()) {
        this._displayX = x.mod(this.width());
        this._parallaxX = x;
    } else {
        const endX = this.width() - this.screenTileX();
        const minX = $cameraBounds[this.mapId()].minX;
        const maxX = $cameraBounds[this.mapId()].maxX + 1 - this.screenTileX();
        this._displayX = endX < 0 ? endX / 2 : x.clamp(minX, maxX);
        this._parallaxX = this._displayX;
    }
    if (this.isLoopVertical()) {
        this._displayY = y.mod(this.height());
        this._parallaxY = y;
    } else {
        const endY = this.height() - this.screenTileY();
        const minY = $cameraBounds[this.mapId()].minY;
        const maxY = $cameraBounds[this.mapId()].maxY + 1 - this.screenTileY();
        this._displayY = endY < 0 ? endY / 2 : y.clamp(minY, maxY);
        this._parallaxY = this._displayY;
    }
  };

  const _DataManager_makeSaveContents = DataManager.makeSaveContents;
  DataManager.makeSaveContents = function() {
    const contents = _DataManager_makeSaveContents.apply(this, arguments);
    contents.cameraBounds = $cameraBounds; 
    return contents;
  };

  const _DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function(contents) {
    _DataManager_extractSaveContents.apply(this, arguments);
    $cameraBounds = contents.cameraBounds;
  };

  const _Game_Map_scrollDown = Game_Map.prototype.scrollDown;
  Game_Map.prototype.scrollDown = function(distance) {
    if (this.isLoopVertical()) {
      _Game_Map_scrollDown.apply(this, arguments);
    } else if (this.height() >= this.screenTileY()) {
        const lastY = this._displayY;
        this._displayY = Math.min(this._displayY + distance, ($cameraBounds[this.mapId()].maxY + 1) - this.screenTileY());
        this._parallaxY += this._displayY - lastY;
    }
  };

  const _Game_Map_scrollLeft = Game_Map.prototype.scrollLeft;
  Game_Map.prototype.scrollLeft = function(distance) {
    if (this.isLoopHorizontal()) {
      _Game_Map_scrollLeft.apply(this, arguments);
    } else if (this.width() >= this.screenTileX()) {
        const lastX = this._displayX;
        this._displayX = Math.max(this._displayX - distance, $cameraBounds[this.mapId()].minX);
        this._parallaxX += this._displayX - lastX;
    }
  };

  const _Game_Map_scrollRight = Game_Map.prototype.scrollRight;
  Game_Map.prototype.scrollRight = function(distance) {
    if (this.isLoopHorizontal()) {
      _Game_Map_scrollRight.apply(this, arguments);
    } else if (this.width() >= this.screenTileX()) {
        const lastX = this._displayX;
        this._displayX = Math.min(this._displayX + distance, ($cameraBounds[this.mapId()].maxX + 1) - this.screenTileX());
        this._parallaxX += this._displayX - lastX;
    }
  };

  const _Game_Map_scrollUp = Game_Map.prototype.scrollUp;
  Game_Map.prototype.scrollUp = function(distance) {
    if (this.isLoopVertical()) {
      _Game_Map_scrollUp.apply(this, arguments);
    } else if (this.height() >= this.screenTileY()) {
        const lastY = this._displayY;
        this._displayY = Math.max(this._displayY - distance, $cameraBounds[this.mapId()].minY);
        this._parallaxY += this._displayY - lastY;
    }
  };
})();
