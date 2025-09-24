import { ShogiUI } from "./shogiUI";
import * as Pieces from "./piece";
export{};

declare global {
    interface Window {
        shogiUIInstance: ShogiUI; // ShogiUIクラスのインスタンスをプロパティとして追加
        
        Air: typeof Pieces.Air; 
        King: typeof Pieces.King; 
        Rook: typeof Pieces.Rook;
        Bishop: typeof Pieces.Bishop;
        Pawn: typeof Pieces.Pawn;
        Lance: typeof Pieces.Lance; 
        Knight: typeof Pieces.Knight; 
        GoldGen: typeof Pieces.GoldGen; 
        SilverGen: typeof Pieces.SilverGen;
    }
    
}
