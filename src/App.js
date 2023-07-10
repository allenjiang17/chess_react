import logo from './logo.svg';
import './App.css';
import {Board, findPosInArray} from "./chess.js"
import {useState, useEffect} from "react"
let square_size = "2.8rem";
let piece_size = "2.6rem";
let half_square_size = "15px"; //df font size is 16px

let newBoard = new Board()

function App() {

  let [square_clicked, set_square_clicked] = useState([null, null]);
  let [piece_selected, set_piece_selected] = useState(null);
  let [legal_moveset, set_legal_moveset] = useState([]);

  //for display purposes
  let [move_list, set_move_list] = useState([]);
  let [pieces_taken, set_pieces_taken] = useState([]);

  //Main function for determining what to do after user clicks a square
  useEffect(() => {
    let selected_piece = newBoard.pieces[`${square_clicked[0]},${square_clicked[1]}`];

    //if a valid movable piece is selected, show moveset
    if (selected_piece?.color == newBoard.turn) {
      set_legal_moveset(newBoard.generate_moveset_with_check_test(selected_piece));
      set_piece_selected(selected_piece);

    } else {

      //if not, check if square is a possible movement square for an already selected piece
      if (piece_selected != null && findPosInArray(legal_moveset, square_clicked)){

        //record move
        let capture = (newBoard.pieces[square_clicked] != undefined)
        set_move_list(current => [...current, convertMoveToAlgNote(piece_selected, square_clicked, capture)]);
        if (capture) {
          set_pieces_taken(current => [...current, newBoard.pieces[square_clicked]])
        }

        //execute move
        newBoard.change_piece_position(piece_selected.position, square_clicked);

        //check checkmate
        if (newBoard.is_checkmate()){window.alert("Checkmate");}
      }

      set_piece_selected(null);   
      set_legal_moveset([]);  

    }

  }, [square_clicked]);


  //Sets square in state from user click
  function set_square(event) {
    //set current square
    let square_str = event.currentTarget.dataset.squareid;

    let square_nums = square_str.split(",").map(Number);
    set_square_clicked(square_nums);
  }

  return(
    <div>
      <div className="text-xl font-bold m-2">chess</div>
      <div className="min-w-max mx-auto md:flex">
        <DisplayBoard pieces = {newBoard.pieces} 
        click_handler={set_square} 
        current_square={square_clicked}
        move_squares={legal_moveset}
        />
        <div className="p-1 text-md w-full md:w-48 mt-2 md:ml-2 md:mt-0">
            <div className="flex justify-between items-baseline mb-1">
              <p>Moves</p>
              <p className="text-xs">
              {newBoard.turn == "W" ? "White" : "Black"}'s Turn
              </p>
            </div>
          <DisplayMoveList move_list = {move_list}/>
          <DisplayPiecesTaken pieces_taken = {pieces_taken}/>
        </div>
      </div>
    </div>
    )
}

function DisplayBoard(props) {

    //Create Board
    let square = "white";
    let board = []

    for (let i=7;i>=0;i--) {

      //generate black/white squares
      (square == "white") ? square = "black" : square = "white"

      let row = [];

      for (let j=0;j<8;j++) {

        //generate black/white squares
        (square == "white") ? square = "black" : square = "white"

        const display_square = <DisplaySquare key={`${i},${j}`} 
            squareId={`${i},${j}`} 
            color={square} 
            highlight={(props.current_square[0] == i && props.current_square[1] == j)}
            move_square={props.move_squares.some((move) => move[0] === i && move[1] === j)}
            piece={props.pieces[`${i},${j}`]} 
            click_handler={props.click_handler}/>;

        row.push(display_square);
      }

      const row_element = <div key={`row${i}`} style={{display:"block",margin:"0px", padding:"0px", height:square_size}}>{row}</div>
      board.push(row_element)

    }
    return(
      <div>
        {board}
      </div>
    )


}

function DisplaySquare(props) {

    let default_style = {display:"inline-block", height:square_size, width:square_size, margin:"0px", padding:"0px", position:"relative"};

    props.highlight ? default_style.backgroundColor = "yellow" : default_style.backgroundColor = props.color == "white" ? "white" : "gray"

    //only show highlighted moves (indicated with a yellow circle) if the square is part of the moveset
    let move_circle = null;
    if (props.move_square) {move_circle = <DisplayMoveCircle/>}
    return(
        <div data-squareid={props.squareId} onClick={props.click_handler} style={default_style}>
            <DisplayPiece piece = {props.piece}/>
            {move_circle}
      </div>
    )

}

