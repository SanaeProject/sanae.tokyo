<?php
/**
 * PDOデータベース接続を管理するハンドラークラス
 * 
 * このクラスは、MySQLとSQLiteのデータベース接続を管理し、
 * クエリの実行を安全に行うためのシングルトンパターンを実装しています。
 */
class PDOHandler{
    private $pdo;

    /**
     * プライベートコンストラクタ
     * 
     * @param PDO $pdo PDOインスタンス
     */
    private function __construct($pdo){
        $this->pdo = $pdo;
    }

    /**
     * MySQLデータベース接続のインスタンスを取得
     * 
     * @param string $host ホスト名
     * @param string $dbName データベース名
     * @param string $user ユーザー名
     * @param string $password パスワード
     * @return PDOHandler PDOHandlerのインスタンス
     * @throws Exception 接続に失敗した場合
     */
    public static function getInstanceMYSQL(string $host, string $dbName, string $user, string $password){
        try {
            $dsn = "mysql:host=$host;dbname=$dbName;charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            return new self($pdo);
        } catch (PDOException $e) {
            throw new Exception('Connection failed: ' . $e->getMessage());
        }
    }

    /**
     * SQLiteデータベース接続のインスタンスを取得
     * 
     * @param string $path SQLiteデータベースファイルのパス
     * @return PDOHandler PDOHandlerのインスタンス
     * @throws Exception 接続に失敗した場合
     */
    public static function getInstanceSQLITE(string $path){
        try {
            $pdo = new PDO("sqlite:$path");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            return new self($pdo);
        } catch (PDOException $e) {
            throw new Exception('Connection failed: ' . $e->getMessage());
        }
    }

    /**
     * インサートIDを取得
    */
    public function getLastInsertId(): ?int {
        return $this->pdo->lastInsertId();
    }

    /**
     * SQLクエリを実行
     * 
     * SELECTクエリの場合は結果を配列で返し、
     * それ以外のクエリ（INSERT, UPDATE, DELETE等）の場合は
     * 影響を受けた行数を返します。
     * 
     * @param string $query 実行するSQLクエリ
     * @param array $arr プリペアドステートメントのパラメータ配列
     * @return array|int SELECTクエリの場合は結果配列、それ以外は影響行数
     * @throws Exception クエリの実行に失敗した場合
     */
    public function executionQuery(string $query, array $arr = []): array|int {
        $transactionStarted = false; // トランザクションが開始されたかどうか
        try {
            $stmt = $this->pdo->prepare($query);
            $stmt->execute($arr);
    
            // 先に fetchAll() でデータを取得
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $isSelectQuery = !empty($result); // 結果があれば SELECT と判断
    
            if (!$isSelectQuery) {
                $result = $stmt->rowCount(); // INSERT/UPDATE/DELETE は影響行数を返す
            }

            $result = $result === 0 ? [] : $result; // 結果が空の場合は空の配列を返す
    
            return $result;
        } catch (PDOException $e) {
            throw new Exception('Query failed: ' . $e->getMessage());
        }
    }
}
?>