/* L.Grid_YY.js */
/* Written: 2024-12-11 */

L.MaidenheadGrid = L.LayerGroup.extend({
  options: {
    color: '#ff7d78',
    weight: 4,  // Increased to 4
    opacity: 1.0,
    labelSize: '18px', // Increased to 24px
    labelOpacity: 1.0,
    zoomLevels: {
        field: 4,
        square: 7,
        subsquare: 0
    }
},

  initialize: function(options) {
    L.LayerGroup.prototype.initialize.call(this);
    L.setOptions(this, options);
    this._layers = {};
    this._gridCache = {};
  },

  onAdd: function(map) {
    this._map = map;
    this._draw();
    this._map.on('moveend', this._draw, this);
    this._map.on('zoomend', this._draw, this);
  },

  onRemove: function(map) {
    map.off('moveend', this._draw, this);
    map.off('zoomend', this._draw, this);
    this.clearLayers();
  },

  _getGridPrecision: function() {
    const zoom = this._map.getZoom();
    
    if (this.options.isStateSelected) {
      return 2;
    }
    
    if (zoom <= this.options.zoomLevels.field) return 1;
    if (zoom <= this.options.zoomLevels.square) return 2;
    return 3;
  },

  _calculateGrid: function(lat, lng, precision) {
    const fieldLng = String.fromCharCode(65 + Math.floor((lng + 180) / 20));
    const fieldLat = String.fromCharCode(65 + Math.floor((lat + 90) / 10));
    
    if (precision === 1) return fieldLng + fieldLat;
    
    const sqLng = Math.floor(((lng + 180) % 20) / 2);
    const sqLat = Math.floor((lat + 90) % 10);
    
    if (precision === 2) return fieldLng + fieldLat + sqLng + sqLat;
    
    const baseLat = Math.floor(lat);
    const baseLng = Math.floor(lng / 2) * 2;
    
    const latMin = ((lat - baseLat) * 60);
    const lngMin = ((lng - baseLng) * 60);
    
    const subsqLng = String.fromCharCode(97 + Math.floor(lngMin / 5));
    const subsqLat = String.fromCharCode(97 + Math.floor(latMin / 2.5));
    
    return fieldLng + fieldLat + sqLng + sqLat + subsqLng + subsqLat;
  },

  _getGridBounds: function(precision) {
    const bounds = this._map.getBounds();
    const gridBounds = [];
    
    const latStep = precision === 1 ? 10 : precision === 2 ? 1 : 1/24;
    const lngStep = precision === 1 ? 20 : precision === 2 ? 2 : 1/12;
    
    let startLat = Math.floor((bounds.getSouth() + 90) / latStep) * latStep - 90;
    let startLng = Math.floor((bounds.getWest() + 180) / lngStep) * lngStep - 180;
    
    for (let lat = startLat; lat <= bounds.getNorth(); lat += latStep) {
      for (let lng = startLng; lng <= bounds.getEast(); lng += lngStep) {
        gridBounds.push({
          bounds: L.latLngBounds([lat, lng], [lat + latStep, lng + lngStep]),
          center: L.latLng(lat + latStep/2, lng + lngStep/2)
        });
      }
    }
    
    return gridBounds;
  },

  _draw: function() {
   this.clearLayers();
   
   const precision = this._getGridPrecision();
   const gridSquares = this._getGridBounds(precision);
   const zoom = this._map.getZoom();
   
   // Adjusted font scaling
   let fontSize;
   if (zoom <= 4) {
       fontSize = 24;  // Base size for nationwide view
   } else if (zoom <= 7) {
       fontSize = 32;  // Medium size for regional view
   } else {
       fontSize = 36;  // Large size for local view
   }
   
   gridSquares.forEach(square => {
     const rect = L.rectangle(square.bounds, {
       color: this.options.color,
       weight: this.options.weight,
       opacity: this.options.opacity,
       fill: false
     }).addTo(this);
     
     const gridRef = this._calculateGrid(
       square.center.lat, 
       square.center.lng, 
       precision
     );
     
     const label = L.marker(square.center, {
       icon: L.divIcon({
         className: 'maidenhead-label',
         html: `<span style="font-size: ${fontSize}px">${gridRef}</span>`,
         iconSize: [200, 80],
         iconAnchor: [100, 40]
       }),
       interactive: false
     }).addTo(this);
   });
} // End of _draw function
  
});

L.maidenheadGrid = function(options) {
  return new L.MaidenheadGrid(options);
};