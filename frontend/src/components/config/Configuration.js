import React, { memo, useEffect, useRef, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import axios from 'axios';
import toast from 'react-hot-toast';
import category from '../../asset/images/category.png';
import tax from '../../asset/images/tax.png';
import notes from '../../asset/images/notes.webp';
import alert from '../../asset/images/alert.png';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Modal, ModalHeader, ModalFooter, ModalBody, FormGroup, Form } from 'reactstrap';
import { bkspDisplay, footerStyle, innerStyle, outerStyle, upperStyle } from '../../objects/keyboard/keyboardStyle';
import { numeric, numWithout } from '../../objects/keyboard/layouts';
import { getClientX, getClientY } from '../../helpers/utils';
import { Button } from '../layouts/Button';
import { defPosition } from '../layouts/Navbar';

function Configuration() {
    const keyboardRef = useRef();
    const nav = (url) => navigator(url)
    const navigator = useNavigate()
    const { currency, stockAlert, theme, hasKeyboard } = useSelector(state => state.auth);
    const [ currencyCatogory, setCurrencyCategory ] = useState(false);
    const [ stockModal, setStockModal ] = useState(false);
    const [ minStock, setAlert ] = useState(stockAlert)
    const [ focused, setFocused ] = useState(false)
    const dispatch = useDispatch();
    
    const updateStockAlert = e => {
        e.preventDefault();
        axios.post('config/update-stock-alert', {stock: minStock}).then(({data}) => {
            if(data.status) {
                setFocused(null)
                toast.success(data.message);                 
                dispatch({ type: "STOCK_ALERT", payload: minStock })
            } else {
                toast.error(data.message);
            }
        }).catch(()=>toast.error("Something went wrong!"))
    }
    
    const [ position, setPosition ] = useState(defPosition);
    const [ dragging, setDragging ] = useState(false);
    const [ offset, setOffset ] = useState({ x: 0, y: 0 });
    
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
    
    const senty = {placeContent:'center'}
    // presetting text
    const [ scale, setScale ] = useState(localStorage.getItem('_keyboard_scale')??1)
    const [ presetTxt, setPreset ] = useState(minStock)
    useEffect(() => {
        keyboardRef.current?.setInput(presetTxt);
    }, [presetTxt]);

    // handling size 
    const decrease = () => {
        localStorage.setItem('_keyboard_scale', Math.max(scale - 0.1, 0.5))
        setScale(prev => Math.max(prev - 0.1, 0.5))
    }
    const increase = () => {
        localStorage.setItem('_keyboard_scale', Math.min(JSON.parse(scale) + 0.1, 2))
        setScale(prev => Math.min(prev + 0.1, 2))
    }
    return (
    <>
        <div className="content-wrapper">
            <div className="d-grid mt-3" style={{placeItems: 'center'}}>

                <div className="d-flex" style={{gap:'20px',marginTop:'10%',marginLeft:'-20%'}}>
                    <div className="text-center col-4">
                        <Link className="card redirect tablink showCat" to={`/config/categories`} title={"Categories"}>
                            <div className="card-body">
                                {theme==='default' ? 
                                <div className="d-flex" title={"Categories"} style={senty}>
                                    <div style={{textAlign:'center'}}>
                                        <img src={category} height="100" alt=''/> 
                                    </div>
                                </div>
                                : <h1 style={{fontSize:'3rem'}}>Category</h1>}
                            </div>
                        </Link>
                        {theme==='default' && <h5 className="pt-3 fs-2">Category</h5>}
                    </div>
                    <div className="text-center col-4">
                        <Link to={'/config/taxes'} className="card redirect tablink" onClick={()=>nav('/config/taxes')} 
                            onPointerUp={()=>nav('/config/taxes')} title={"Taxes"}>
                            <div className="card-body">
                                {theme==='default' ? 
                                <div className="d-flex" title={"Taxes"} style={senty}>
                                    <div style={{textAlign:'center'}} >
                                        <img src={tax} height="100" alt={''}/> 
                                    </div>
                                </div>
                                : <h1>Tax</h1>}
                            </div>
                        </Link>
                        {theme==='default' && <h5 className="pt-3 fs-2"> Tax </h5>}
                    </div>
                   
                    <div className="text-center col-4">
                        <div className="card redirect tablink" onClick={(e)=> {setStockModal(!stockModal);e.stopPropagation()}} >
                            <div className="card-body">
                            {theme==='default' ?
                                <div className="d-flex" title={"Set stock alert"} style={senty}>
                                    <div style={{textAlign:'center'}} >
                                        <img src={alert} height="100" alt='' /> 
                                    </div>
                                </div>
                            : <h1 style={{fontSize:'2.5rem'}}>Stock Alert</h1>}
                            </div>
                        </div>
                        {theme==='default' && <h5 className="pt-3 fs-2"> Stock Alert </h5>}
                    </div>
                    
                    <div className="text-center col-4">
                        <Link to={'/notes'} className="card redirect tablink" onClick={()=>nav('/notes')} 
                            onPointerUp={()=>nav('/notes')} title="Add payment notes">
                            <div className="card-body">
                                {theme==='default' ? 
                                <div className="d-flex" title="Add payment notes" style={senty}>
                                    <div style={{textAlign:'center'}} >
                                        <img src={notes} height="100" alt=''/> 
                                    </div>
                                </div>
                                : <h1>Notes</h1>}
                            </div>
                        </Link>
                        {theme==='default' && <h5 className="pt-3 fs-2"> Add Notes </h5>}
                    </div>
                </div>
            </div>

        </div>

        <Modal isOpen={currencyCatogory} >
            <ModalHeader >
                Currency
            </ModalHeader>
            <ModalBody>
                <div className="form-group">
                    <select name="currency" id="currency" className="form-control" onChange={()=>{}}>
                        <option value="euro" {...currency === '€ ' ? 'selected':''} > Euro </option>
                        <option value="inr" {...currency === '₹ ' ? 'selected':''} > INR </option>
                    </select>
                </div>
            </ModalBody>
            <ModalFooter>
                <button className='btn btn-light btn-rounded' onClick={()=> setCurrencyCategory(!currencyCatogory)}>Close</button>
            </ModalFooter>
        </Modal>

        <Modal isOpen={stockModal}>
            <Form onSubmit={updateStockAlert}>
                <ModalHeader>
                    Set stock alert
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <small><b> Select minimun stock to get notified </b></small>
                        <input type="text" pattern="\d*" className="form-control" placeholder="e.g 50, 100" onClick={()=> {
                            setPreset(JSON.stringify(minStock))
                            setFocused('alert');
                        }} onChange={ e => setAlert(e.target.value)} value={minStock} />
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <button className='btn btn-light btn-rounded' type='button' onClick={()=> {
                        setStockModal(!stockModal)
                        setFocused('')
                    }}>Close</button>
                    <button className='btn btn-success btn-rounded' > Update </button>
                </ModalFooter>
            </Form>
        </Modal>

        {
            focused && !hasKeyboard && <div className='mt-4 position-fixed w-50' style={{ zIndex:9999, top:60 }}>
            <div
                style={upperStyle}
            >
                <div
                    style={{ ...outerStyle,
                        width:400,
                        top: `${position.y}px`,
                        left: `${position.x}px`,
                        cursor: dragging ? "grabbing" : "grab",
                        transform:`scale(${scale})`, 
                    }}
                >
                    <div
                        onPointerMove={handleMouseMove}
                        onPointerUp={handleMouseUp}
                        onPointerDown={handleMouseDown}
                        style={innerStyle}
                    >
                        <Button text={<i className='fa fa-minus'/>} onClick={decrease}/>
                        <span> Hold To Drag </span>
                        <Button text={<i className='fa fa-plus'/>} onClick={increase}/>
                    </div>
                        <Keyboard
                            onChange={(e)=>setAlert(e)}
                            keyboardRef={(r) => (keyboardRef.current = r)}
                            layout={{default: numWithout}}
                            display={bkspDisplay}
                        />
                    <div className='bg-white d-flex board-navs' style={footerStyle}>
                        <Button onClick={()=>{
                            setAlert('')
                            keyboardRef.current.clearInput()
                        }} text={'CLEAR'}/>
                        <Button onClick={()=>setFocused('')} text={'HIDE'} />
                    </div>
                </div>
            </div>
        </div>
        }
    </>
    )
}

export default memo(Configuration)