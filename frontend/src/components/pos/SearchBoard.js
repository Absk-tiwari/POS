import React, { useRef, useState } from 'react';
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useSearch } from '../../contexts/SearchContext';
import { useSelector } from 'react-redux';
import { footerStyle, innerStyle, outerStyle, upperStyle } from '../../objects/keyboard/keyboardStyle';
import { lowerCase } from '../../objects/keyboard/layouts';
import { getClientX, getClientY } from '../../helpers/utils';

export default function SearchBoard() {

    const {setSearchQuery, focused, setFocused} = useSearch();
    const {hasKeyboard} = useSelector(s => s.auth)
    const [position, setPosition] = useState({ x: window.screen.availWidth/3.5, y: window.screen.availHeight / 2.82 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({  x: 0, y: 0  });
    const onChange = input => setSearchQuery(input)
    const keyboardRef = useRef(null);
 
    const handleMouseDown = (e) => {
        setDragging(true);
        const x = getClientX(e)
        const y = getClientY(e);
        setOffset({
            x: x - position.x,
            y: y - position.y,
        });
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;
        const x = getClientX(e)
        const y = getClientY(e);
        setPosition({
            x: x - offset.x,
            y: y - offset.y,
        });
    }

    const handleMouseUp = () => setDragging(false);
    // handling size 
    const [scale, setScale] = useState(localStorage.getItem('_keyboard_scale')??1); // Default scale (1 = 100%)

    const decrease = () => {
        localStorage.setItem('_keyboard_scale', Math.max(scale - 0.1, 0.5))
        setScale(prev => Math.max(prev - 0.1, 0.5))
    }
    const increase = () => {
        localStorage.setItem('_keyboard_scale', Math.min(JSON.parse(scale) + 0.1, 2))
        setScale(prev => Math.min(JSON.parse(prev) + 0.1, 2))
    }
    if(hasKeyboard) return null

    return (
        <div className='mt-4 position-fixed w-50 v-keyboard' style={{zIndex:9999, top:60 }}>
            <div
                style={upperStyle}
                onPointerMove={handleMouseMove}
                onPointerUp={handleMouseUp}
                onPointerDown={handleMouseDown}
            >
                <div
                    style={{...outerStyle,
                        top: `${position.y}px`,
                        left: `${position.x}px`,
                        cursor: dragging ? "grabbing" : "grab",
                        transform: `scale(${scale})`
                    }}
                >
                    <div
                        onPointerMove={handleMouseMove}
                        onPointerUp={handleMouseUp}
                        onPointerDown={handleMouseDown}
                        style={innerStyle}
                    >
                        <button className='btn btn-light btn-rounded foot-btn' onClick={decrease}>-</button>
                        <span> Hold To Drag </span>
                        <button className='btn btn-light btn-rounded foot-btn' onClick={increase}> + </button>
                    </div>
                        <Keyboard
                            onChange={onChange}
                            keyboardRef={(r) => (keyboardRef.current = r)}
                            layout={{ default: lowerCase }}
                        />
                    <div className='bg-white d-flex board-navs w-100' style={footerStyle}>
                        <button className='btn btn-light btn-rounded foot-btn' 
                            onClick={()=>{setSearchQuery('');keyboardRef.current.clearInput()}}
                        > CLEAR </button>
                        <button onClick={()=>setFocused(!focused)} className='btn btn-light btn-rounded foot-btn'> HIDE </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
