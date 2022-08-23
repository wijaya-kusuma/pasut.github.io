var map, featureList, saSearch = [], staSearch = [];

$(window).resize(function() {
  sizeLayerControl();
});

$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});

if ( !("ontouchstart" in window) ) {
  $(document).on("mouseover", ".feature-row", function(e) {
    highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
  });
}

$(document).on("mouseout", ".feature-row", clearHighlight);

$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#full-extent-btn").click(function() {
  map.fitBounds(sas.getBounds());
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#legend-btn").click(function() {
  $("#legendModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#login-btn").click(function() {
  $("#loginModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

$("#list-btn").click(function() {
  animateSidebar();
  return false;
});

$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});

$("#sidebar-toggle-btn").click(function() {
  animateSidebar();
  return false;
});

$("#sidebar-hide-btn").click(function() {
  animateSidebar();
  return false;
});

function animateSidebar() {
  $("#sidebar").animate({
    width: "toggle"
  }, 350, function() {
    map.invalidateSize();
  });
}

function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

function clearHighlight() {
  highlight.clearLayers();
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 10);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}

function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  /* Loop through active station layer and add only features which are in the map bounds */
  sas.eachLayer(function (layer) {
    if (map.hasLayer(saLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="12" height="18" src="assets/img/green_icon_cdr.png"></td><td class="feature-name">' + layer.feature.properties.Title + ' - ' + layer.feature.properties.Nama_Stasi + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Loop through non active station layer and add only features which are in the map bounds */
  stas.eachLayer(function (layer) {
    if (map.hasLayer(staLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="12" height="18" src="assets/img/red_icon_cdr.png"></td><td class="feature-name">' + layer.feature.properties.Title + ' - ' + layer.feature.properties.Nama_Stasi + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-name"]
  });
  featureList.sort("feature-name", {
    order: "asc"
  });
}

/* Basemap Layers */
var cartoLight = L.tileLayer("https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
});
var usgsImagery = L.layerGroup([L.tileLayer("http://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 15,
}), L.tileLayer.wms("http://raster.nationalmap.gov/arcgis/services/Orthoimagery/USGS_EROS_Ortho_SCALE/ImageServer/WMSServer?", {
  minZoom: 16,
  maxZoom: 19,
  layers: "0",
  format: 'image/jpeg',
  transparent: true,
  attribution: "Aerial Imagery courtesy USGS"
})]);

/* Overlay Layers */
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 4
});

/* Empty layer placeholder to add to layer control for listening when to add/remove active station to markerClusters layer */
var saLayer = L.geoJson(null);
var sas = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/green_icon_cdr.png",
        iconSize: [18, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.Title,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var bangunan =  "<li class='dropdown'>"+
                        "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Bangunan<b class='caret'></b></a>"+
                          "<ul class='dropdown-menu'>"+
                            "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                            "<li class='divider hidden-xxs'></li>"+
                            "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Bangunan/' target='_blank' onclick='alert('Tidak ada data yang dapat ditampilkan');'>&nbsp;&nbsp;2019</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Bangunan/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Bangunan/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Bangunan/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                          "</ul>"+
                      "</li>"
                    
      var palem = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Palem<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Palem/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Palem/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Palem/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Palem/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var pin = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>PIN<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/PIN/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/PIN/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/PIN/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/PIN/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var sensor = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Sensor<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var sensor = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Sensor<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var solarPanel = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Solar Panel<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Solar_panel/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Solar_panel/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Solar_panel/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Solar_panel/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var tap = "<li class='dropdown'>"+
                        "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>TAP<b class='caret'></b></a>"+
                          "<ul class='dropdown-menu'>"+
                            "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                            "<li class='divider hidden-xxs'></li>"+
                            "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/TAP/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/TAP/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/TAP/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/TAP/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                          "</ul>"+
                        "</li>"
      var tip = "<li class='dropdown'>"+
                  "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>TIP<b class='caret'></b></a>"+
                  "<ul class='dropdown-menu'>"+
                    "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                    "<li class='divider hidden-xxs'></li>"+
                    "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/TIP/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/TIP/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/TIP/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/TIP/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                  "</ul>"+
                "</li>"
      var mountingGps = "<li class='dropdown'>"+
                  "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Mounting GPS<b class='caret'></b></a>"+
                  "<ul class='dropdown-menu'>"+
                    "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                    "<li class='divider hidden-xxs'></li>"+
                    "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Mounting_GPS/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Mounting_GPS/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Mounting_GPS/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Mounting_GPS/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                  "</ul>"+
                "</li>"
      var prog = "<li class='dropdown'>"+
                  "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Program <i>Datalogger</i><b class='caret'></b></a>"+
                  "<ul class='dropdown-menu'>"+
                    "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                    "<li class='divider hidden-xxs'></li>"+
                    "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/prog/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/prog/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/prog/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/prog/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                  "</ul>"+
                "</li>"
      var sumLevelling =  "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'><i>Summary Levelling</i><b class='caret'></b></a>"+
                    "<ul class='dropdown-menu'>"+
                      "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                      "<li class='divider hidden-xxs'></li>"+
                      "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/Levelling/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                      "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/Levelling/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                      "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/Levelling/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                      "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/Levelling/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                    "</ul>"+
                  "</li>"
      var content = "<table class='table table-striped table-bordered table-condensed'>" +
                    "<tr><th>Nama Stasiun</th><td>" + feature.properties.Nama_Stasi + "</td></tr>" +
                    "<tr><th>Kode Stasiun</th><td>" + feature.properties.Title.substring(4,8) + "</td></tr>" +
                    "<tr><th>Provinsi</th><td>" + feature.properties.Provinsi + "</td></tr>" +
                    "<tr><th style='vertical-align: middle' rowspan='8'>Gambar</th><td>"+bangunan+
                    "</td></tr><tr><td>"+palem+
                    "</td><tr><td>"+pin+
                    "</td></tr><tr><td>"+sensor+
                    "</td></tr><tr><td>"+solarPanel+
                    "</td></tr><tr><td>"+tap+
                    "</td></tr><tr><td>"+tip+
                    "</td></tr><tr><td>"+mountingGps+
                    "</td></tr><tr><th style='vertical-align: middle' rowspan='2'>Data</th><td>"+prog+
                    "</td></tr><tr><td>"+sumLevelling+
                    "</td></tr></tr>"+
                    "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Title);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="12" height="18" src="assets/img/green_icon_cdr.png"></td><td class="feature-name">' + layer.feature.properties.Title + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      saSearch.push({
        name: layer.feature.properties.Title,
        station_name: layer.feature.properties.Nama_Stasi,
        source: "sa",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/data_stasiun_aktif.geojson", function (data) {
  sas.addData(data);
  map.addLayer(saLayer);
});

