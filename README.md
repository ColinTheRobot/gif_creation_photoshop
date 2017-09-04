# gif_creation_photoshop
A script to create gifs in photoshop 

Script will take all the images in the selected folder resize them and convert them to separate layers.

Because the timeline animation functions are accessible via the Photoshop DOM you'll need to create an action called `gif-making` called on line 28. 

The action should make each layer a frame, set the interval, and the loop duration.