function DisplayPiece(props){

  const unicodeRep = props.piece?.unicode_rep;
  let piece;

  switch (unicodeRep) {
    case '\u2659':
      piece = <img className={`object-contain h-[${piece_size}]`} src="white_pawn.png" alt="White Pawn" />;
      break;
    case '\u265F':
      piece = <img src="black_pawn.png" alt="Black Pawn" />;
      break;

    case '\u2658':
      piece = <img src="white_knight.png" alt="White Knight" />;
      break;
    case '\u265E':
      piece = <img src="black_knight.png" alt="Black Knight" />;
      break;  

    case '\u2654':
      piece = <img src="white_king.png" alt="White King" />;
      break;
    case '\u265A':
      piece = <img src="black_king.png" alt="Black King" />;
      break;

    case "\u2655":
      piece = <img src="white_queen.png" alt="White Queen" />;
      break;
    case "\u265B":
      piece = <img src="black_queen.png" alt="Black Queen" />;
      break;  

    case "\u2657":
      piece = <img src="white_bishop.png" alt="White Bishop" />;
      break;
    case "\u265D":
      piece = <img src="black_bishop.png" alt="Black Bishop" />;
      break;
  
    case "\u2656":
      piece = <img src="white_rook.png" alt="White Rook" />;
      break;
    case "\u265C":
      piece = <img src="black_rook.png" alt="Black Rook" />;
      break;  

    default:
      piece = null; // Default case if no match is found
      break;
  }


  return (<div>{piece}</div>)
}

function DisplayMoveCircle(props){

    return(<div className={`absolute top-4 left-4 z-40 rounded-full h-3 w-3 bg-amber-300`}></div>)
}

function DisplayMoveList(props) {

  let table = [];
  let move_list = JSON.parse(JSON.stringify(props.move_list));

  //pad so list has a black and white move (even number of moves)
  if (move_list.length % 2 != 0) {
    move_list.push(" ");
  }

  for (let i=0; i<move_list.length; i+=2) {
    let curr_row = (<tr key={"Row" + String(i/2+1)} className="text-sm mt-2 w-full flex justify-left items-center font-normal hover:bg-gray-200 dark:hover:bg-gray-600">
      <td className="w-6">{String(i/2+1) + "."}</td>
      <td className="w-8">{move_list[i]}</td>
      <td className="w-8">{move_list[i+1]}</td>
      </tr>)

    table.push(curr_row);

    
  }
  
  return(
    <div className="bg-gray-100 pl-2 overflow-auto h-[40vh] border border-gray-300 dark:bg-gray-800">
    <table className="w-full">
      <tbody>
        {table}
     </tbody>
    </table>
    </div>
  )



}

function DisplayPiecesTaken(props) {

  var white_pieces = "";
  var black_pieces = "";

  for (let piece of props.pieces_taken) {
    if (piece.color === "W") {
      white_pieces = white_pieces + piece.unicode_rep;

    } else {
      black_pieces = black_pieces + piece.unicode_rep;
    }
  }

  return(
    <div>
      <div>
        Captured Pieces
      </div>
      <div className="flex justify-between items-center">
        <div>
          {white_pieces}
        </div>
        <div>
          {black_pieces}
        </div>
      </div>

    </div>


  )
  


}
//TODO: Implement disambiguation when there are multiple pieces of same type that can take the square
function convertMoveToAlgNote(piece, end_pos, capture) {
  let num_to_letter = ["a", "b","c","d","e","f","g","h"]

  let file = num_to_letter[end_pos[1]];
  let rank = end_pos[0] + 1;
  let x;

  capture ? x = "x" : x = ""

  if (piece.name == "Knight") {
    return "N" + x + String(file) + String(rank);
  } else if (piece.name == "Bishop") {
    return "B" + x +  String(file) + String(rank);
  } else if (piece.name == "Rook") {
    return "R" + x + String(file) + String(rank);
  } else if (piece.name == "Queen") {
    return "Q" + x + String(file) + String(rank);
  } else if (piece.name == "King") {
    return "K" + x + String(file) + String(rank);
    
  } else {
    //pawn

    if (capture) {
      return num_to_letter[piece.position[1]] + x + String(file) + String(rank);
    } else {
      return String(file) + String(rank);
    }
  }

}

export default App;
