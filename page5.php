<?php
$loginMessage = "";
$formMessage = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (isset($_POST["login_submit"])) {
        $username = $_POST["username"];
        $password = $_POST["password"];

        if ($username === "admin" && $password === "1234") {
            $loginMessage = "Login successful. Welcome, admin!";
        } else {
            $loginMessage = "Invalid username or password.";
        }
    }

    if (isset($_POST["info_submit"])) {
        $name = $_POST["name"];
        $email = $_POST["email"];
        $formMessage = "Submitted Data -> Name: " . htmlspecialchars($name) . " | Email: " . htmlspecialchars($email);
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Page 5 | PHP Mini Application</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      background-color: #f2f6fb;
      color: #1f2937;
    }

    .navbar {
      background-color: #1e3a8a;
      padding: 12px;
      text-align: center;
    }

    .navbar a {
      color: white;
      text-decoration: none;
      margin: 0 10px;
      font-weight: bold;
    }

    .container {
      max-width: 900px;
      margin: 24px auto;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    }

    input {
      padding: 8px;
      margin: 8px 0;
      width: 100%;
      max-width: 350px;
    }

    button {
      padding: 8px 14px;
      background-color: #1e3a8a;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }

    .message {
      margin: 10px 0;
      font-weight: bold;
    }

    .buttons {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
    }

    .buttons a {
      background-color: #1e3a8a;
      color: white;
      text-decoration: none;
      padding: 10px 14px;
      border-radius: 6px;
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <a href="index.html">Home</a>
    <a href="page2.html">Page 2</a>
    <a href="page3.html">Page 3</a>
    <a href="page4.html">Page 4</a>
    <a href="page5.php">Page 5</a>
  </nav>

  <div class="container">
    <h1>PHP Mini Application</h1>

    <h2>1) Simple Login System</h2>
    <p>Use username: admin and password: 1234</p>

    <form method="post" action="">
      <label for="username">Username:</label><br />
      <input type="text" id="username" name="username" required /><br />

      <label for="password">Password:</label><br />
      <input type="password" id="password" name="password" required /><br />

      <button type="submit" name="login_submit">Login</button>
    </form>

    <?php if ($loginMessage !== ""): ?>
      <p class="message"><?php echo $loginMessage; ?></p>
    <?php endif; ?>

    <hr />

    <h2>2) Form Handling with POST</h2>
    <form method="post" action="">
      <label for="name">Name:</label><br />
      <input type="text" id="name" name="name" required /><br />

      <label for="email">Email:</label><br />
      <input type="email" id="email" name="email" required /><br />

      <button type="submit" name="info_submit">Submit Data</button>
    </form>

    <?php if ($formMessage !== ""): ?>
      <p class="message"><?php echo $formMessage; ?></p>
    <?php endif; ?>

    <div class="buttons">
      <a href="page4.html">Back</a>
      <a href="index.html">Next</a>
    </div>
  </div>
</body>
</html>
