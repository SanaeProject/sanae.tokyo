/**
 * @author SanaePRJ
 */

/**
 * @description Store Position.
 * @typedef {[number, number]} Position
 * @property {number} 0 - The row position
 * @property {number} 1 - The column position
 */
export type Position = [number, number];

/**
 * @description Directions
 * @enum {number}
 * @readonly
 */
enum Direction {
    /** Upward */
    Up,
    /** Downward */
    Down,
    /** Leftward */
    Left,
    /** Rightward */
    Right
}


/**
 * @description Store board size.
 * @type {number}
 */
export const boardSize:number = 9;

/**
 * @description Used to separate location information by direction.
 * @type {Position}
 */
export const partition:Position = [-1,-1];


/**
 * @class Piece
 * @classdesc Base class for pieces used in shogi.
 *
 * @constructor
 * @param {boolean|undefined} argIsSente - When the game starts, it saves whether the player is playing for the first time or not.
 * @example
 * const instance = new Piece(true);
 */
export abstract class Piece extends Object{
    /**
     * @description When the game starts, it saves whether the player is playing for the first time or not.
     * @readonly
     * @type {boolean|undefined}
     */
    public isSente:boolean | undefined = undefined;

    /**
     * @description Stores what can be promotion.This changes the behavior.
     * @type {boolean}
     */
    public readonly canPromotion:boolean = false;
    protected       isPromoted:boolean = false;
    protected       refusedPromotion:boolean = false;

    /**
     * @constructor
     * 
     * @param {boolean|undefined} argIsSente - When the game starts, it saves whether the player is playing for the first time or not.
     */
    constructor(argIsSente:boolean|undefined)
    {
        super();
        this.isSente = argIsSente;
    }

    /**
     * @function changePromotionStatus
     * 
     * @description Promote a piece.If the object's canPromotion is false, an Error is thrown.
    */
    public changePromotionStatus():void{
        if(!this.canPromotion)
            throw Error("Cant't Promote.");

        this.isPromoted = !this.isPromoted;
    }
    /**
     * @function getDidPromotion
     * 
     * @description Gets whether a piece has been promoted.
    */
    public getIsPromoted():boolean{
        return this.isPromoted;
    }

    /**
     * @function getDidRejectPromotion
     * @description Gets whether the piece refused to be promoted.
     */
    public getRefusedPromotion():boolean{
        return this.refusedPromotion;
    }

    /**
     * @function setRefusePromotion
     * @description Sets the refusal status for promotion of the piece. Throws an error if the piece is already promoted.
     * 
     * @throws {Error} If an attempt is made to refuse promotion when the piece is already promoted.
     * @returns {boolean} The updated `refusedPromotion` status, set to `true`.
     */
    public setRefusePromotion():boolean{
        if(this.isPromoted)
            throw Error("A denied operation is being performed.");

        return this.refusedPromotion=true;
    }

    /**
     * @function getLinearMovePositions
     * @description Gets a position that can be moved a specified number of times in a particular direction from a specified position.
     * 
     * @param {Position} fromRowCol - Current loacation [row, col]
     * @param {number} moveCount - Maximum number of spaces piece can move
     * @param {[Direction, Direction?][]} directions - Array of directions to move
     * @param {boolean | undefined} isSente - First move or not?
     * @returns {Position[]} - Arrangement of movable positions
     * @example
     * const positions = getLinearMovePositions([2, 3], 3, [[Direction.Up], [Direction.Down, Direction.Left]], true);
    */
    protected static getLinearMovePositions(
        [fromRow, fromCol]: Position, 
        moveCount: number, 
        directions: [Direction,Direction?][], 
        isSente: boolean | undefined
    ): Position[] {
        let result: Position[] = [];

        /** Each directions */
        directions.forEach(direc => {
            let [dRow, dCol]:Position = [0, 0];

            /** Apply direction */
            if (direc.includes(Direction.Up  ))  dRow = -1;
            if (direc.includes(Direction.Down))  dRow =  1;
            if (direc.includes(Direction.Left))  dCol = -1;
            if (direc.includes(Direction.Right)) dCol =  1;

            /** When it is at the back, the top and bottom are inverted. */
            if (!isSente && (direc.includes(Direction.Up) || direc.includes(Direction.Down)))
                dRow *= -1;

            /** Determines whether movement is possible within a specified range. */
            for (let i = 1; i <= moveCount; i++) {
                let newCol = fromCol + dCol * i;
                let newRow = fromRow + dRow * i;

                /** If the board is out of bounds, exit the loop. */
                if (newCol < 0 || newCol >= boardSize || newRow < 0 || newRow >= boardSize) 
                    break;

                result.push([newRow, newCol]);
            }

            // Add partion.
            result.push(partition);
        });
        
        return result;
    }

