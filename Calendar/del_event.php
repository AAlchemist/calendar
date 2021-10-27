<?php

session_start();

header("Content-Type: application/json"); 

$json_str = file_get_contents('php://input');
$json_obj = json_decode($json_str, true);

$event_id = $json_obj['event_id'];
$token = $json_obj['token'];

if(!hash_equals($_SESSION['token'], $token)) {
	die("Request forgery detected");
}


require 'database.php';

$stmt = $mysqli->prepare("DELETE FROM events WHERE event_id = ?");

if(!$stmt) {

    echo json_encode(array(
		"success" => false
	));
	exit;
}

$stmt->bind_param('i', $event_id);
$stmt->execute();

echo json_encode(array(
    "success" => true
));
exit;

?>