import {cloneDeep} from 'lodash'

export class Board {
    constructor() {
      this.w_king_location = [0, 4]; // needs to be specially recorded for checking check
      this.b_king_location = [7, 4];
      this.w_king_check = false;
      this.b_king_check = false;
      this.w_can_castle = true; //if rook or king moves, this is set to false
      this.b_can_castle = true; //if rook or king moves, this is set to false
      this.turn = "W";
  
      this.pieces = {
        "0,0": new Rook("W", [0, 0]),
        "0,1": new Knight("W", [0, 1]),
        "0,2": new Bishop("W", [0, 2]),
        "0,3": new Queen("W", [0, 3]),
        "0,4": new King("W", [0, 4]),
        "0,5": new Bishop("W", [0, 5]),
        "0,6": new Knight("W", [0, 6]),
        "0,7": new Rook("W", [0, 7]),
  
        "1,0": new Pawn("W", [1, 0]),
        "1,1": new Pawn("W", [1, 1]),
        "1,2": new Pawn("W", [1, 2]),
        "1,3": new Pawn("W", [1, 3]),
        "1,4": new Pawn("W", [1, 4]),
        "1,5": new Pawn("W", [1, 5]),
        "1,6": new Pawn("W", [1, 6]),
        "1,7": new Pawn("W", [1, 7]),
  
        "7,0": new Rook("B", [7, 0]),
        "7,1": new Knight("B", [7, 1]),
        "7,2": new Bishop("B", [7, 2]),
        "7,3": new Queen("B", [7, 3]),
        "7,4": new King("B", [7, 4]),
        "7,5": new Bishop("B", [7, 5]),
        "7,6": new Knight("B", [7, 6]),
        "7,7": new Rook("B", [7, 7]),
  
        "6,0": new Pawn("B", [6, 0]),
        "6,1": new Pawn("B", [6, 1]),
        "6,2": new Pawn("B", [6, 2]),
        "6,3": new Pawn("B", [6, 3]),
        "6,4": new Pawn("B", [6, 4]),
        "6,5": new Pawn("B", [6, 5]),
        "6,6": new Pawn("B", [6, 6]),
        "6,7": new Pawn("B", [6, 7]),
      };
    }

    //Moves piece from start position to end position WITHOUT any checking. Use in conjunction with generate_moveset/with check to ensure move is legal
    change_piece_position(start_pos, end_pos) {
        let piece = this.pieces[start_pos];
      
        // move the piece (change key in dictionary, change internal position state, refresh moves)
        this.pieces[end_pos] = piece;
        delete this.pieces[start_pos];
      
        piece.set_position(end_pos);

        // if piece is king
        if (piece.unicode_rep === "\u2654") {
          //update king position when it is moved
          this.w_king_location = end_pos;

          //check if king is making a special castle move, which is hard coded and does not change
          if (start_pos[0] == 0 && start_pos[1] == 4 && end_pos[0] == 0 && end_pos[1] == 6) {
            let rook = this.pieces[[0,7]]
            this.pieces[[0,5]] = rook;
            delete this.pieces[[0,7]];

            rook.set_position([0,5]);

            //queenside castle
          } else if (start_pos[0] == 0 && start_pos[1] == 4 && end_pos[0] == 0 && end_pos[1] == 2) {
            let rook = this.pieces[[0,0]]
            this.pieces[[0,3]] = rook;
            delete this.pieces[[0,0]];

            rook.set_position([0,3]);
          }

        } else if (piece.unicode_rep === "\u265A") {

          //update king position
          this.b_king_location = end_pos;

          //check if king is making a special castle move, which is hard coded and does not change
          if (start_pos[0] == 7 && start_pos[1] == 4 && end_pos[0] == 7 && end_pos[1] == 6) {
            let rook = this.pieces[[7,7]]
            this.pieces[[7,5]] = rook;
            delete this.pieces[[7,7]];

            rook.set_position([7,5]);

            //queenside castle
          } else if (start_pos[0] == 7 && start_pos[1] == 4 && end_pos[0] == 7 && end_pos[1] == 2) {
            let rook = this.pieces[[7,0]]
            this.pieces[[7,3]] = rook;
            delete this.pieces[[7,0]];

            rook.set_position([7,3]);
          }
        }

        // update check status
        this.is_check();

        // update castle status
        if (piece.unicode_rep === "\u2654" || piece.unicode_rep === "\u2656") {
          this.w_can_castle = false;
        } else if (piece.unicode_rep === "\u265A" || piece.unicode_rep === "\u265C") {
          this.b_can_castle = false;
        }
      
        // update turn
        if (this.turn === "W") {
          this.turn = "B";
          //console.log("Black's Turn Now");
        } else {
          this.turn = "W";
          //console.log("White's Turn Now");
        }
      
        return;
      }

