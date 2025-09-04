import React, { useEffect, useRef, useState } from 'react';
import Keyboard from "react-simple-keyboard";
import { useSelector } from 'react-redux'; 
import { useGetProductsQuery, useTogglePOSMutation, useUpdateStockMutation } from '../../features/centerSlice';
import {chunk, dealHost, getClientX, getClientY} from '../../helpers/utils';
import $ from 'jquery';
import labelImg from '../../asset/images/default.png';
import toast from 'react-hot-toast';
import { useSearch } from '../../contexts/SearchContext';
import SearchBoard from '../pos/SearchBoard';
import { footerStyle, innerStyle, outerStyle, upperStyle } from '../../objects/keyboard/keyboardStyle';
import { numeric0 } from '../../objects/keyboard/layouts';

function Inventory() {

    const tableRef = useRef(); 
    const listtableRef = useRef();
    const keyboardRef = useRef();

    const [ view, setView] = useState('list');
    const [ hover , setHover ]= useState(true);
    const [ preset, setPreset ] = useState(0)
    const { searchQuery, setSearchQuery, focused, setFocused } = useSearch()
    const [ stockAmount , setStockAmount ] = useState(0);

    const [position, setPosition] = useState({ x: window.screen.availWidth / 3, y: window.screen.availHeight / 2 });
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

    const [ rowData, setRowData] = useState([]);
    const { currency, hasKeyboard } = useSelector( state=> state.auth );
    const { data, isSuccess:gotProducts } = useGetProductsQuery();
    const [ updateStock ] = useUpdateStockMutation();
    const [ togglePOS ] = useTogglePOSMutation();

    const handleImgError = e => {
        e.target.src = labelImg
    }
    const [ hovered, setHovered ] = useState('');
    const [ stock, setStock] = useState({id:'',stock:0});
    
    const [ gridData, setGrid ] = useState([]);

    useEffect(()=> {
        if(gotProducts) { 
            setRowData(data.products)
            setGrid(chunk(data.products.map( ({id, name, image, price, quantity, pos, ...rest }) => ({id, name, image:`${process.env.REACT_APP_IMAGE_URI}/${image}`, price, quantity, pos })), 3))
        } 
        return () => null
    },[ gotProducts, data ])

    useEffect(()=>{
        $('.dt-input').val(searchQuery).trigger('keyup')
        return () => setSearchQuery('')
    },[searchQuery])

    useEffect(()=>{
        keyboardRef.current?.setInput(preset)
    },[preset])

    useEffect(() => {
        $(tableRef.current).DataTable({
            paging: true,
            searching: true,
            info: true,
            ordering: true,
            processing:true,
            lengthMenu:[ 15,25,50]
        });
        $.fn.DataTable.ext.errMode = 'none';
        return () => null
      }, [view, rowData, gotProducts]);

    useEffect(() => {
        if(rowData.length) {
            $(listtableRef.current).DataTable({
                paging: true,
                searching: true,
                info: true,
                ordering: true,
                lengthMenu:[ 15,25,50 ]
            });
        }
        $('.dt-input').on('click', function(){
            setFocused(true)
        })
        $.fn.DataTable.ext.errMode = 'none';
        return ()=> $(listtableRef.current).DataTable().destroy()
        
    }, [view, rowData]);

    const handleView = view => {
        if(view==='grid') {
            $(listtableRef.current).DataTable().destroy();
        } else {
            $(tableRef.current).DataTable().destroy();
        }
        setView(view)
    }

    const handleStock = e => {
        let { id }= e.target.dataset
        setStock({id, stock: e.target.value})
    }

    const manageStock = async() => {

        if(!stock.stock) return setHover('');
        const product = rowData.find( item => item.id === parseInt(stock.id));
        try {
            await updateStock({ id: stock.id, updated: {...product, quantity: stock.stock } }).unwrap()
            setHover(true);
            setStockAmount(0);
        } catch (error) {
            toast.error("Something went wrong!");  
        }
    }

    const showInPOS = async (e) => {
        let {id, status} = e.target.dataset;
        let stat = parseInt(status) ? 0 : 1; 
        e.preventDefault();
        try {
            let res = await togglePOS({id, status:stat}).unwrap()
            if (res.status) e.target.checked = stat
        } catch (error) {
            console.log("Exception on first sight:- "+ error.message )
        }
    }

    // handling resize 
    const [ scale, setScale ] = useState(localStorage.getItem('_keyboard_scale')??1);
    const decrease = () => {
        localStorage.setItem('_keyboard_scale', Math.max(scale - 0.1, 0.5))
        setScale(prev => Math.max(prev - 0.1, 0.5))
    }
    const increase = () => {
        localStorage.setItem('_keyboard_scale', Math.min(JSON.parse(scale) + 0.1, 2))
        setScale(prev => Math.min(JSON.parse(prev) + 0.1, 2))
    }
    return (
        <>
            <div className={"row w-100 h-100 mt-4"}>
                <div className="col-lg-12 grid-margin stretch-card">
                    <div className="card">
                        <form id="filter-form">
                            <div className="card-header">
                                    <div style={{display:'flex',alignItems:'end',justifyContent:'space-between'}}>
                                    <div/> 
                                    <div className="d-flex flex-end" style={{width:'140px',justifyContent:'space-around',alignItems:'center'}}>
                                        <button type="button" className={`btn btn-outline-light btn-sm`} style={{ backgroundColor:view==='grid' && '#55aaad', color: view=== 'grid' && '#fff' }} onClick={()=>handleView('grid')} > Grid </button>
                                        <button type="button" className={`btn btn-outline-light btn-sm`} style={{ backgroundColor:view==='list' && '#55aaad',color: view=== 'list' &&'#fff' }} onClick={()=>handleView('list')} > List </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                        <div className="card-body" style={{ height:'200%',width:'100%' }}>
                            {view==='list' && <table className='table' ref={listtableRef}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Price</th>
                                        <th>Barcode</th>
                                        <th>Stock</th>
                                        <th>POS status</th>
                                        <th>Image</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rowData.map( row => <tr key={row.id}> 
                                        <td onMouseOver={()=>setHovered('')}>{row.name}</td>
                                        <td onMouseOver={()=>setHovered('')}>{currency +' '+row.price}</td>
                                        <td onMouseOver={()=>setHovered('')}>{row.code}</td>
                                        <td className='position-relative' onMouseOver={()=>setHovered('')}>
                                            <input className='input' 
                                                data-id={row.id} 
                                                onChange={handleStock} 
                                                readOnly={hover!==row.id} 
                                                value={hover===row.id? stockAmount: row.quantity} 
                                            />
                                            <span onClick={hover!==row.id ? (e)=>{
                                                setPreset(row.quantity);
                                                setHover(row.id);
                                                setStockAmount(row.quantity)
                                                setPosition({...position, y: e.target.getBoundingClientRect().y + 50})
                                                setStock({...stock,id:row.id})
                                            }: ()=> manageStock()} className='position-absolute btn btn-sm btn-rounded btn-success' style={{right:60}}>{hover===row.id ? 'Save': 'Edit'}</span>
                                        </td>
                                        <td onMouseOver={()=>setHovered('')}>
                                            <input type='checkbox' name='status' onClick={showInPOS} data-status={row.pos} data-id={row.id} className='pos' id={`tabular-${row.id}`} defaultChecked={row.pos}/>
                                            <label htmlFor={`tabular-${row.id}`} />
                                            <div className='plate'></div>
                                        </td>
                                        <td className='position-relative img'>
                                            <img 
                                                className='img-fluid img-thumbnail'
                                                src={dealHost(row.image??labelImg)} 
                                                onMouseEnter={()=>setHovered(row.id)}
                                                onError={handleImgError}
                                                alt=''
                                            />
                                            {
                                                hovered === row.id && <div className='image-container' style={{backgroundImage:`url(${dealHost(row.image??labelImg)})`, backgroundSize:'cover', backgroundRepeat:'no-repeat'}}></div>
                                            }
                                        </td>
                                    </tr>)}
                                </tbody>
                            </table>}
                            {view === 'grid' && (
                                <table ref={tableRef} className='table grid-view'>
                                    <thead>
                                        <tr className='d-none'>
                                            <th>Col</th>
                                            <th>Col</th>
                                            <th>Col</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        { gridData.map( (chunk,i) => <tr key={i}>
                                            { chunk.map( row => (<td key={row.id} colSpan={ chunk.length < 3 ? chunk.length: 0 }> <div className={`card-body d-flex grid-view`} >
                                                <div className={`col-9 d-block`}>
                                                    <div className={`row`}>
                                                        <strong className="wrapped-text">
                                                            {row.name}
                                                            {row.name.length > 40 && <span className={`tooltiptext`}>{row.name}</span>}
                                                        </strong>
                                                        <div className="row">
                                                            <b>Quantity: {row.quantity}</b>
                                                            <input className="input d-none" data-id={row.id} style={{width:80}} onClick={()=>setFocused(true)}/>
                                                        </div>
                                                        <div className="row d-flex">
                                                            <div className="align-self-center">POS</div>
                                                        </div>
                                                        <div>
                                                            <input type="checkbox" name="pos" className='pos' data-id={row.id} data-status={row.pos} onClick={showInPOS} id={`id-${row.id}`} defaultChecked={row.pos} />
                                                            <label htmlFor={`id-${row.id}`} />
                                                            <div className="plate"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-3 text-center">
                                                    <img src={dealHost(row.image??labelImg)} onError={handleImgError} alt=''/>
                                                </div>
                                            </div></td>)) }    
                                        </tr>)}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {focused && !hasKeyboard && <SearchBoard />}
            {
                typeof hover !== 'boolean' && <div className='mt-4 position-fixed w-50' style={{zIndex:9999, top:60 }}>
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
                            transform: `scale(${scale})`, 
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
                                keyboardRef={(r) => (keyboardRef.current = r)}
                                onChange={e => {
                                    setStockAmount(e)
                                    setStock({...stock, stock:e})
                                }}
                                layout={{
                                    default: [
                                        "1 2 3",
                                        "4 5 6",
                                        "7 8 9",
                                        "0 {bksp}",
                                    ]
                                }}
                            />
                        <div className='bg-white d-flex board-navs' style={footerStyle}>
                            <button className='btn btn-light btn-rounded w-20 foot-btn' onClick={()=>{setHover(true)}} >CANCEL</button>
                            <button className='btn btn-light btn-rounded foot-btn' onClick={decrease}>-</button>
                            <span style={{placeContent:'center'}}> Size: {Math.round(scale * 100)}% </span>
                            <button className='btn btn-light btn-rounded foot-btn' onClick={increase}>+</button>
                            <button onClick={()=>manageStock()} className='btn btn-success  btn-rounded foot-btn' >SAVE</button>
                        </div>
                    </div>
                </div>
            </div>
            }
        </>
    )
}

export default Inventory