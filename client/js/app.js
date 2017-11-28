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
 socket.on('chat message', (data) => {
  let e = document.createElement("div");
  
  if(data.isTeacher)
  { // 先生は右側
    e.className = 'ui right floated large segment';
  }
  else
  { // 生徒は左側で色を互い違いに
    if(v % 2 == 0)
    {
      e.className = 'ui left ou_even floated large segment';
    }
    else
    {
      e.className = 'ui left ou_odd floated large segment';
    }
  }
  var ee = document.createElement("i");
  if(data.isTeacher) {
    ee.className = 'white student icon';
    e.id = 'teacher'
  }
  else {
    ee.className = 'smile icon';
  }
  e.appendChild(ee);

  v = v + 1;

  e.appendChild(document.createTextNode(data.message));
  document.getElementById("messages").appendChild(e);
 });
}]);