    //old, deprecated. Use generate_moveset/generate_moveset_with_check to find legal moves and change_piece_position to move
    move_piece(start_pos, end_pos) {

      let piece = this.pieces[start_pos];

      if (piece == undefined) {         
        console.log("No piece at that location");
        return false;
      }
  
      // 1. Check if the piece is a pawn. In that case, special rules that they can take diagonally
      if (piece.unicode_rep === "\u2659") {
        // Try specifically the edge case where the piece selected is a pawn and it is taking diagonally
          let pawn_target = this.pieces[end_pos];

          if (pawn_target != undefined) {

            if (
              pawn_target.color === "B" &&
              end_pos[0] === start_pos[0] + 1 &&
              (end_pos[1] === start_pos[1] + 1 || end_pos[1] === start_pos[1] - 1)
            ) {
              // Move the piece (change key in dictionary, change internal position state, refresh moves)
              this.pieces[end_pos] = piece;
              delete this.pieces[start_pos];
    
              piece.set_position(end_pos); // Change to using change_piece_position
    
              return true;
            }

          }

      } else if (piece.unicode_rep === "\u265F") {
        // Same for the other color pawn
        let pawn_target = this.pieces[end_pos];

        if (pawn_target != undefined ) {
          if (
            pawn_target.color === "W" &&
            end_pos[0] === start_pos[0] - 1 &&
            (end_pos[1] === start_pos[1] + 1 || end_pos[1] === start_pos[1] - 1)
          ) {
            // Move the piece (change key in dictionary, change internal position state, refresh moves)
            this.pieces[end_pos] = piece;
            delete this.pieces[start_pos];
  
            piece.set_position(end_pos);
  
            return true;
          }
        } 
      }
  
      // 2. Normal flow for the rest of the pieces
      // Check if the end position is within the piece's naive moveset
      if (!findPosInArray(piece.naive_moves, end_pos)) {
        console.log("Not a legal move");
        return false;
      }
  
      // Check if there are any blocking pieces
      for (let pos of piece.moves_to_position(end_pos)) {

        if (this.pieces[pos] != undefined) {
          // If found, invalid position
          console.log("Not a legal move: piece blocking");
          return false;
        }
      }
  
      // Check if there is a current piece at the target location. If so, check if it is an enemy piece (piece takes). If not, return an invalid move for blocking.

      let target = this.pieces[end_pos];
      
      if (target != undefined) {

        if (target.color === piece.color) {
          console.log("Not a legal move: piece blocking");
          return false;

        } else {
          //Legal move: Piece takes opposing color piece
          console.log(piece.unicode_rep + " takes " + target.unicode_rep);
        }
      } 
  
      // If none of the previous checks have failed, then move the piece
      console.log("Moving Piece Successfully");
      this.change_piece_position(start_pos, end_pos);
      return true;

    }

    print_board() {
      for (let rank = 7; rank >= 0; rank--) {
        let line = "";
        for (let file = 0; file < 8; file++) {
            let piece = this.pieces[`${rank},${file}`];

            (piece != undefined) ? line += piece.unicode_rep + " " : line += "_  ";
        }
        console.log(line + (rank + 1));
      }
    
      console.log("a  b  c  d  e  f  g  h");
    }
    