    /**
     * Returns the display character for the piece.
     * This method is meant to be overridden by specific piece classes,
     * allowing each piece to display its unique symbol (e.g., "Pawn").
     * By default, it returns an empty string.
     * 
     * @returns {string} The character representing the piece.
    */
    public toString(): string {
        return "";
    }

    /**
     * Generates an array of all possible move positions for this piece.
     * This abstract method should be overridden by each piece class
     * to define its specific movement pattern.
     * 
     * @param {Position} from - The starting position of the piece as [column, row].
     * @returns {Position[]} Array of positions [column, row] that the piece can legally move to.
    */
    abstract generateMovePositions([fromCol, fromRow]: Position): Position[];
}


/**
 * Represents an empty or placeholder piece on the board.
 * The `Air` class signifies an unoccupied position and is not intended
 * for movement or display. It overrides `generateMovePositions` to prevent
 * any interaction that would be valid for other pieces.
 */
export class Air extends Piece {
    /**
     * Creates an instance of `Air` to represent an empty space on the board.
     * Inherits from `Piece` but does not require a player identifier.
     */
    constructor() {
        super(undefined);
    }

    /**
     * Returns an empty string, indicating that this piece does not have a visual representation.
     * 
     * @returns {string} An empty string, as `Air` has no display character.
     */
    public toString(): string {
        return "";
    }

    /**
     * Throws an error if movement is attempted with `Air`.
     * `Air` pieces cannot move, so this method enforces that restriction.
     * 
     * @param {Position} _ - This parameter is unused but necessary for method signature consistency.
     * @throws {Error} Always throws an error indicating `Air` pieces cannot be moved.
     * @returns {never} This method does not return as it always throws an error.
     */
    generateMovePositions(_: Position): Position[] {
        throw Error("Can't call Air.");
    }
}


/**
 * Represents the King piece in Shogi, which moves one square in any direction.
 */
export class King extends Piece {
    /** Indicates that the King cannot be promoted. */
    public readonly canPromotion: boolean = false;

    /** Returns the display character for the King. */
    public toString(): string {
        return "王";
    }

    /**
     * Generates valid move positions for the King.
     * @param pos - The current position of the King.
     * @returns Array of valid positions for the King.
     */
    generateMovePositions(pos: Position): Position[] {
        return King.getLinearMovePositions(
            pos,
            1,
            [
                [Direction.Up], [Direction.Down], [Direction.Left], [Direction.Right],
                [Direction.Up, Direction.Left], [Direction.Up, Direction.Right],
                [Direction.Down, Direction.Left], [Direction.Down, Direction.Right]
            ],
            this.isSente
        );
    }
}

/**
 * Represents the Rook piece in Shogi, with promotion to "Dragon King" (竜).
 */
export class Rook extends Piece {
    /** Indicates the Rook can be promoted. */
    public readonly canPromotion: boolean = true;

    /** Returns the display character for the Rook or its promoted form. */
    public toString(): string {
        return this.isPromoted ? "竜" : "飛";
    }

