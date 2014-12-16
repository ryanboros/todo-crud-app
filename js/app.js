// Angular Application declaration
var app = angular.module('TodoApp', ['ui.bootstrap']);

// Todo Pseudo-class Object
app.factory('Todo', function() {
    // Constructor
    function Todo(t) {
        this.id = t.id || null;
        this.description = t.description || "";
        this.complete = (t.complete == "1") || false;
    };
    
    // Methods
    Todo.prototype = {
    }

    // return new instance
    return {
        instance: function(t) {
            if (t === undefined)
                t = {};

            return new Todo(t);
        }
    }
});

/* CRUD SERVICE */
app.factory('CrudService',['$injector', '$http', '$q', function($injector, $http, $q) {
    // Constructor
    function CrudService() {
        this.error = null;
        this.inProgress = null;
    }
    
    // Methods
    CrudService.prototype = {
        getTodo: function() {
            var deferred = $q.defer();
            
            this.inProgress = true;
            this.error = null;

            try {
                $http.get('api/todos').success(function(data){
                    deferred.resolve(data);
                });
            } catch(e) {
                this.inProgress = false;
                this.error = e;

                deferred.reject(e);
            }
            
            return deferred.promise;
        },
        addTodo: function(todo) {
            var deferred = $q.defer();
            
            this.inProgress = true;
            this.error = null;

            try {
                $http.post('api/add_todo', todo).success(function(data){
                    deferred.resolve(data);
                });
            } catch(e) {
                this.inProgress = false;
                this.error = e;

                deferred.reject(e);
            }
            
            return deferred.promise;
        },
        updateTodo: function(todo) {
            var deferred = $q.defer();

            this.inProgress = true;
            this.error = null;

            try {
                $http.post('api/update_todo', todo).success(function(data) {
                    deferred.resolve(data);
                });
            } catch (e) {
                this.inProgress = false;
                this.error = e;

                deferred.reject(e);
            }

            return deferred.promise;
        },
        deleteTodo: function(todo) {
            var deferred = $q.defer();

            this.inProgress = true;
            this.error = null;

            try {
                $http.post('api/delete_todo', todo).success(function(data) {
                    deferred.resolve(data);
                });
            } catch (e) {
                this.inProgress = false;
                this.error = e;

                deferred.reject(e);
            }

            return deferred.promise;
        }
    };
    
    // return new instance
    return {
        instance: function(o) {
            if (o === undefined)
                o = {};
            
            return new CrudService(o);
        }
    };
}]);

// Main Controller
app.controller('TodoCtrl', ['$scope', '$modal', 'Todo', 'CrudService',
    function($scope, $modal, Todo, CrudService) {

        // VARIABLES

        $scope.todoList = [];
        $scope.countComplete = 0;
        $scope.countRemaining = 0;
        $scope.addTodo = Todo.instance();
        $scope.crud = CrudService.instance();
        
        // FUNCTIONS

        $scope.refreshView = function() {
            $scope.todoList = [];

            $scope.crud.getTodo().then( function(data) {
                $scope.crud.inProgress = false;

                for (var i=0; i<data.length; i++) {
                   var todo = Todo.instance(data[i]);

                   $scope.todoList.push(todo);
                }
            }, function (error) {
                console.log(error);
            });
        };

        $scope.getComplete = function() {
            var c = 0;

            for (var i = 0; i < $scope.todoList.length; i++) {
                if ($scope.todoList[i].complete) {
                    c ++;
                } 
            }
            
            return c;
        };

        $scope.getRemaining = function() {
            var r = 0;

            for (var i = 0; i < $scope.todoList.length; i++) {
                if (!$scope.todoList[i].complete) {
                    r ++;
                }
            }

            return r;
        };
        
        // WATCHERS
        
        $scope.$watch('getComplete()', function(val) {
            if (val !== undefined) {
                $scope.countComplete = val;
            }
        });

        $scope.$watch('getRemaining()', function(val) {
            if (val !== undefined) {
                $scope.countRemaining = val;
            }
        });

        // EDIT MODAL CONTROLLER

        $scope.editTodoModalCtrl = ['$scope', 'parentScope', '$modalInstance', function($scope, parentScope, $modalInstance) {
            $scope.editDescription = parentScope.editTodo.description;
            
            $scope.onCloseClick = function(e) {
                $modalInstance.close();
            };

            $scope.onCancelClick = function(e) {
                $modalInstance.close();
            };

            $scope.onSaveEditClick = function(e) {
                if ($scope.editTodoForm.$invalid)
                    return;
                
                parentScope.editTodo.description = $scope.editDescription;

                parentScope.crud.updateTodo(parentScope.editTodo).then( function(data) {
                    parentScope.crud.inProgress = false
                    parentScope.editTodo = null;

                    $modalInstance.close();
                }, function (error) {
                    console.log(error);
                });
            };
        }];

        // DELETE MODAL CONTROLLER

        $scope.deleteTodoModalCtrl = ['$scope', 'parentScope', '$modalInstance', function($scope, parentScope, $modalInstance) {
            $scope.deleteDescription = parentScope.deleteTodo.description;

            $scope.onCloseClick = function(e) {
                $modalInstance.close();
            };

            $scope.onCancelClick = function(e) {
                $modalInstance.close();
            };

            $scope.onDeleteItemClick = function(e) {
                parentScope.crud.deleteTodo(parentScope.deleteTodo).then( function(data) {
                    parentScope.crud.inProgress = false;
                    parentScope.deleteTodo = null;
                    parentScope.refreshView();
                    
                    $modalInstance.close();
                }, function (error) {
                    console.log(error);
                });
            };
        }];

        // EVENT HANDLERS

        $scope.onAddTodo = function() {
            if ($scope.addTodo.description === "")
                return;

            $scope.crud.addTodo($scope.addTodo).then( function(data) {
                var todo = Todo.instance(data);

                $scope.todoList.push(todo);

                $scope.crud.inProgress = false;

                $scope.addTodo.description = "";
            }, function (error) {
                console.log(error);
            });
        };

        $scope.onCompleteToggle = function(todo) {
            $scope.crud.updateTodo(todo).then( function(data) {
                $scope.crud.inProgress = false;
            }, function (error) {
                console.log(error);
            });
        };

        $scope.onEditTodoClick = function(todo) {
            $scope.editTodo = todo;

            var modalInstance = $modal.open({
                templateUrl: 'partials/tl-edit-todo.html',
                controller: $scope.editTodoModalCtrl,
                size: 'sm',
                resolve: {
                    parentScope: function() {
                        return $scope;
                    }
                }
            });

            modalInstance.result.then(function (success) {
            });
        };

        $scope.onDeleteTodoClick = function(todo) {
            $scope.deleteTodo = todo;

            var modalInstance = $modal.open({
                templateUrl: 'partials/tl-delete-todo.html',
                controller: $scope.deleteTodoModalCtrl,
                size: 'sm',
                resolve: {
                    parentScope: function() {
                        return $scope;
                    }
                }
            });

            modalInstance.result.then(function (success) {
            });

        };

        // INIT

        $scope.refreshView();
    }
]);