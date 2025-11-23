<?php
// Увімкнення коректного виводу Unicode
header('Content-Type: application/json; charset=utf-8');

// Перевірка на POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Отримуємо дані з форми
    $username = trim($_POST['username'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $message  = trim($_POST['message'] ?? '');

    // Перевірка на порожні значення
    if ($username === '' || $email === '' || $password === '') {
        echo json_encode(["status" => "error", "msg" => "Заповніть всі поля"]);
        exit;
    }

    // Формуємо рядок
    $time = date("Y-m-d H:i:s");
    $entry = "Ім'я: $username | Email: $email | Час: $time | Повідомлення: $message\n";

    // Записуємо в users.txt
    file_put_contents("users.txt", $entry, FILE_APPEND);

    // Відповідь назад на сайт
    echo json_encode(["status" => "success"]);
    exit;
}

echo json_encode(["status" => "error", "msg" => "Невірний метод"]);
exit;
?>
