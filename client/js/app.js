const app = angular.module('chat',[]);

app.controller('mainController',['$scope', ($scope) => {
 let socket = io.connect();
 
 $scope.send = () => {
   if($scope.message) {
    socket.emit('chat message', $scope.message);
    $scope.message="";
   }
 }

 let v = 0;
 socket.on('chat message', (msg) => {
  let e = document.createElement("div");
  
  if(v % 2 == 0)
  {
    e.className = 'ui left floated massive segment';
  }
  else {
    e.className = 'ui right floated massive segment';
  }
  v = v + 1;

  e.appendChild(document.createTextNode(msg));
  document.getElementById("messages").appendChild(e);
 });
}]);