/**
 * @author SanaePRJ
 */

import * as Pieces from "./piece.js";

/**
 * @class Board
 * @classdesc Represents the Shogi board, including pieces, turns, and movement logic.
 */ 
export class Board {
    /**
     * @description 2D array representing the board, initialized with Air pieces.
     * @type {Pieces.Piece}
     */
    matrix: Pieces.Piece[][] = Array.from({ length: Pieces.boardSize }, () => Array(Pieces.boardSize).fill(new Pieces.Air()));

    /**
     * @description Array of pieces captured by the Sente player.
     * @type {Pieces.Piece}
     */
    senteCapturedPieces: Pieces.Piece[] = [];

    /**
     * @description Array of pieces captured by the Gote player.
     * @type {Pieces.Piece}
     */
    goteCapturedPieces: Pieces.Piece[] = [];

    /**
     * @description Indicates whose turn it is (true for Sente, false for Gote).
     * @type {boolean}
     */
    isSenteTurn: boolean = true;

    /**
     * @description A function that queries whether
     * @type {boolean} is allowed.
     */
    isPromotionAllowed:()=>boolean = ()=>{return confirm("成りますか?");};

    /**
     * @function defaultSet
     * @description Sets the default initial positions of all pieces on the board.
     *
     * @param {void}
     * @returns {void}
     */
    defaultSet(): void {
        this.crearSet();

        // Place Gote pieces
        this.matrix[0][0] = new Pieces.Lance(false);
        this.matrix[0][1] = new Pieces.Knight(false);
        this.matrix[0][2] = new Pieces.SilverGen(false);
        this.matrix[0][3] = new Pieces.GoldGen(false);
        this.matrix[0][4] = new Pieces.King(false);
        this.matrix[0][5] = new Pieces.GoldGen(false);
        this.matrix[0][6] = new Pieces.SilverGen(false);
        this.matrix[0][7] = new Pieces.Knight(false);
        this.matrix[0][8] = new Pieces.Lance(false);
        this.matrix[1][1] = new Pieces.Rook(false);
        this.matrix[1][7] = new Pieces.Bishop(false);
        
        // Place Gote pawns
        for (let i = 0; i < Pieces.boardSize; i++)
            this.matrix[2][i] = new Pieces.Pawn(false);
        
        // Place Sente pieces
        this.matrix[8][0] = new Pieces.Lance(true);
        this.matrix[8][1] = new Pieces.Knight(true);
        this.matrix[8][2] = new Pieces.SilverGen(true);
        this.matrix[8][3] = new Pieces.GoldGen(true);
        this.matrix[8][4] = new Pieces.King(true);
        this.matrix[8][5] = new Pieces.GoldGen(true);
        this.matrix[8][6] = new Pieces.SilverGen(true);
        this.matrix[8][7] = new Pieces.Knight(true);
        this.matrix[8][8] = new Pieces.Lance(true);
        this.matrix[7][7] = new Pieces.Rook(true);
        this.matrix[7][1] = new Pieces.Bishop(true);
        
        // Place Sente pawns
        for (let i = 0; i < Pieces.boardSize; i++)
            this.matrix[6][i] = new Pieces.Pawn(true);
    }
    crearSet(){
        this.matrix.forEach(row=>{
            row.fill(new Pieces.Air());
        });
    }

