import React, { SetStateAction, useCallback, useEffect, useState} from 'react';
import "quill/dist/quill.snow.css"
import Quill from "quill";
import {io} from 'socket.io-client'



   
const SAVE_INTERVAL_MS = 2000

const TOOLBAR_OPTIONS=[
    [{header:[1,2,3,4,5,6,false]}],
    [{font:[]}],
    [{list:"ordered"},{list:"bullet"}],
    ["bold", "italic", "underline"],
    [{color:[]}, {background:[]}],
    [{script:"sub"},{script:"super"}],
    [{align:[]}],
    ["image", "blockquote", "code-block"],
    ["clean"],
]

export default function TextEditor(){
    const [socket, setSocket] = useState(null)
    const [quill, setQuill] = useState()

    useEffect(()=>{
        
        const s = io("http://localhost:3001") 
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    const wrapperRef = useCallback((wrapper:HTMLDivElement)=> {
        if (wrapper==null) return
        wrapper.innerHTML = ""
        const editor = document.createElement('div')
        wrapper.append(editor)
        new Quill(editor, {theme: 'snow', modules: {toolbar: TOOLBAR_OPTIONS}})

    }, [])

    return(
        <div id="container" ref={wrapperRef}></div>
    )
}