    //Takes a piece's naive moveset (legal moves only regarding position on board) and factors into other pieces that are blocking or can be taken
    generate_moveset(piece) {
      let moveset = [];
          
      // Generate moveset normally
      for (let end_pos of piece.naive_moves) {

        let end_pos_invalid = false;
    
        // Check for blocking pieces on the way
        for (let pos of piece.moves_to_position(end_pos)) {

            if(this.pieces[pos] != undefined) {
              end_pos_invalid = true;
            } 
        }

        // Check end position, only invalid if blocked by same color piece (can't take)
        if (this.pieces[end_pos]?.color == piece.color) {end_pos_invalid = true}
              
        //if checks are all passed, add to valid moveset
        if (!end_pos_invalid) {
          moveset.push(end_pos);
        }
      }
    
      // For pawn, add taking move if enemy piece is on diagonal
      if (piece.unicode_rep === "\u2659") {

        //if piece exists that pawn can take and it's the opposite color
        if (this.pieces[`${piece.position[0] + 1},${piece.position[1] + 1}`]?.color === "B") {
          moveset.push([piece.position[0] + 1, piece.position[1] + 1]);
        }

        if (this.pieces[`${piece.position[0] + 1},${piece.position[1] - 1}`]?.color === "B") {
          moveset.push([piece.position[0] + 1, piece.position[1] - 1]);
        }

      } else if (piece.unicode_rep === '\u265F'){

        //if piece exists that pawn can take and it's the opposite color
        if (this.pieces[`${piece.position[0] - 1},${piece.position[1] + 1}`]?.color === "W") {
          moveset.push([piece.position[0] - 1, piece.position[1] + 1]);
        }

        if (this.pieces[`${piece.position[0] - 1},${piece.position[1] - 1}`]?.color === "W") {
          moveset.push([piece.position[0] - 1, piece.position[1] - 1]);
        }

      }

      return moveset;
    }

    is_check() {

      this.b_king_check = false;
      this.w_king_check = false;

      for (let piece of Object.values(this.pieces)) {

        if (piece.color === "W") {
          if (findPosInArray(this.generate_moveset(piece), this.b_king_location)) {
            console.log("Black King in check");
            this.b_king_check = true;
          } 
        } else {
          if (findPosInArray(this.generate_moveset(piece), this.w_king_location)) {
            console.log("White King in check");
            this.w_king_check = true;
          } 
        }
      }
    }

    move_check(start_pos, end_pos) {
    
      let temp_board = cloneDeep(this);
      temp_board.change_piece_position(start_pos, end_pos);
    
      if (
        (temp_board.turn === "B" && temp_board.w_king_check) ||
        (temp_board.turn === "W" && temp_board.b_king_check)
      ) {
        return false;
      } else {

        return true;
      }
    }

    generate_moveset_with_check_test(piece) {
      let moveset = this.generate_moveset(piece);

      //add castling moves
      moveset = moveset.concat(this.add_castling_move(piece));

      //remove any moves that cause king to be checked
      let remove_moves = [];
    
      for (let move of moveset) {
        console.log("h:" + move)

        //TODO: make this more specifc, only remove if piece causes its own king to be checked
        if (!this.move_check(piece.position, move)) {
          console.log(move, "removed");
          remove_moves.push(move);
        }
      }
    
      for (let remove of remove_moves) {
        moveset.splice(moveset.indexOf(remove), 1);
      }
    
      return moveset;
    }

    is_checkmate() {
      if (this.w_king_check) {
        let white_pieces = Object.values(this.pieces).filter(piece => piece.color == "W");
        for (let piece of white_pieces) {
          if (this.generate_moveset_with_check_test(piece).length != 0) {
            console.log("Piece has move, no checkmate")
            return false;
          }
        }

        return true;

      } else if (this.b_king_check) {

        let black_pieces = Object.values(this.pieces).filter(piece => piece.color == "B");
        for (let piece of black_pieces) {
          if (this.generate_moveset_with_check_test(piece).length != 0) {
            console.log("Piece has move, no checkmate")
            return false;
          }
        }

        return true;

      } else {
        return false;
      }
      
    }


