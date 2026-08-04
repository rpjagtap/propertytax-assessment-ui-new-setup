<?php
// payment_response.php
// This file acts as a middleware between the payment gateway and your React app

// Allow only POST requests (from payment gateway)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Read all POST data sent by the payment gateway
    $paymentData = $_POST;

    // Optional: Log or verify hash/signature here for security
    // file_put_contents('payment_log.txt', json_encode($paymentData, JSON_PRETTY_PRINT), FILE_APPEND);

    // Convert POST data to a URL query string
    $queryString = http_build_query($paymentData);

    // Frontend React app URL (Change this to your actual frontend page)
    $frontendUrl = "https://live.publicptaxpcmc.in:4001/PaymentResponse";

    // Redirect user to React frontend with payment details
    header("Location: " . $frontendUrl . "?" . $queryString);
    exit();

} else {
    // If it's a GET or other method, show simple message or handle gracefully
    echo "Invalid Request Method. Only POST allowed.";
}
?>
