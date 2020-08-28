# BoundCamera.js
by LuciusAxelrod

**Current Version: 0.1**

Limits the camera from scrolling past boundries other than the edges of the screen. 
This plugin can limit the view of the player to help create interesting effects, such 
as expanding the map after a barrier is removed or creating a Zelda 1 style scroll system.

## How to Use
Set the bounds of the camera using four properties:
* Min X: the leftmost X coordinate that the camera will scroll.
* Max X: the rightmore X coordinate that the camera will scroll.
* Min Y: the topmost Y coordinate that the camera will scroll.
* Max Y: the bottommost Y coordinate that the camera will scroll.

These properties can be set using tags or Plugin Commands.
Maps will remember their set bounds through saves and map transfers.

Set the default bounds of a map in the Notes using the following tags: 
* \<minX:#\>  
* \<maxX:#\>  
* \<minY:#\>  
* \<maxY:#\>  

If no defaults are set, the bounds of the map will be the edges of the map
until they are set using a Plugin Command.

Change change the bounds of the current map using the "Set Camera Bounds" 
Plugin Command.

If you need to transfer to a part of a map that may be outside 
that map's set bounds, you can use the "Set Camera Bounds Next Map" 
Plugin Command. This will set the bounds of the next map the player 
transfers to.

### Terms of Use
This plugin is free to use for commercial and non-commercial games, as long as I am credited.