    add_castling_move(piece) {

      let moveset = [];
      //1. Castle (special move for king)
      //preliminary check -- king is selected and king/rook have not moved yet
      if (piece.unicode_rep === "\u2654" && this.w_can_castle)  {

        //Check for opposite color pieces attacking squares where king is moving to castle
        let kingside_castle_check = true;
        let queenside_castle_check = true;

        for (let black_piece of Object.values(this.pieces).filter(piece => piece.color === "B")) {

          console.log(black_piece);
          console.log(black_piece.naive_moves);
          let black_piece_moveset = this.generate_moveset(black_piece);

          //kingside castle
          if (findPosInArray(black_piece_moveset, [0, 4]) || 
          findPosInArray(black_piece_moveset, [0, 5]) ||
          findPosInArray(black_piece_moveset, [0, 6])) {
            kingside_castle_check = false;
          }

          //queenside castle
          if (findPosInArray(black_piece_moveset, [0, 4]) || 
          findPosInArray(black_piece_moveset, [0, 3]) ||
          findPosInArray(black_piece_moveset, [0, 2])) {
            queenside_castle_check = false;
          }
        }

        //Kingside Castle
        //check if there are no pieces in between
        if (!this.pieces[[0,5]] && !this.pieces[[0,6]] && kingside_castle_check) {
          moveset.push([piece.position[0], piece.position[1]+2])
        } 
        
        //Queenside Castle
        if (!this.pieces[[0,3]] && !this.pieces[[0,2]] && !this.pieces[[0,1]] && queenside_castle_check) {
          moveset.push([piece.position[0], piece.position[1]-2])
        }

      } else if (piece.unicode_rep === '\u265A' && this.b_can_castle) {

        //Check for opposite color pieces attacking squares where king is moving to castle
        let kingside_castle_check = true;
        let queenside_castle_check = true;

        for (let white_piece of Object.values(this.pieces).filter(piece => piece.color === "W")) {

          let white_piece_moveset = this.generate_moveset(white_piece);

          //kingside castle
          if (findPosInArray(white_piece_moveset, [7, 4]) || 
          findPosInArray(white_piece_moveset, [7, 5]) ||
          findPosInArray(white_piece_moveset, [7, 6])) {
            kingside_castle_check = false;
          }

          //queenside castle
          if (findPosInArray(white_piece_moveset, [7, 4]) || 
          findPosInArray(white_piece_moveset, [7, 3]) ||
          findPosInArray(white_piece_moveset, [7, 2])) {
            queenside_castle_check = false;
          }
        }
        //Kingside Castle
        if (!this.pieces[[7,5]] && !this.pieces[[7,6]] && kingside_castle_check) {
          moveset.push([piece.position[0], piece.position[1]+2])
        }
        
        if (!this.pieces[[7,3]] && !this.pieces[[7,2]] && !this.pieces[[7,1]] && queenside_castle_check) {
          moveset.push([piece.position[0], piece.position[1]-2])
        }
      }

      return moveset
    }


  }


class Piece {
    constructor(color, position) {
      this.color = color;
      this.position = position;
      this.naive_moves = [];
    }
  
    print_moves() {
      console.log(this.naive_moves);
    }
  }

class Rook extends Piece {
    constructor(color, position) {
      super(color, position);
      if (color === "W") {
        this.unicode_rep = "\u2656";
      } else {
        this.unicode_rep = "\u265C";
      }
      this.name = "Rook";
      this.refresh_moves();
    }
  
    set_position(position) {
      this.position = position;
      this.refresh_moves();
    }
  
