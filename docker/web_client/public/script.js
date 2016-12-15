var app = angular.module('scotchApp', ['ngRoute','ngCookies','rzModule']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/create', {
            templateUrl : 'templates/create.html',
            controller  : 'createController'
        })
        .when('/login', {
            templateUrl : 'templates/login.html',
            controller  : 'loginController'
        })
        .when('/my_account', {
            templateUrl : 'templates/account.html',
            controller  : 'accountController'
        })
        .when('/search', {
            templateUrl : 'templates/search.html',
            controller  : 'searchController'
        })
        .when('/user/:id', {
            templateUrl : function(params){ return 'templates/user.html';},
            controller  : 'userController'
        })
        .when('/chat', {
            templateUrl : 'templates/chat.html',
            controller  : 'chatController'
        })
        .when('/chat/:id', {
            templateUrl : function(params){ return 'templates/chat.html';},
            controller  : 'chatController'
        })
        .otherwise({
            templateUrl : 'templates/404.html'
        });
});

app.directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsDataURL(changeEvent.target.files[0]);
            });
        }
    }
}]);
app.directive('fileDropzone', function() {
    return {
        restrict: 'A',
        scope: {
            file: '=',
            fileName: '='
        },
        link: function(scope, element, attrs) {
            var checkSize,
                isTypeValid,
                processDragOverOrEnter,
                validMimeTypes;

            processDragOverOrEnter = function (event) {
                if (event != null) {
                    event.preventDefault();
                }
                event.dataTransfer.effectAllowed = 'copy';
                return false;
            };

            validMimeTypes = attrs.fileDropzone;

            checkSize = function(size) {
                var _ref;
                if (((_ref = attrs.maxFileSize) === (void 0) || _ref === '') || (size / 1024) / 1024 < attrs.maxFileSize) {
                    return true;
                } else {
                    alert("File must be smaller than " + attrs.maxFileSize + " MB");
                    return false;
                }
            };

            isTypeValid = function(type) {
                if ((validMimeTypes === (void 0) || validMimeTypes === '') || validMimeTypes.indexOf(type) > -1) {
                    return true;
                } else {
                    alert("Invalid file type.  File must be one of following types " + validMimeTypes);
                    return false;
                }
            };

            element.bind('dragover', processDragOverOrEnter);
            element.bind('dragenter', processDragOverOrEnter);

            return element.bind('drop', function(event) {
                var file, name, reader, size, type;
                if (event != null) {
                    event.preventDefault();
                }
                reader = new FileReader();
                reader.onload = function(evt) {
                    if (checkSize(size) && isTypeValid(type)) {
                        return scope.$apply(function() {
                            scope.file = evt.target.result;
                            if (angular.isString(scope.fileName)) {
                                return scope.fileName = name;
                            }
                        });
                    }
                };
                file = event.dataTransfer.files[0];
                name = file.name;
                type = file.type;
                size = file.size;
                reader.readAsDataURL(file);
                return false;
            });
        }
    };
});



app.controller('mainController', ['$scope','$rootScope','$http','$cookies', '$sce', function($scope, $rootScope, $http, $cookies, $sce) {

    var url = '188.166.159.156';
    function create_socket($rootScope, $sce) {
        socket = io.connect('http://' + url + ':3042');
        if ($rootScope.token) {
            socket.emit('login', {token: $rootScope.token});
        } //connection auto au F5

        socket.on('newNotif', function (data) {
            $rootScope.notifSwitch = "_on";
            $rootScope.$apply();
        });

        socket.on('newMessage', function (data) {
            $rootScope.notifSwitch = "_on";
            $rootScope.messageSwitch = "_on";
            $rootScope.$apply();
        });

        return socket;
    }

    $rootScope.notifSwitch = "";
    $rootScope.messageSwitch = "";
    $rootScope.chatPseudo = "";
    $rootScope.token = $cookies.get('myTokenCode');
    socket = create_socket($rootScope, $sce);
    $rootScope.socket = socket;

    var deco = document.getElementById("deco");
    deco.onclick = function () {
        $cookies.remove('myTokenCode');
        setTimeout(function(){window.location.replace("http://188.166.159.156/#/login")}, 100);
    };
}]);

app.controller('createController', function($scope, $http) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/create',
            data: {
                mail: $scope.mail,
                pseudo: $scope.pseudo,
                password: $scope.password,
                password2: $scope.password2,
                firstname: $scope.firstname,
                lastname: $scope.lastname
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                $scope.success = response.data.json;
                setTimeout(function(){window.location.replace("http://188.166.159.156/#/login")}, 1500);
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            } else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    var button = document.getElementById("envoyer");
    button.onclick = requete_api;
});

