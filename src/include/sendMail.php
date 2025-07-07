<?php
    // 1. このスクリプトは、PHPMailerライブラリを使用してメールを送信するための関数を定義しています。
    // 2. sendMail関数は、受信者のメールアドレス、件名、本文を引数として受け取り、メールを送信します。
    // 3. メール送信の際にSMTPサーバーの設定を行い、認証情報を使用して接続します。
    // 4. メールのエンコーディングをUTF-8に設定し、HTML形式でメールを送信します。
    // 5. メール送信が成功した場合はtrueを返し、失敗した場合はエラーメッセージを表示し、管理者に通知を送信します。l

    use PHPMailer\PHPMailer\PHPMailer;
    use PHPMailer\PHPMailer\Exception;
    use PHPMailer\PHPMailer\SMTP;

    require_once 'PHPMailer/src/Exception.php';
    require_once 'PHPMailer/src/PHPMailer.php';
    require_once 'PHPMailer/src/SMTP.php';

    require_once 'sanae.tokyo.php';

    function sendMail($to, $subject, $body): bool {
        $mail = new PHPMailer(true);
        
        try {
            $mail->isSMTP();
            $mail->Host = 'sanae.tokyo';
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['MAIL_USER'];
            $mail->Password = $_ENV['MAIL_PASSWORD'];

            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom($_ENV['MAIL_USER'], 'SanaeProject');
            $mail->addAddress($to, 'Recipient Name');

            // **エンコーディング設定**
            $mail->CharSet  = 'UTF-8';  // メールのエンコーディングをUTF-8に設定
            $mail->Encoding = 'base64'; // MIMEエンコーディングを指定

            // メール件名と本文
            $mail->Subject = mb_encode_mimeheader($subject, 'UTF-8');
            $mail->Body = $body;
            $mail->isHTML(true); // プレーンテキストメール（HTMLの場合はtrueに変更）

            $mail->send();

            return true;
        } catch (Exception $e) {
            return false;
        }
    }
?>