    refresh_moves() {
      this.naive_moves = [];
      for (let i = 0; i < 8; i++) {
        this.naive_moves.push([this.position[0], i]);
      }
      for (let i = 0; i < 8; i++) {
        this.naive_moves.push([i, this.position[1]]);
      }
    }
  
    moves_to_position(position) {
      const moves = [];
      const diff_rank = position[0] - this.position[0];
      const diff_file = position[1] - this.position[1];
  
      if (diff_rank !== 0 && diff_file === 0) {
        if (diff_rank > 0) {
          for (let i = 1; i < diff_rank; i++) {
            moves.push([this.position[0] + i, this.position[1]]);
          }
        } else {
          for (let i = 1; i < Math.abs(diff_rank); i++) {
            moves.push([this.position[0] - i, this.position[1]]);
          }
        }
      } else if (diff_rank === 0 && diff_file !== 0) {
        if (diff_file > 0) {
          for (let i = 1; i < diff_file; i++) {
            moves.push([this.position[0], this.position[1] + i]);
          }
        } else {
          for (let i = 1; i < Math.abs(diff_file); i++) {
            moves.push([this.position[0], this.position[1] - i]);
          }
        }
      }
  
      return moves;
    }
  }


class Bishop extends Piece {
    constructor(color, position) {
      super(color, position);
      if (color === "W") {
        this.unicode_rep = "\u2657";
      } else {
        this.unicode_rep = "\u265D";
      }
      this.name="Bishop";
      this.refresh_moves();
    }
  
    set_position(position) {
      this.position = position;
      this.refresh_moves();
    }
  
    refresh_moves() {
      this.naive_moves = [];
  
      for (let i = 0; i < 8; i++) {
        if (this.position[0] + i < 8 && this.position[1] + i < 8) {
          this.naive_moves.push([this.position[0] + i, this.position[1] + i]);
        } else {
          break;
        }
      }
  
      for (let i = 0; i < 8; i++) {
        if (this.position[0] - i >= 0 && this.position[1] - i >= 0) {
          this.naive_moves.push([this.position[0] - i, this.position[1] - i]);
        } else {
          break;
        }
      }
  
      for (let i = 0; i < 8; i++) {
        if (this.position[0] + i < 8 && this.position[1] - i >= 0) {
          this.naive_moves.push([this.position[0] + i, this.position[1] - i]);
        } else {
          break;
        }
      }
  
      for (let i = 0; i < 8; i++) {
        if (this.position[0] - i >= 0 && this.position[1] + i < 8) {
          this.naive_moves.push([this.position[0] - i, this.position[1] + i]);
        } else {
          break;
        }
      }
    }
  
    moves_to_position(position) {
      const moves = [];
      const diff_rank = position[0] - this.position[0];
      const diff_file = position[1] - this.position[1];
  
      // Sanity check
      if (Math.abs(diff_rank) !== Math.abs(diff_file)) {
        console.log("Error in bishop moves_to_position method -- invalid position given");
      }
  
      if (diff_rank > 0 && diff_file > 0) {
        for (let i = 1; i < diff_rank; i++) {
          moves.push([this.position[0] + i, this.position[1] + i]);
        }
      }
  
      if (diff_rank < 0 && diff_file < 0) {
        for (let i = 1; i < Math.abs(diff_rank); i++) {
          moves.push([this.position[0] - i, this.position[1] - i]);
        }
      }
  
      if (diff_rank > 0 && diff_file < 0) {
        for (let i = 1; i < diff_rank; i++) {
          moves.push([this.position[0] + i, this.position[1] - i]);
        }
      }
  
      if (diff_rank < 0 && diff_file > 0) {
        for (let i = 1; i < Math.abs(diff_rank); i++) {
          moves.push([this.position[0] - i, this.position[1] + i]);
        }
      }
  
      return moves;
    }
  }
  

class Queen extends Piece {
    constructor(color, position) {
      super(color, position);
      if (color === "W") {
        this.unicode_rep = "\u2655";
      } else {
        this.unicode_rep = "\u265B";
      }
      this.name = "Queen";
      this.refresh_moves();
    }
  