app.controller('loginController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/login',
            data: {
                pseudo: $scope.pseudo,
                password: $scope.password
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                $cookies.put('myTokenCode', response.data.json);
                $scope.success = "Connexion réussie.";
                socket.emit('login', {token: response.data.json});
                setTimeout(function(){window.location.replace("http://188.166.159.156/#/my_account")}, 1500);
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            }
            else {
                document.getElementsByClassName("forgot")[0].style.display = "block";
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    function reset_password() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/reset',
            data: {
                mail: $scope.mail,
                pseudo: $scope.pseudo
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}
            document.getElementsByClassName("forgot")[0].style.display = "block";

            if (response.data.state == 'success') {
                $scope.success = "Votre mot de passe a été réinitialisé et un mail vous a été envoyé";
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    var button = document.getElementById("envoyer");
    button.onclick = requete_api;

    var forgot = document.getElementById("forgot");
    forgot.onclick = reset_password;
}]);

app.controller('accountController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {
    function requete_api() {
        var data = {token: $cookies.get('myTokenCode')};
        if ($scope.account != undefined) {
            data.mail = $scope.account.mail;
            data.firstname = $scope.account.firstname;
            data.lastname = $scope.account.lastname;
            data.age = $scope.account.age;
            data.gender = $scope.account.gender;
            data.orient = $scope.account.orient;
            data.bio = $scope.account.bio;
            data.tags = $scope.account.tags;
            data.lat = $scope.account.loca.lat;
            data.long = $scope.account.loca.long;
            if ($scope.account.images[0]) {data.image0 = $scope.account.images[0];}
            if ($scope.account.images[1]) {data.image1 = $scope.account.images[1];}
            if ($scope.account.images[2]) {data.image2 = $scope.account.images[2];}
            if ($scope.account.images[3]) {data.image3 = $scope.account.images[3];}
            if ($scope.account.images[4]) {data.image4 = $scope.account.images[4];}
        }
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/myaccount',
            data: data
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                document.getElementById("hiddenaside").style.position="static";
                if ($scope.account.pseudo != undefined)
                    $scope.success = "Votre compte à bien été modifié";
                else
                    $scope.success = 'Voici un petit apercu de votre compte';
                $scope.account = response.data.json;
                $scope.marker[0].setPosition(new google.maps.LatLng($scope.account.loca.lat,$scope.account.loca.long));
            }
            else if (response.data.state == 'validation') {
                document.getElementById("hiddenaside").style.position="static";
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    function delete_notifs() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/deletenotifs',
            data: {
                token : $cookies.get('myTokenCode')
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                document.getElementsByClassName("profile")[0].style.display = "block";
                $scope.account.notifications = [];
                $scope.success = "Vos notifications ont bien été suprimées";
            }
            else if (response.data.state == 'validation') {
                document.getElementsByClassName("profile")[0].style.display = "block";
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    function scope_delete_photo(number){
        $scope.account.images[number] = null;
        $scope.$digest();
    }

    function loadScript(url, callback) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onreadystatechange = callback;
        script.onload = callback;
        head.appendChild(script);
    }
    function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat : 48.896648,lng : 2.319092},
            scrollwheel: false,
            zoom: 3
        });
        if ($scope.marker[0] = new google.maps.Marker({
            map: map,
            position: {lat:55,lng:2},
            draggable: true,
            animation: google.maps.Animation.DROP,
            title: 'Votre position'
        })) {
            requete_api();
        }
        google.maps.event.addListener($scope.marker[0], "dragend", function( evenement ) {
            $scope.account.loca.lat = evenement.latLng.lat();
            $scope.account.loca.long = evenement.latLng.lng();
            $scope.$digest();
        });
    }

    $scope.account = {loca:{},images:{}};
    $scope.marker = [];
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyDRi8m3y5eB0JuRJLJAdAl3EUjaq8ZB7QU", initMap);

    document.getElementById("delete1").onclick = function(){scope_delete_photo(1);};
    document.getElementById("delete2").onclick = function(){scope_delete_photo(2);};
    document.getElementById("delete3").onclick = function(){scope_delete_photo(3);};
    document.getElementById("delete4").onclick = function(){scope_delete_photo(4);};
    document.getElementById("modify").onmouseover = function(){document.getElementById("modify_content").style.position="static";};
    document.getElementById("envoyer").onclick = requete_api;
    document.getElementById("deletenotifs").onclick = delete_notifs;
}]);

app.controller('searchController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {

    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/users',
            data: {
                token : $cookies.get('myTokenCode'),
                minScore : parseInt($scope.minScore),
                maxScore : parseInt($scope.maxScore),
                minAge : parseInt($scope.minAge),
                maxAge : parseInt($scope.maxAge),
                maxDist : parseInt($scope.maxDist),
                tags : $scope.tags
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                $scope.accounts = response.data.json;
                $scope.accounts.sort(function (val1, val2) {
                    a = val1.score + 5 * val1.nbTags - val1.distance;
                    b = val2.score + 5 * val2.nbTags - val2.distance;
                    return b - a;
                });
                $scope.success = "Tri par ponderation";
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    function sortAll(value) {
        $scope.accounts.sort(function (a, b) {
            if (a[value] > b[value])
                return sorts[value] ? 1 : -1;
            if (a[value] < b[value])
                return sorts[value] ? -1 : 1;
            return 0;
        });
        $scope.success = sorts[value] ? "Tri par "+value+" croissant" : "tri par "+value+" décroissant";
        sorts[value] = !sorts[value];
        $scope.$digest();//reactualise notre moteur de templating ;)
    }

    $scope.minScore = 1;
    $scope.maxScore = 100;
    $scope.minAge = 18;
    $scope.maxAge = 100;
    $scope.maxDist = 500;
    var sorts = {age:1,score:0,nbTags:0,distance:1};

    requete_api();
    var button = document.getElementById("envoyer");
    var sortScore = document.getElementById("sortScore");
    var sortAge = document.getElementById("sortAge");
    var sortTags = document.getElementById("sortTags");
    var sortDistance = document.getElementById("sortDistance");
    button.onclick = requete_api;
    sortScore.onclick = function(){sortAll('score');};
    sortAge.onclick = function(){sortAll('age');};
    sortTags.onclick = function(){sortAll('nbTags');};
    sortDistance.onclick = function(){sortAll('distance');};

}]);