/* Empty layer placeholder to add to layer control for listening when to add/remove nonactive station to markerClusters layer */
var staLayer = L.geoJson(null);
var stas = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: L.icon({
        iconUrl: "assets/img/red_icon_cdr.png",
        iconSize: [18, 28],
        iconAnchor: [12, 28],
        popupAnchor: [0, -25]
      }),
      title: feature.properties.Title,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      var bangunan = "<li class='dropdown'>"+
                        "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Bangunan<b class='caret'></b></a>"+
                          "<ul class='dropdown-menu'>"+
                            "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                            "<li class='divider hidden-xxs'></li>"+
                            "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Bangunan/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Bangunan/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Bangunan/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Bangunan/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                          "</ul>"+
                      "</li>"
      var palem = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Palem<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Palem/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Palem/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Palem/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Palem/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var pin = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>PIN<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/PIN/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/PIN/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/PIN/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/PIN/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var sensor = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Sensor<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var sensor = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Sensor<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Sensor/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var solarPanel = "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Solar Panel<b class='caret'></b></a>"+
                      "<ul class='dropdown-menu'>"+
                        "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                        "<li class='divider hidden-xxs'></li>"+
                        "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Solar_panel/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Solar_panel/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Solar_panel/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                        "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Solar_panel/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                      "</ul>"+
                    "</li>"
      var tap = "<li class='dropdown'>"+
                        "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>TAP<b class='caret'></b></a>"+
                          "<ul class='dropdown-menu'>"+
                            "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                            "<li class='divider hidden-xxs'></li>"+
                            "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/TAP/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/TAP/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/TAP/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                            "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/TAP/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                          "</ul>"+
                        "</li>"
      var tip = "<li class='dropdown'>"+
                  "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>TIP<b class='caret'></b></a>"+
                  "<ul class='dropdown-menu'>"+
                    "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                    "<li class='divider hidden-xxs'></li>"+
                    "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/TIP/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/TIP/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/TIP/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/TIP/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                  "</ul>"+
                "</li>"
      var mountingGps = "<li class='dropdown'>"+
                  "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Mounting GPS<b class='caret'></b></a>"+
                  "<ul class='dropdown-menu'>"+
                    "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                    "<li class='divider hidden-xxs'></li>"+
                    "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/foto/Mounting_GPS/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/foto/Mounting_GPS/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/foto/Mounting_GPS/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/foto/Mounting_GPS/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                  "</ul>"+
                "</li>"
      var prog = "<li class='dropdown'>"+
                  "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'>Program <i>Datalogger</i><b class='caret'></b></a>"+
                  "<ul class='dropdown-menu'>"+
                    "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                    "<li class='divider hidden-xxs'></li>"+
                    "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/prog/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/prog/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/prog/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                    "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/prog/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                  "</ul>"+
                "</li>"
      var sumLevelling =  "<li class='dropdown'>"+
                    "<a class='dropdown-toggle' id='downloadDrop' href='#' role='button' data-toggle='dropdown'><i>Summary Levelling</i><b class='caret'></b></a>"+
                    "<ul class='dropdown-menu'>"+
                      "<li class='year-popup'><b>&nbsp;&nbsp;Tahun</b></li>"+
                      "<li class='divider hidden-xxs'></li>"+
                      "<li><a href='data/data_stasiun_pasut/2019/"+feature.properties.Title+"/Levelling/' target='_blank'>&nbsp;&nbsp;2019</a></li>"+
                      "<li><a href='data/data_stasiun_pasut/2020/"+feature.properties.Title+"/Levelling/' target='_blank'>&nbsp;&nbsp;2020</a></li>"+
                      "<li><a href='data/data_stasiun_pasut/2021/"+feature.properties.Title+"/Levelling/' target='_blank'>&nbsp;&nbsp;2021</a></li>"+
                      "<li><a href='data/data_stasiun_pasut/2022/"+feature.properties.Title+"/Levelling/' target='_blank'>&nbsp;&nbsp;2022</a></li>"+
                    "</ul>"+
                  "</li>"
      var content = "<table class='table table-striped table-bordered table-condensed'>" +
                    "<tr><th>Nama Stasiun</th><td>" + feature.properties.Nama_Stasi + "</td></tr>" +
                    "<tr><th>Kode Stasiun</th><td>" + feature.properties.Title.substring(4,8) + "</td></tr>" +
                    "<tr><th>Provinsi</th><td>" + feature.properties.Provinsi + "</td></tr>" +
                    "<tr><th style='vertical-align: middle' rowspan='8'>Gambar</th><td>"+bangunan+
                    "</td></tr><tr><td>"+palem+
                    "</td><tr><td>"+pin+
                    "</td></tr><tr><td>"+sensor+
                    "</td></tr><tr><td>"+solarPanel+
                    "</td></tr><tr><td>"+tap+
                    "</td></tr><tr><td>"+tip+
                    "</td></tr><tr><td>"+mountingGps+
                    "</td></tr><tr><th style='vertical-align: middle' rowspan='2'>Data</th><td>"+prog+
                    "</td></tr><tr><td>"+sumLevelling+
                    "</td></tr></tr>"+
                    "<table>";
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Title);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });
      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="12" height="18" src="assets/img/red_icon_cdr.png"></td><td class="feature-name">' + layer.feature.properties.Title + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      staSearch.push({
        name: layer.feature.properties.Title,
        station_name: layer.feature.properties.Nama_Stasi,
        source: "sta",
        id: L.stamp(layer),
        lat: layer.feature.geometry.coordinates[1],
        lng: layer.feature.geometry.coordinates[0]
      });
    }
  }
});
$.getJSON("data/data_stasiun_tidak_aktif.geojson", function (data) {
  stas.addData(data);
});

