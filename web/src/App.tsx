// @ts-check
import React, { useState, useMemo, useEffect } from 'react';
import * as _ from 'lodash';
import axios from 'axios';
import styled from 'styled-components';
import io from 'socket.io-client';

const socket = io('ws://localhost:5000', { transports: ["websocket"] });

interface buttonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    row?: string[]
}

const Button = ({ children, row, disabled, ...props }: buttonProps) => {

    const filledRow = useMemo(() => (!_.some(row, row => row === '')), [row])

    return (
        <button
            {...props}
            style={{
                borderRadius: '3px',
                background: 'palevioletred',
                color: 'white',
                margin: '0 1em',
                padding: '0.4em 1em',
                border: 'none',
                cursor: 'pointer',
                ...disabled ? { background: 'lightgray' } : {}
            }}
            disabled={disabled || filledRow}
        >
            {children}
        </button>
    )
}

const Container = styled.div`
    display: flex;
    font-family: 'Helvetica Neue', sans-serif;
    flex-direction: column;
    height: 90vh;
    width: 40%;
    min-width: 400px;
    margin: auto;
    justify-content: center;
    align-items: center;
`;

const Table = styled.div`
    display: table;
    border-collapse: collapse;
    text-align: center;
`;

const Tr = styled.div`
    display: table-row;
`;

const Td = styled.div`
    display: table-cell;
    padding: 1rem;
    font-weight: bold;
    color: #333;
    border: 1px solid #dddddd;
`;

function App() {

    const [player, setPlayer] = useState(0);
    const [currentTurn, setCurrentTurn] = useState(0)
    const [playerWon, setPlayerWon] = useState('');

    const initialGrid = [
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
    ];

    const [grid, setGrid] = useState(initialGrid)

    useEffect(() => {

        socket.on('new-connection', (data) => {
            setPlayer(data)
        });

        socket.on('reset-game', () => {
            setGrid(initialGrid)
            setPlayerWon('')
            setCurrentTurn(1)
            setPlayer(1)
        })

        socket.on('grid-update', (data) => {
            updateGrid(data)
        });

        socket.on('turn-update', (data) => {
            setCurrentTurn(data)
        });

        return () => {
            socket.off('new-connection')
            socket.off('grid-update');
            socket.off('turn-update');
        };
    }, []);

    useEffect(() => {
        checkForWin();
    }, [grid])

    const updateGrid = (data: any) => {
        const table = [...grid.map(row => [...row])]
        table[data.row][data.cell] = data.player === 1 ? "x" : "o";
        setGrid(prev => {
            const g = _.cloneDeep(prev)
            g[data.row][data.cell] = data.player === 1 ? "x" : "o";
            return g;
        })
    }

    const checkForWin = () => {
        // Horizontal
        _.forEach(grid, (row) => {
            let prev = '';
            let count = 0;
            _.forEach(row, (cell) => {
                if (cell !== '') {
                    if (cell !== prev) count = 1;
                    else count++;
                } else {
                    count = 0;
                }
                prev = cell;

                if (count === 4) {
                    setPlayerWon(cell === 'x' ? 'Player 1' : 'Player 2');
                }

            })
        })

        //Vertical
        _.range(7).forEach(colIdx => {
            let prev = '';
            let count = 0;
            _.range(7).forEach(rowIdx => {
                const cell = grid[rowIdx][colIdx];
                if (cell !== '') {
                    if (cell !== prev) count = 1;
                    else count++;
                } else {
                    count = 0;
                }
                prev = cell;

                if (count === 4) {
                    setPlayerWon(cell === 'x' ? 'Player 1' : 'Player 2');
                }
            })
        })

        //Positive Diagonal
        _.range(4).forEach(rowIdx => {
            _.range(3, 7).forEach(colIdx => {
                let prev = '';
                let count = 0;
                _.range(4).forEach(pos => {
                    const cell = grid[rowIdx + pos][colIdx - pos];
                    if (cell !== '') {
                        if (cell !== prev) count = 1;
                        else count++;
                    } else {
                        count = 0;
                    }
                    prev = cell;

                    if (count === 4) {
                        setPlayerWon(cell === 'x' ? 'Player 1' : 'Player 2');
                    }
                })

            })
        })

        //Negative Diagonal
        _.range(4).forEach(rowIdx => {
            _.range(4).forEach(colIdx => {
                let prev = '';
                let count = 0;
                _.range(4).forEach(pos => {
                    const cell = grid[rowIdx + pos][colIdx + pos];
                    if (cell !== '') {
                        if (cell !== prev) count = 1;
                        else count++;
                    } else {
                        count = 0;
                    }
                    prev = cell;

                    if (count === 4) {
                        setPlayerWon(cell === 'x' ? 'Player 1' : 'Player 2');
                    }
                })

            })
        })

    }

    const addToLeft = (row: number) => {
        const idx = _.findIndex(grid[row], row => row === '');
        axios.post("http://localhost:5000/api/grid/recordMove", {
            row,
            cell: idx,
            player
        })
    }

    const addToRight = (row: number) => {
        const idx = _.findLastIndex(grid[row], row => row === '');
        axios.post("http://localhost:5000/api/grid/recordMove", {
            row,
            cell: idx,
            player
        })
    }

    return (
        <Container>

            <h1>Side-Stacker Game</h1>
            <h4>{`Player ${player} - [ Label: ${player === 1 ? "x" : "o"} ]`}</h4>
            <br />

            {Boolean(playerWon) ?
                <h3 style={{ color: 'green' }}>{playerWon} Won this Game</h3>
                :
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ color: 'green' }}>{player === currentTurn ? "YOUR TURN!" : ""}</h4>
                    <h4>Current Turn: Player {currentTurn}</h4>
                </div>
            }

            <Table>
                {grid.map((row: string[], rowIndex: number) => (
                    <Tr key={rowIndex}>
                        <Td>
                            <Button disabled={player !== currentTurn || Boolean(playerWon)} row={row} onClick={() => addToLeft(rowIndex)}>&rarr;</Button>
                        </Td>
                        {row.map((cell: string, index: number) => (
                            <Td key={index}>{cell}</Td>
                        ))}
                        <Td>
                            <Button disabled={player !== currentTurn || Boolean(playerWon)} row={row} onClick={() => addToRight(rowIndex)}>&larr;</Button>
                        </Td>
                    </Tr>
                ))}
            </Table>
        </Container>
    );
}

export default App;