    /**
     * @function move
     * @description Moves a piece from one position to another.
     * 
     * @param {Pieces.Piece} from - The starting position of the piece.
     * @param {Pieces.Piece} to - The target position to move the piece.
     * @returns True if the move is successful, false otherwise.
     */
    move([fromRow, fromCol]: Pieces.Position, [toRow, toCol]: Pieces.Position): boolean {
        // Check if the piece belongs to the current player
        if (this.matrix[fromRow][fromCol].isSente !== this.isSenteTurn) {
            console.log("I tried to move a piece that wasn't my own");
            return false;
        }

        // Check if the move attempts to capture the player's own piece
        if (this.matrix[toRow][toCol].isSente === this.isSenteTurn) {
            console.log("He's trying to take his piece.");
            return false;
        }

        // Get valid move positions
        let canPutPositions: Pieces.Position[] = this.matrix[fromRow][fromCol].generateMovePositions([fromRow, fromCol]);
        
        // Check if the target position is valid
        let putIndex: number = canPutPositions.findIndex(([row, col]) => row === toRow && col === toCol);
        
        // Check if the target position is in the valid move positions
        if (putIndex == -1) {
            console.log(`There is no place to put it.${toRow},${toCol}`);

            // Display all valid move positions
            canPutPositions.forEach(pos => {
                console.log(`{${pos[0]},${pos[1]}}`);
            });

            return false;
        }

        // Check if there are pieces blocking the way
        for (let pos: number = putIndex - 1; pos >= 0; pos--) {
            let [row, col]: Pieces.Position = canPutPositions[pos];

            // Check for a partition piece
            if (row == Pieces.partition[0] && col == Pieces.partition[1]) break;

            // Check for owned pieces blocking the path
            if (this.matrix[row][col].isSente !== undefined) {
                console.log(`If there is a piece with ownership set along the way, it cannot be placed.${this.matrix[row][col].isSente};`);
                canPutPositions.forEach(pos => {
                    console.log(`{${pos[0]},${pos[1]}}`);
                });
                return false;
            }
        }

        // Capture the piece if there is one
        if (this.matrix[toRow][toCol].isSente !== undefined) {
            // Change owner
            this.matrix[toRow][toCol].isSente = this.isSenteTurn;
            
            // unPromote
            if(this.matrix[toRow][toCol].getIsPromoted())
                this.matrix[toRow][toCol].changePromotionStatus();

            if (this.isSenteTurn) 
                this.senteCapturedPieces.push(this.matrix[toRow][toCol]);
            else
                this.goteCapturedPieces.push(this.matrix[toRow][toCol]);
        }

        // Move the piece
        this.matrix[toRow][toCol] = this.matrix[fromRow][fromCol];
        this.matrix[fromRow][fromCol] = new Pieces.Air();

        let notOutOfRange = (this.isSenteTurn && toRow < 3) || (!this.isSenteTurn && toRow > 5);
        let piece:Pieces.Piece = this.matrix[toRow][toCol];

        // can set Promotion
        if(notOutOfRange && piece.canPromotion && !piece.getIsPromoted() && !piece.getRefusedPromotion()){
            if(this.isPromotionAllowed())
                piece.changePromotionStatus();
            else
                piece.setRefusePromotion();
        }

        return true;
    }

    /**
     * @function moveCapturedPiece
     * @description Moves a captured piece from the player's captured pieces array to a specified position on the board.
     * Validates that the move is legal, ensuring the destination is unoccupied and follows pawn placement rules.
     *
     * @param {number} capturedIndex - The index of the captured piece in the captured pieces array.
     * @param {Pieces.Position} position - The position ([row, col]) where the piece is to be placed on the board.
     * @returns {boolean} - Returns `true` if the piece was successfully placed on the board; otherwise, returns `false`.
     *
     * @throws {Error} - Throws an error if any operation violates game rules.
     */
    public moveCapturedPiece(capturedIndex:number,[row,col]:Pieces.Position):boolean{
        let capturedPieces:Pieces.Piece[] = this.isSenteTurn ? this.senteCapturedPieces:this.goteCapturedPieces;
        
        // Out of range.
        if(capturedPieces.length<=capturedIndex)
            return false;

        // Placement destination is blank
        if(this.matrix[row][col].isSente!==undefined)
            return false;
        
        // There may not be a pawn in the pawn's destination row.
        if (capturedPieces[capturedIndex].toString() === "歩") {
            let pawnExistsInColumn = this.matrix.some(row => 
                row[col].isSente === this.isSenteTurn && (row[col].toString() === "歩" || row[col].toString() === "と")
            );
        
            if (pawnExistsInColumn)
                return false;
        }

        // Success
        this.matrix[row][col] = capturedPieces[capturedIndex];
        capturedPieces.splice(capturedIndex,1);

        return true;
    }

    /**
     * @function goNext
     * @description Change turn.
     * @returns The current turn.
     */
    public goNext():boolean{
        return this.isSenteTurn = !this.isSenteTurn;// Change turn  
    }
}