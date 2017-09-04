//  Derived from https://github.com/GitBruno/Photoshop-Scripts/blob/master/Import%20Folder%20As%20Layers.jsx

function main() {
    // Sets overall state of the script
    var state = {
            sourceFolder: '~',       // the folder to start looking in 
            stripFileExt: true,       // strip file extension
            savePrompt: false,    // end state
    };

    // as the user to select the folder the would like to import frames from
    var sourceFolder = Folder.selectDialog('Select the folder you would like to upload from:', Folder(state.sourceFolder));
    // TODO: check for error states for the above folder
    
    // update the source folder to the selected folder
    state.sourceFolder = sourceFolder;
    
    
    // Extract files from that folder
    state.images = extractFiles(state);
    
    // turn images into layers
    importFilesAsLayers(state.images, state);
    
    // resize each layer to 300X300px
    resizeLayers(state);
    
   app.doAction('Make a GIF', 'GIF-making');
   
   exportForWeb(state);
}


function extractFiles(state) {
    var images = state.sourceFolder.getFiles(/\.(jpg|tif|psd|jpeg|png)$/i);
    
     // TODO only pull files not folders
     // TODO error if there are no files
    return images
}

function importFilesAsLayers(files, state) {
    // creates a new a document
    //                                                         w      h       res       file name                        mode                                       initial fill
    var newDoc = documents.add(300, 300, 72, 'Imported Layers', NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1);
    //                           Read-write. The selected layer.
    var newLayer = newDoc.activeLayer;
    
    for (var i = 0; i < files.length; i++) {
        var frame = open(files[i]);
        var frameNumber = i +1;
        var frameName= 'frame ' + frameNumber;

        // convert to RGB; convert to 8-bpc; merge visible
        newDoc.changeMode(ChangeMode.RGB);
        newLayer.bitsPerChannel = BitsPerChannelType.EIGHT;

        // rename layer; duplicate to new document
        var layer = frame.activeLayer;
        layer.name = frameName;
        layer.duplicate(newDoc, ElementPlacement.PLACEATBEGINNING);

        // close imported document
        frame.close(SaveOptions.DONOTSAVECHANGES);
    }

    newLayer.remove();
    // expands the docment to show clipped sections
    newDoc.revealAll();
    // trims transparency in each layer
    newDoc.trim(TrimType.TRANSPARENT, true, true, true, true);
   
    
    state.document = newDoc
}

function resizeLayers(state) {
    var oldPref = app.preferences.rulerUnits;
    var doc = state.document;
    var layers = state.document.artLayers;
    
    app.preferences.rulerUnits = Units.PIXELS; 

    for (var i = 0; i < layers.length; i++) {
        // Code below derived from: https://stackoverflow.com/questions/17580923/photoshop-javascript-to-resize-image-and-canvas-to-specific-not-square-sizes
        var finalWidth = 300;
        var finalHeight = 186;
        
        if (doc.height > doc.width) {
            doc.resizeImage(null,UnitValue(finalHeight,"px"),null,ResampleMethod.BICUBIC);
        }
        else {
            doc.resizeImage(UnitValue(finalWidth,"px"),null,null,ResampleMethod.BICUBIC);
        }
                
        // Makes the default background white
        var white = new SolidColor(); 
        white.rgb.hexValue = "FFFFFF";
        doc.backgroundColor = white;
        
        doc.resizeCanvas(UnitValue(finalWidth,"px"),UnitValue(finalHeight,"px"));
    }
}

function exportForWeb(state) {
    // our web export options
    var options = new ExportOptionsSaveForWeb();
    var doc = app.activeDocument;
    var psdSaveOptions = new PhotoshopSaveOptions();
    
    psdSaveOptions.embedColorProfile = true;
    psdSaveOptions.alphaChannels = true;
    activeDocument.saveAs(File(state.sourceFolder + "/AEP.psd"), psdSaveOptions, false,Extension.LOWERCASE);
    
    options.quality = 70;
    options.format = SaveDocumentType.COMPUSERVEGIF;
    options.optimized = true;

    var newName = 'AEP.gif';

    doc.exportDocument(File(doc.path+'/'+newName), ExportType.SAVEFORWEB,options);
}

main()