    /**
     * Generates valid move positions for the Rook, with additional moves if promoted.
     * @param pos - The current position of the Rook.
     * @returns Array of valid positions for the Rook.
     */
    generateMovePositions(pos: Position): Position[] {
        let result: Position[] = [];

        // Adds diagonal moves if promoted.
        if (this.isPromoted) {
            result.push(
                ...Rook.getLinearMovePositions(
                    pos,
                    1,
                    [
                        [Direction.Up, Direction.Left],
                        [Direction.Up, Direction.Right],
                        [Direction.Down, Direction.Left],
                        [Direction.Down, Direction.Right]
                    ],
                    this.isSente
                )
            );
        }

        // Adds all vertical and horizontal moves.
        result.push(
            ...Rook.getLinearMovePositions(
                pos,
                boardSize,
                [[Direction.Up], [Direction.Down], [Direction.Left], [Direction.Right]],
                this.isSente
            )
        );

        return result;
    }
}

/**
 * Represents the Bishop piece in Shogi, with promotion to "Dragon Horse" (龍).
 */
export class Bishop extends Piece {
    /** Indicates the Bishop can be promoted. */
    public readonly canPromotion: boolean = true;

    /** Returns the display character for the Bishop or its promoted form. */
    public toString(): string {
        return this.isPromoted ? "龍" : "角";
    }

    /**
     * Generates valid move positions for the Bishop, with additional moves if promoted.
     * @param pos - The current position of the Bishop.
     * @returns Array of valid positions for the Bishop.
     */
    generateMovePositions(pos: Position): Position[] {
        let result: Position[] = [];

        // Adds orthogonal moves if promoted.
        if (this.isPromoted) {
            result.push(
                ...Bishop.getLinearMovePositions(
                    pos,
                    1,
                    [[Direction.Up], [Direction.Down], [Direction.Left], [Direction.Right]],
                    this.isSente
                )
            );
        }

        // Adds all diagonal moves.
        result.push(
            ...Bishop.getLinearMovePositions(
                pos,
                boardSize,
                [
                    [Direction.Up, Direction.Left],
                    [Direction.Up, Direction.Right],
                    [Direction.Down, Direction.Left],
                    [Direction.Down, Direction.Right]
                ],
                this.isSente
            )
        );

        return result;
    }
}

/**
 * Represents the Pawn piece in Shogi, with promotion to "Tokin" (と).
 */
export class Pawn extends Piece {
    /** Indicates that the Pawn can be promoted. */
    public readonly canPromotion: boolean = true;

    /** Returns the display character for the Pawn or its promoted form. */
    public toString(): string {
        return this.isPromoted ? "と" : "歩";
    }

    /**
     * Generates valid move positions for the Pawn.
     * @param pos - The current position of the Pawn.
     * @returns Array of valid positions for the Pawn.
     */
    generateMovePositions(pos: Position): Position[] {
        // Moves like Gold if promoted.
        if (this.isPromoted) {
            return GoldGen.goldGenMovePositions(pos, this.isSente);
        }

        // Moves 1 step forward if not promoted.
        return Pawn.getLinearMovePositions(pos, 1, [[Direction.Up]], this.isSente);
    }
}

/**
 * Represents the Lance piece in Shogi, moving any number of squares forward.
 */
export class Lance extends Piece {
    /** Indicates that the Lance can be promoted. */
    public readonly canPromotion: boolean = true;

    /** Returns the display character for the Lance. */
    public toString(): string {
        return "香";
    }

    /**
     * Generates valid move positions for the Lance.
     * @param pos - The current position of the Lance.
     * @returns Array of valid positions for the Lance.
     */
    generateMovePositions(pos: Position): Position[] {
        // Moves like Gold if promoted.
        if (this.isPromoted) {
            return GoldGen.goldGenMovePositions(pos, this.isSente);
        }

        // Moves any number of squares forward if not promoted.
        return Lance.getLinearMovePositions(pos, boardSize, [[Direction.Up]], this.isSente);
    }
}

