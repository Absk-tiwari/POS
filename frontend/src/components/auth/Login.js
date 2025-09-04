import React, {useEffect, useRef, useState} from 'react';
import Keyboard from 'react-simple-keyboard';
import logo from '../../asset/images/pos.png';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { full } from '../../objects/keyboard/layouts';
import { footerBorder, footerStyle, fullDisplay, innerStyle, outerStyle, upperStyle } from '../../objects/keyboard/keyboardStyle';
import { getClientX, getClientY } from '../../helpers/utils';

export default function Login() {

    const navigate = useNavigate();
    const dispatch = useDispatch(); 

    const keyboardRef = useRef()
    const [fields, setFields] = useState({email:'',password:''})
    const onchange = e => setFields({...fields, [e.target.name]:e.target.value})
    const [ scale, setScale ] = useState(localStorage.getItem('_keyboard_scale')??1)
    const decrease = () => {
        localStorage.setItem('_keyboard_scale', Math.max(scale - 0.1, 0.5))
        setScale(prev => Math.max(prev - 0.1, 0.5))
    }
    const increase = () => {
        localStorage.setItem('_keyboard_scale', Math.min(JSON.parse(scale) + 0.1, 2))
        setScale(prev => Math.min(JSON.parse(prev) + 0.1, 2))
    }

    const [focused, setFocused] = useState('')
    const [ preset, setPreset ] = useState('')
    const [layoutName, setLayout] = useState('shift')

    const handleLogin = async(event) => {
        event.preventDefault() 
        dispatch({ type:'LOADING' })
        try {
            axios.post(`auth/login`, fields ).then( async ({ data }) => {  
            if( data.authToken ) {

                localStorage.setItem('pos-token', data.authToken )
                localStorage.setItem('pos-user', JSON.stringify(data.user))

                dispatch({ type:'SET_TOKEN', payload: data.authToken }) 
                dispatch({ type:'SET_AUTH', payload: data.user })  
                dispatch({ type:'UPLOAD_DB', payload: data['db-upload'] })  
                dispatch({ type:'SET_ADMIN_STATUS', payload: data.user.type==='admin' })
                dispatch({ type:'SET_CURRENCY', payload: data.currency });
                
                return navigate('/dashboard')

            }}).catch(()=> {
                toast.error('Invalid credentials!') 
                localStorage.clear()
            }).finally(() => dispatch({ type:'STOP_LOADING' }))

        } catch (error) {
            console.log(error)
            localStorage.clear()
        }

    }  

    const inputStyle = { borderRadius:50 }
    const [position, setPosition] = useState({ x: window.screen.availWidth / 1.55, y: window.screen.availHeight / 4 });
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    
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

    const onChange =  e => { 
        setFields({...fields, [focused]:e})
        if (e.length === 0) {
            setLayout("shift");
        } else {
            setLayout("default");
        }
    }

    useEffect(()=> {
        keyboardRef.current?.clearInput()
    },[preset])

    return (
        <> 
            <div className="container-scroller">
                <div className="container-fluid page-body-wrapper auth full-page-wrapper">
                    <div className="content-wrapper d-flex align-items-center auth px-0">
                    <div className="row w-100 mx-0">
                        <div className="col-lg-4" style={{marginLeft:'26%'}}>
                        <div className="auth-form-light text-left py-5 px-4 px-sm-5" style={{borderRadius:'12px'}}>
                            <center><img src={logo} alt="logo" height={100} width={150}/></center>
                            <h4> Hello!</h4>
                            <h6 className="fw-light"> Sign in to continue. </h6>
                            <form className="pt-3" onSubmit={handleLogin} method="POST">
                                <div className="form-group">
                                    <input type="email" 
                                        name="email" 
                                        style={inputStyle} 
                                        className="form-control form-control-lg" 
                                        placeholder="Enter email" 
                                        onChange={onchange}
                                        value={fields.email}
                                        onClick={()=>{
                                            setFocused('email');
                                            setPreset('')
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <input type="password" 
                                        name="password"
                                        style={inputStyle} 
                                        className="form-control form-control-lg" 
                                        placeholder="Password"
                                        onChange={onchange} 
                                        onClick={()=> {
                                            setFocused('password')
                                            setPreset('')
                                            keyboardRef.current?.clearInput()
                                        }}
                                        defaultValue={fields.password}
                                    />
                                </div>
                                <div className="mt-3 d-grid gap-2">
                                    <button className="btn btn-block btn-primary btn-lg fw-medium auth-form-btn" style={inputStyle} type="submit">SIGN IN</button>
                                </div>
                                <div className="my-2 d-flex justify-content-center align-items-center">
                                </div>
                            </form>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
            {focused && <div className='mt-4 position-fixed w-50' style={{zIndex:9999, top:60 }}>
                <div
                    style={upperStyle}
                    onPointerMove={handleMouseMove}
                    onPointerUp={handleMouseUp}
                    onPointerDown={handleMouseDown}
                >
                    <div
                        style={{...outerStyle,
                            transform: `scale(${scale})`, 
                            top: `${position.y}px`,
                            left: `${position.x}px`,
                            cursor: dragging ? "grabbing" : "grab",
                        }}
                    >
                        <div
                            onPointerMove={handleMouseMove}
                            onPointerUp={handleMouseUp}
                            onPointerDown={handleMouseDown}
                            style={innerStyle}
                        >
                            Hold To Drag 
                        </div>
                            <Keyboard
                                onChange={onChange}
                                onKeyPress={(e) => {
                                    if(e === "{lock}") setLayout((prev) => (prev === "default" ? "shift" : "default"))
                                }}
                                keyboardRef={(r) => (keyboardRef.current = r)}
                                layout={full}
                                display={fullDisplay}
                                layoutName={layoutName}
                            />
                        <div className='bg-white d-flex board-navs' style={footerStyle}>
                            <button className='btn btn-light btn-rounded' onClick={()=>{
                                setFields({...fields,[focused]:''})
                                setLayout('shift')
                                keyboardRef.current?.clearInput()
                            }} style={footerBorder}>
                                CLEAR
                            </button>

                            <button style={footerBorder} className='btn btn-light btn-rounded' onClick={decrease}>-</button>
                                <span style={{placeContent:'center'}}> Size: {Math.round(scale * 100)}% </span>
                            <button style={footerBorder} className='btn btn-light btn-rounded' onClick={increase}>+</button>

                            <button onClick={()=>setFocused('')} className='btn btn-light btn-rounded' style={footerBorder}>HIDE</button>
                        </div>
                    </div>
                </div>
            </div>}
        </>
  )
}
