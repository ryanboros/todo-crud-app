<?php 

require 'Slim/Slim.php';

use \Slim\Slim as Slim;

Slim::registerAutoloader();

$app = new Slim();
$app -> get('/todos', 'getTodos');
$app -> post('/add_todo', 'addTodo');
$app -> post('/update_todo', 'updateTodo');
$app -> post('/delete_todo', 'deleteTodo');
$app -> run();

// getTodos method
function getTodos() {
    $sql = "select * FROM todo ORDER BY id";    
    
    try {
        $db = getConnection();
        
        $stmt = $db -> query($sql);
        
        $results = $stmt -> fetchAll(PDO::FETCH_OBJ);
        
        $db = null;
        
        echo json_encode($results);
    } catch (PDOException $e) {
        echo '{"error":{"text":' . $e -> getMessage() . '}}';
    }
}

// addTodo method
function addTodo() {
    $request = Slim::getInstance() -> request();
    
    $todo = json_decode($request -> getBody());
    
    $sql = "INSERT INTO todo (description, complete) VALUES (:description, :complete)";
    
    try {
        $db = getConnection();
        
        $stmt = $db -> prepare($sql);
        $stmt -> bindParam("description", $todo -> description);
        $stmt -> bindParam("complete", $todo -> complete);
        $stmt -> execute();
        
        $todo -> id = $db -> lastInsertId();
        
        $db = null;
        
        echo json_encode($todo);
    } catch (PDOException $e) {
        echo '{"error":{"text":'. $e -> getMessage() .'}}'; 
    }
}

// updateTodo method
function updateTodo() {
    $request = Slim::getInstance() -> request();
    
    $todo = json_decode($request -> getBody());
    
    $sql = "UPDATE todo SET description = :description, complete = :complete WHERE id = :id";
    
    try {
        $db = getConnection();
        
        $stmt = $db -> prepare($sql);
        $stmt -> bindParam("description", $todo -> description);
        $stmt -> bindParam("complete", $todo -> complete);
        $stmt -> bindParam("id", $todo -> id);
        $stmt -> execute();
       
        $db = null;
        
        echo json_encode($todo);
    } catch (PDOException $e) {
        echo '{"error":{"text":'. $e -> getMessage() .'}}'; 
    }
}

function deleteTodo() {
    $request = Slim::getInstance() -> request();
    
    $todo = json_decode($request -> getBody());
    
    $sql = "DELETE FROM todo WHERE id = :id";
    
    try {
        $db = getConnection();
        
        $stmt = $db -> prepare($sql);
        $stmt -> bindParam("id", $todo -> id);
        $stmt -> execute();
        
        $db = null;
        
        echo '{"success":{"text":"200 OK"}}';
    } catch (PDOException $e) {
        echo '{"error":{"text":'. $e -> getMessage() .'}}'; 
    }
}

// db connection
function getConnection() {
    $dbhost="localhost";
    $dbuser="testUser";
    $dbpass="test2468";
    $dbname="todo_crud";
    
    $dbh = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    return $dbh;
}

?>