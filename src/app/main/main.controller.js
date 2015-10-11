(function() {
  'use strict';

  angular
    .module('schedully')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($interval, $geolocation, $log, $localStorage) {
    var vm = this;

    var _debug = true;

    vm.appDB = null;
    vm.timeWindowSeconds = 36 * 60 * 60; // two hours
    vm.selectedSchedule = null;
    vm.closestTimes = [];
    vm.refreshSchedule = refreshSchedule;
    vm.currentPosition = $geolocation.position;
    vm.distance = null;
    vm.approximateArivalTime = null;
    vm.locationFrom = null;
    vm.locationTo = null;
    vm.$storage = $localStorage.$default({
      useGeoLocation: true
    });

    var locationsById = {};


    activate();


    function activate() {
      prepareScheduleForDay();
      refreshSchedule();

      // TODO: destroy?
      $interval(prepareScheduleForDay, 60 * 60 * 1000);
      $interval(refreshSchedule, 5 * 1000);
      $interval(updateTimeToNearest, 500);
    }



    function prepareScheduleForDay() {
      $log.info("Prepare data for new day");

      vm.appDB = _.cloneDeep(window.APP_DB);
      vm.locationFrom = vm.appDB.locations[0];
      vm.selectedSchedule = vm.locationFrom.schedules[0];

      locationsById = {};
      angular.forEach(vm.appDB.locations, function (location) {
        locationsById[location.id] = location;
      });
      angular.forEach(vm.appDB.locations, function (location) {
        angular.forEach(location.schedules, function (schedule) {
          //schedule.to = locationsById[schedule.to];
          for (var i = 0; i < schedule.times.length; i++) {
            var date = createDate();
            date.setHours(schedule.times[i][0], schedule.times[i][1], 0, 0);
            if (schedule.times[i][0] == 0) {
              date.setDate(date.getDate() + 2);
            }
            schedule.times[i] = date;
          }
        });
      });
    }

    function refreshSchedule() {
      vm.closestTimes = [];
      var timeNow = createDate();

      if (_debug){
        vm.currentPosition = {
          coords: {latitude: 56.321376, longitude: 43.955503, speed: 2}
        }
      }

      $log.debug("Refresh " + timeNow  + " nearest? " + vm.$storage.useGeoLocation);

      ensureGeoLocationState();
      if(vm.$storage.useGeoLocation){
        sortNearestAndSelect();
      }

      for (var i = 0; i < vm.selectedSchedule.times.length; i++){
        var time = vm.selectedSchedule.times[i];
        var deltaNow = moment(time).diff(timeNow, 'seconds');
        if (deltaNow >= 0 && deltaNow < vm.timeWindowSeconds) {
          var deltaNext = moment(vm.selectedSchedule.times[i + 1]).diff(time, 'minutes');
          vm.closestTimes.push({at: time, nextAfterMinutes: deltaNext});
        }
      }
      updateTimeToNearest();
    }

    function sortNearestAndSelect() {
      if (vm.currentPosition && vm.currentPosition.coords) {
        vm.appDB.locations = _.sortBy(vm.appDB.locations, function (location) {

          location.places = _.sortBy(location.places, function (place) {
            var dist = haversine(vm.currentPosition.coords, place.location);
            place.distance = dist;
            return dist
          });
          return location.places[0].distance;
        });
        vm.locationFrom = vm.appDB.locations[0];
      }
    }

    function updateTimeToNearest(){
      if(!vm.closestTimes.length) {
        return
      }
      var now = createDate();
      var delta = 0;
      for (var i = 0; i < vm.closestTimes.length; i++) {
        delta = moment(vm.closestTimes[i].at).diff(now, 'seconds');
        if (delta > 0){
          break;
        }
      }

      var virtualDate = createDate();
      virtualDate.setMinutes(0, delta, 0);
      vm.timeToClosest = virtualDate;
      var distance = vm.locationFrom.places[0].distance;
      if (typeof distance != "undefined"){
        vm.distance = (distance * 1000).toFixed(2);
      }
      if (vm.distance && delta &&
          vm.currentPosition &&
          vm.currentPosition.coords && vm.currentPosition.coords.speed) {
        var approximateArrivalSeconds = vm.distance / vm.currentPosition.coords.speed;
        vm.approximateArivalTime = createDate().setMinutes(0, approximateArrivalSeconds, 0);
      }
    }

    function createDate(){
      if (_debug){
        var date = new Date();
        date.setHours(9, 30);
        return date;
      }
      return new Date();
    }

    var _geoLocationActivated = false;
    function ensureGeoLocationState() {
      if (_geoLocationActivated){
        if (!vm.$storage.useGeoLocation){
          _geoLocationActivated = false;
          $geolocation.clearWatch();
        }
      } else if (vm.$storage.useGeoLocation) {
        var geoOptions = {
          timeout: 60000,
          maximumAge: 1000,
          enableHighAccuracy: true
        };
        $geolocation.getCurrentPosition(geoOptions).then(refreshSchedule);
        $geolocation.watchPosition();
        _geoLocationActivated = true;
      }

    }
  }
})();