    set_position(position) {
      this.position = position;
      this.refresh_moves();
    }
  
    refresh_moves() {
      this.naive_moves = [];
  
      // Queen = Rook moveset + Bishop moveset
      for (let i = 0; i < 8; i++) {
        this.naive_moves.push([this.position[0], i]);
      }
  
      for (let i = 0; i < 8; i++) {
        this.naive_moves.push([i, this.position[1]]);
      }
  
      for (let i = 0; i < 8; i++) {
        if (this.position[0] + i < 8 && this.position[1] + i < 8) {
          this.naive_moves.push([this.position[0] + i, this.position[1] + i]);
        } else {
          break;
        }
      }
  
      for (let i = 0; i < 8; i++) {
        if (this.position[0] - i >= 0 && this.position[1] - i >= 0) {
          this.naive_moves.push([this.position[0] - i, this.position[1] - i]);
        } else {
          break;
        }
      }
  
      for (let i = 0; i < 8; i++) {
        if (this.position[0] + i < 8 && this.position[1] - i >= 0) {
          this.naive_moves.push([this.position[0] + i, this.position[1] - i]);
        } else {
          break;
        }
      }
  
      for (let i = 0; i < 8; i++) {
        if (this.position[0] - i >= 0 && this.position[1] + i < 8) {
          this.naive_moves.push([this.position[0] - i, this.position[1] + i]);
        } else {
          break;
        }
      }
    }

    moves_to_position(position) {
        const moves = [];
        const diff_rank = position[0] - this.position[0];
        const diff_file = position[1] - this.position[1];
      
        // Check if rook type move or bishop type move, then use same code as rook/bishop
        if (diff_rank === 0 || diff_file === 0) {
          if (diff_rank !== 0) {
            if (diff_rank > 0) {
              for (let i = 1; i < diff_rank; i++) {
                moves.push([this.position[0] + i, this.position[1]]);
              }
            } else {
              for (let i = 1; i < Math.abs(diff_rank); i++) {
                moves.push([this.position[0] - i, this.position[1]]);
              }
            }
          } else {
            if (diff_file > 0) {
              for (let i = 1; i < diff_file; i++) {
                moves.push([this.position[0], this.position[1] + i]);
              }
            } else {
              for (let i = 1; i < Math.abs(diff_file); i++) {
                moves.push([this.position[0], this.position[1] - i]);
              }
            }
          }
        } else {
          if (diff_rank > 0 && diff_file > 0) {
            for (let i = 1; i < diff_rank; i++) {
              moves.push([this.position[0] + i, this.position[1] + i]);
            }
          }
      
          if (diff_rank < 0 && diff_file < 0) {
            for (let i = 1; i < Math.abs(diff_rank); i++) {
              moves.push([this.position[0] - i, this.position[1] - i]);
            }
          }
      
          if (diff_rank > 0 && diff_file < 0) {
            for (let i = 1; i < diff_rank; i++) {
              moves.push([this.position[0] + i, this.position[1] - i]);
            }
          }
      
          if (diff_rank < 0 && diff_file > 0) {
            for (let i = 1; i < Math.abs(diff_rank); i++) {
              moves.push([this.position[0] - i, this.position[1] + i]);
            }
          }
        }
      
        return moves;
      }

    }
    
class Knight extends Piece {
    constructor(color, position) {
        super(color, position);
        if (color === "W") {
        this.unicode_rep = '\u2658';
        } else {
        this.unicode_rep = '\u265E';
        }

        this.name = "Knight";
        this.refresh_moves();
    }
    
    set_position(position) {
        this.position = position;
        this.refresh_moves();
    }
    
