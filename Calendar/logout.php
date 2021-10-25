<?php
session_start();
unset($_SESSION['userId']);
unset($_SESSION['username']);
unset($_SESSION['token']);
echo json_encode(array(
    "success" => true
));
?>