map = L.map("map", {
  zoom: 10,
  layers: [cartoLight, markerClusters, highlight],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  if (e.layer === saLayer) {
    markerClusters.addLayer(sas);
    syncSidebar();
  }
  if (e.layer === staLayer) {
    markerClusters.addLayer(stas);
    syncSidebar();
  }
});

map.on("overlayremove", function(e) {
  if (e.layer === saLayer) {
    markerClusters.removeLayer(sas);
    syncSidebar();
  }
  if (e.layer === staLayer) {
    markerClusters.removeLayer(stas);
    syncSidebar();
  }
});

/* Filter sidebar feature list to only show features in current map bounds */
map.on("moveend", function (e) {
  syncSidebar();
});

/* Clear feature highlight when map is clicked */
map.on("click", function(e) {
  highlight.clearLayers();
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'>Developed by Wija-PJKGG | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location */
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-location-arrow",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 18,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

/* Larger screens get expanded layer control and visible sidebar */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var baseLayers = {
  "Street Map": cartoLight,
  "Aerial Imagery": usgsImagery
};

// Batas daerah, perlu diedit
var groupedOverlays = {
  "Lokasi Stasiun": {
    "<img src='assets/img/green_icon_cdr.png' width='16' height='24'>&nbsp;Stasiun Aktif": saLayer,
    "<img src='assets/img/red_icon_cdr.png' width='16' height='24'>&nbsp;Stasiun Tidak Aktif": staLayer
  },
};

var layerControl = L.control.groupedLayers(baseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  $("#loading").hide();
  sizeLayerControl();
  /* Fit map to action station layer bounds */
  map.fitBounds(sas.getBounds());
  featureList = new List("features", {valueNames: ["feature-name"]});
  featureList.sort("feature-name", {order:"asc"});


  var sasBH = new Bloodhound({
    name: "Title",
    stationName: "Nama_Stasi",
    datumTokenizer: function (d) {
      var idTokens= Bloodhound.tokenizers.whitespace(d.name);
      var stationTokens = Bloodhound.tokenizers.whitespace(d.stationName);
      return idTokens.concat(stationTokens);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: saSearch,
    limit: 10
  });

  var stasBH = new Bloodhound({
    name: "Titie",
    stationName: "Nama_Stasi",
    datumTokenizer: function (d) {
      var idTokens= Bloodhound.tokenizers.whitespace(d.name);
      var stationTokens = Bloodhound.tokenizers.whitespace(d.stationName);
      return idTokens.concat(stationTokens);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: staSearch,
    limit: 10
  });

  var geonamesBH = new Bloodhound({
    name: "GeoNames",
    datumTokenizer: function (d) {
      return Bloodhound.tokenizers.whitespace(d.name);
    },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    remote: {
      url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
      filter: function (data) {
        return $.map(data.geonames, function (result) {
          return {
            name: result.name + ", " + result.adminCode1,
            lat: result.lat,
            lng: result.lng,
            source: "GeoNames"
          };
        });
      },
      ajax: {
        beforeSend: function (jqXhr, settings) {
          settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
          $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
        },
        complete: function (jqXHR, status) {
          $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
        }
      }
    },
    limit: 10
  });

  sasBH.initialize();
  stasBH.initialize();
  geonamesBH.initialize();

  /* instantiate the typeahead UI */
  $("#searchbox").typeahead({
    minLength: 3,
    highlight: true,
    hint: false
  }, {
    name: "sa",
    displayKey: "name",
    source: sasBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/green_icon_cdr.png' width='18' height='28'>&nbsp;Stasiun Aktif</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<strong>{{station_name}}</strong>"].join(""))
    }
  }, {
    name: "sta",
    displayKey: "name",
    source: stasBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/red_icon_cdr.png' width='18' height='28'>&nbsp;Stasiun Tidak Aktif</h4>",
      suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<strong>{{station_name}}</strong>"].join(""))
    }
  }, {
    name: "GeoNames",
    displayKey: "name",
    source: geonamesBH.ttAdapter(),
    templates: {
      header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
    }
  }).on("typeahead:selected", function (obj, datum) {
    if (datum.source === "sa") {
      if (!map.hasLayer(saLayer)) {
        map.addLayer(saLayer);
      }
      map.setView([datum.lat, datum.lng], 12);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "sta") {
      if (!map.hasLayer(staLayer)) {
        map.addLayer(staLayer);
      }
      map.setView([datum.lat, datum.lng], 12);
      if (map._layers[datum.id]) {
        map._layers[datum.id].fire("click");
      }
    }
    if (datum.source === "GeoNames") {
      map.setView([datum.lat, datum.lng], 12);
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

// Leaflet patch to make layer control scrollable on touch browsers
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}