/**
 * Represents the Knight piece in Shogi, which moves in an "L" shape.
 */
export class Knight extends Piece {
    /** Indicates that the Knight can be promoted. */
    public readonly canPromotion: boolean = true;

    /** Returns the display character for the Knight. */
    public toString(): string {
        return "桂";
    }

    /**
     * Generates valid move positions for the Knight.
     * @param fromPos - The current position of the Knight.
     * @returns Array of valid positions for the Knight.
     */
    generateMovePositions([fromRow, fromCol]: Position): Position[] {
        // Moves like Gold if promoted.
        if (this.isPromoted) return GoldGen.goldGenMovePositions([fromRow, fromCol], this.isSente);

        const forward = 2; // Moves two squares forward
        const side = 1;    // Moves one square sideways

        let result: Position[] = [];
        let Row: number;
        let Col: number;

        // Sente's forward movement.
        if (this.isSente) {
            if ((Row = fromRow - forward) >= 0) {
                if ((Col = fromCol - side) >= 0) result.push([Row, Col]);
                // To keep loading.
                result.push(partition);
                if ((Col = fromCol + side) < boardSize) result.push([Row, Col]);
            }
        }
        // Gote's forward movement.
        else {
            if ((Row = fromRow + forward) < boardSize) {
                if ((Col = fromCol - side) >= 0) result.push([Row, Col]);
                // To keep loading.
                result.push(partition);
                if ((Col = fromCol + side) < boardSize) result.push([Row, Col]);
            }
        }

        return result;
    }
}

/**
 * Represents the Gold General piece in Shogi, which can move in multiple directions.
 */
export class GoldGen extends Piece {
    /** Indicates that the Gold General cannot be promoted. */
    public readonly canPromotion: boolean = false;

    /** Returns the display character for the Gold General. */
    public toString(): string {
        return "金";
    }

    /**
     * Generates valid move positions for the Gold General.
     * @param pos - The current position of the Gold General.
     * @param argIsSente - Indicates if the piece is Sente.
     * @returns Array of valid positions for the Gold General.
     */
    public static goldGenMovePositions(pos: Position, argIsSente: boolean | undefined): Position[] {
        return GoldGen.getLinearMovePositions(
            pos,
            1,
            [
                [Direction.Up], [Direction.Down], [Direction.Left], [Direction.Right],
                [Direction.Up, Direction.Left], [Direction.Up, Direction.Right]
            ],
            argIsSente
        );
    }

    /**
     * Generates valid move positions for the Gold General.
     * @param pos - The current position of the Gold General.
     * @returns Array of valid positions for the Gold General.
     */
    generateMovePositions(pos: Position): Position[] {
        return GoldGen.goldGenMovePositions(pos, this.isSente);
    }
}

/**
 * Represents the Silver General piece in Shogi, which can move diagonally and forward.
 */
export class SilverGen extends Piece {
    /** Indicates that the Silver General can be promoted. */
    public readonly canPromotion: boolean = true;

    /** Returns the display character for the Silver General. */
    public toString(): string {
        return "銀";
    }

    /**
     * Generates valid move positions for the Silver General.
     * @param pos - The current position of the Silver General.
     * @returns Array of valid positions for the Silver General.
     */
    generateMovePositions(pos: Position): Position[] {
        // Moves like Gold if promoted.
        if (this.isPromoted) return GoldGen.goldGenMovePositions(pos, this.isSente);

        return SilverGen.getLinearMovePositions(
            pos,
            1,
            [
                [Direction.Up],
                [Direction.Up, Direction.Left], [Direction.Up, Direction.Right],
                [Direction.Down, Direction.Left], [Direction.Down, Direction.Right]
            ],
            this.isSente
        );
    }
}