app.controller('userController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/useraccount',
            data: {
                token: $cookies.get('myTokenCode'),
                pseudo: Pseudo
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                $scope.success = 'Recherche reussie';
                document.getElementsByClassName("profile")[0].style.display = "block";
                $scope.account = response.data.json;
                socket.emit('sendNotif', {to: Pseudo});
            }
            else if (response.data.state == 'validation') {
                document.getElementsByClassName("profile")[0].style.display = "block";
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    function likeIt() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/userlike',
            data: {
                token: $cookies.get('myTokenCode'),
                pseudo: Pseudo
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                $scope.account.liked = response.data.json;
                document.getElementsByClassName("profile")[0].style.display = "block";
                if ($scope.account.liked) {
                    $scope.success = 'Vous venez de liker ' + Pseudo;
                    $scope.account.score += 5;
                }
                else {
                    $scope.success = 'Vous ne likez plus ' + Pseudo;
                    $scope.account.score -= 5;
                }
                socket.emit('sendNotif', {to: Pseudo});
            }
            else if (response.data.state == 'validation') {
                document.getElementsByClassName("profile")[0].style.display = "block";
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }
    function reportIt() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/userreport',
            data: {
                token: $cookies.get('myTokenCode'),
                pseudo: Pseudo
            }
        }).then(function successCallback(response) {
            if (response.data.success) {
                $scope.error = 'Vous venez de reporter ' + Pseudo;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            $scope.error = "An error has occured, please try again";
            console.log('error');
        });
    }
    function blockIt() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/userblock',
            data: {
                token: $cookies.get('myTokenCode'),
                pseudo: Pseudo
            }
        }).then(function successCallback(response) {
            if (response.data.success) {
                $scope.error = 'Vous venez de bloquer ' + Pseudo;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            $scope.error = "An error has occured, please try again";
            console.log('error');
        });
    }

    var Url = document.location.href;
    var Pseudo = Url.substring(Url.lastIndexOf( "/" ) + 1);
    requete_api();

    var like = document.getElementById("like");
    var report = document.getElementById("report");
    var block = document.getElementById("block");
    like.onclick = likeIt;
    report.onclick = reportIt;
    block.onclick = blockIt;
}]);

app.controller('chatController', ['$scope', '$http','$cookies', function($scope, $http, $cookies) {
    function requete_api() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/chathisto',
            data: {
                token: $cookies.get('myTokenCode'),
                pseudo: Pseudo
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                $scope.success = 'Discuter avec '+Pseudo;
                $scope.messagelist = response.data.json;
                $scope.likeslist = response.data.likes;
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    function chatIt() {
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/userchat',
            data: {
                token: $cookies.get('myTokenCode'),
                pseudo: Pseudo,
                message: $scope.message
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                $scope.success = 'message envoyé';
                //document.getElementsByClassName("profile")[0].style.display = "block";
                socket.emit('sendMessage', {to: Pseudo});
                requete_api()
            }
            else if (response.data.state == 'validation') {
                //document.getElementsByClassName("profile")[0].style.display = "block";
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }
    function listOfMatchs(){
        $http({
            method: 'POST',
            url: 'http://188.166.159.156:4201/chathisto',
            data: {
                token: $cookies.get('myTokenCode'),
                pseudo: Pseudo
            }
        }).then(function successCallback(response) {
            var toHide = document.getElementsByClassName("hidden");
            for (var i = 0; i < toHide.length; ++i) {toHide[i].style.display = "none";}
            if (toShow = document.getElementsByClassName(response.data.state)[0]) {toShow.style.display = "block";}

            if (response.data.state == 'success') {
                $scope.messagelist = response.data.json;
            }
            else if (response.data.state == 'validation') {
                $scope.validation = response.data.json;
            }
            else {
                $scope.error = "Erreur : " + response.data.json;
            }
        }, function errorCallback(response) {
            document.getElementsByClassName("error")[0].style.display = "block";
            $scope.error = "An error has occured, please try again";
        });
    }

    socket.on('newMessage', function (data) {
        requete_api()
    });

    var Url = document.location.href;
    var Pseudo = Url.substring(Url.lastIndexOf( "/" ) + 1);
    $scope.pseudo = Pseudo;
    requete_api();

    var chat = document.getElementById("chat");
    chat.onclick = chatIt;


}]);
