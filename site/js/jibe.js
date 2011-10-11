
function empty(o)
{
    for (var i in o) 
        if (o.hasOwnProperty(i))
            return false;
    return true;
}

function getIconForSize(targetSize, minifest)
{
    if (minifest && minifest.icons) {
        var bestFit = 0;
        var biggestFallback = 0;
        for (var z in minifest.icons) {
            var size = parseInt(z, 10);
            if (bestFit == 0 || size >= targetSize) {
                bestFit = size;
            }
            if (biggestFallback == 0 || size > biggestFallback) {
                biggestFallback = size;
            }
        }
        if (bestFit !== 0) return minifest.icons[bestFit];
        if (biggestFallback !== 0) return minifest.icons[biggestFallback];
    }
}

$(document).ready(function() {
    /* IconGrid */
    var addItemToGridCallback;
    var removeItemFromGridCallback;

    var appData = {
        getItemList: function(cb) {
            navigator.mozApps.mgmt.list(function(apps) {
                var list = {};
                for (var i = 0; i < apps.length; i++) {
                    var app = apps[i];
                    list[app.origin] = {
                        itemTitle: app.manifest.name,
                        itemImgURL: app.origin + getIconForSize(48, app.manifest)
                    };
                }
                cb(list);
            });
        },

        openItem: function(itemID) {
          navigator.mozApps.mgmt.launch(itemID);
        },

        userRemovedItem: function(itemID) {
          // this better trigger a call to the update watches, so we can fix the UI
          navigator.mozApps.mgmt.uninstall(itemID);
        },

        // TODO: Hook up with watchUpdates
        handleWatcher: function(cmd, itemArray) {
            var i;
            if (cmd == "add") {
                for (i = 0; i < itemArray.length; i++){
                    addItem(itemArray[i]);
                }
            } else if (cmd == "remove"){
                for (i = 0; i < itemArray.length; i++){
                    removeItem(itemArray[i]);
                }
            }
        },

        // Important callbacks for updates
        setRemovalCallback: function(callback) {
          removeItemFromGridCallback = callback;
        },

        setAdditionCallback: function(callback) {
          addItemToGridCallback = callback;
        },

        removeItem: function(itemID) {
          if (removeItemFromGridCallback == undefined) return;
          removeItemFromGridCallback(itemID);
        },

        addItem: function(theItem) {
          if (addItemToGridCallback == undefined) return;
          var guid = theItem.origin;
          addItemToGridCallback(guid, theItem);
        },

        // if all your items have 'itemImgURL' and 'itemTitle' properties, then you don't need to implement these.
        // These get called when an item doesn't have the right properties.
        // Note that you can pass in data URIs for icons
        // getItemImgURL: function(itemID) {},
        // getItemTitle: function(itemID) {}
    };
            
    var grid = $("#apps");
    var gridLayout = new GridLayout(grid.width(), grid.height(), 4, 2);
    var gridDash = new IconGrid("appDashboard", grid, appData, gridLayout);
    gridDash.initialize();
    gridDash.refresh();
});