    refresh_moves() {
        this.naive_moves = [];
    
        if (this.position[0] + 2 < 8) {
        if (this.position[1] + 1 < 8) {
            this.naive_moves.push([this.position[0] + 2, this.position[1] + 1]);
        }
    
        if (this.position[1] - 1 >= 0) {
            this.naive_moves.push([this.position[0] + 2, this.position[1] - 1]);
        }
        }
    
        if (this.position[0] - 2 >= 0) {
        if (this.position[1] + 1 < 8) {
            this.naive_moves.push([this.position[0] - 2, this.position[1] + 1]);
        }
    
        if (this.position[1] - 1 >= 0) {
            this.naive_moves.push([this.position[0] - 2, this.position[1] - 1]);
        }
        }
    
        if (this.position[1] + 2 < 8) {
        if (this.position[0] + 1 < 8) {
            this.naive_moves.push([this.position[0] + 1, this.position[1] + 2]);
        }
    
        if (this.position[0] - 1 >= 0) {
            this.naive_moves.push([this.position[0] - 1, this.position[1] + 2]);
        }
        }
    
        if (this.position[1] - 2 >= 0) {
        if (this.position[0] + 1 < 8) {
            this.naive_moves.push([this.position[0] + 1, this.position[1] - 2]);
        }
    
        if (this.position[0] - 1 >= 0) {
            this.naive_moves.push([this.position[0] - 1, this.position[1] - 2]);
        }
        }
    }
    
    moves_to_position(position) {
        // Knight can't be blocked, no intermediary positions from knight to end position
        return [];
    }
    }

class Pawn extends Piece {
    constructor(color, position) {
        super(color, position);
        if (color === "W") {
        this.unicode_rep = '\u2659';
        } else {
        this.unicode_rep = '\u265F';
        }
        this.name = "Pawn";
        this.refresh_moves();
    }
    
    set_position(position) {
        this.position = position;
        this.refresh_moves();
    }
    
    refresh_moves() {
        this.naive_moves = [];
    
        if (this.color === "W") {
          if (this.position[0] === 1) {
              this.naive_moves.push([this.position[0] + 1, this.position[1]]);
              this.naive_moves.push([this.position[0] + 2, this.position[1]]);
          } else {
              this.naive_moves.push([this.position[0] + 1, this.position[1]]);
          }
        } else {
          if (this.position[0] === 6) {
              this.naive_moves.push([this.position[0] - 1, this.position[1]]);
              this.naive_moves.push([this.position[0] - 2, this.position[1]]);
          } else {
              this.naive_moves.push([this.position[0] - 1, this.position[1]]);
          }
        }
    }
    
    moves_to_position(position) {
        const moves = [];
        const diff_rank = position[0] - this.position[0]; //either 1 or 2
    
        // Pawn is different from other pieces -- it can't take by moving in its normal range. Therefore include end point in block check
        if (diff_rank > 0) {
        for (let i = 1; i <= diff_rank; i++) {
            moves.push([this.position[0] + i, this.position[1]]);
        }
        } else {
        for (let i = 1; i <= Math.abs(diff_rank); i++) {
            moves.push([this.position[0] - i, this.position[1]]);
        }
        }
    
        return moves;
    }
}

class King extends Piece {
    constructor(color, position) {
      super(color, position);
      if (color === "W") {
        this.unicode_rep = '\u2654';
      } else {
        this.unicode_rep = '\u265A';
      }
      this.name = "King";
      this.refresh_moves();
    }
  
    set_position(position) {
      this.position = position;
      this.refresh_moves();
    }
  
    refresh_moves() {
      this.naive_moves = [];
  
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (
            this.position[0] + i < 8 &&
            this.position[0] + i >= 0 &&
            this.position[1] + j < 8 &&
            this.position[1] + j >= 0
          ) {
            this.naive_moves.push([this.position[0] + i, this.position[1] + j]);
          }
        }
      }
    }
  
    moves_to_position(position) {
      return [];
    }
  }
  

//Helper function for determining if a chess position is in an array of positions
export function findPosInArray(my_array, pos) {
  
  return my_array.some((move) => move[0] === pos[0] && move[1] === pos[1])

}

      
      


