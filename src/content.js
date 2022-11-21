/**
 * Content component
 */
 import React from 'react';
 export default class Footer extends React.Component {
         render() {
             return (
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <h2>How to play</h2>
                            <p>Click on a square to reveal what is underneath. If you click on a mine, you lose. If you click on a number, it will tell you how many mines are in the surrounding squares. Use this information to deduce which squares are safe to click. If you click on a square with no surrounding mines, all surrounding squares will automatically be revealed. If you reveal all squares that are not mines, you win!</p>
                        </div>
                        <div className="col">
                            <h2>Controls</h2>
                            <p>Left click to reveal a square. Right click or Long Press to flag a square.</p>
                        </div>
                    </div>
                </div>
             );
         }
 }