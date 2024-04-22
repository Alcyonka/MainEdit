import React, { SetStateAction, useCallback, useEffect, useState} from 'react';
import Quill from "quill";
import {io} from 'socket.io-client'
import './styles.module.css'
import 'quill/dist/quill.snow.css';
import {Socket} from 'socket.io-client'
import {DefaultEventsMap} from "@socket.io/component-emitter"
import { useParams } from 'react-router-dom';
import saver from './FileSaver';
import ReactDOM from 'react-dom/client';
import mammoth from 'mammoth';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { readFileSync } from 'fs';
import { join } from 'path';
import PizZipUtils from "pizzip/utils/index.js";
import docxtemplater from 'docxtemplater';
import {saveAs} from 'file-saver';
//import docx2Quill from '@gzzhanghao/docx2quill'
import ImageModule from "docxtemplater-image-module-free";
import JSZipUtils from "jszip-utils";
import JSZip from "jszip"
import {convertToHtml} from "mammoth"
import 'mammoth/mammoth.browser'
   
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
    const {id: documentId} = useParams()
    const [socket, setSocket] = useState<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null)
    const [quill, setQuill] = useState<any>(null)
    console.log(documentId)

    useEffect(()=>{
        
    const s = io("http://localhost:3001")
        setSocket(s)
        return () => {
            s.disconnect()
        }

    }, [])

    useEffect(() => {
        if (socket == null || quill == null) return
        socket.once("load-document", document =>{
            quill.setContents(document)
            quill.enable()
        })
        socket.emit('get-document', documentId)
    },[socket, quill, documentId])

useEffect(() => {
    if (socket == null || quill == null) return
    const interval = setInterval(()=>{
        socket.emit('save-document', quill.getContents())

    }, SAVE_INTERVAL_MS)

    return () => {
        clearInterval(interval)
    }
}, [socket, quill])

   useEffect(() => {
        if (socket == null || quill == null) return
         const handler = (delta:Object, oldDelta:Object, source:string) => {
            if (source !== 'user') return 
            socket.emit("send-changes", delta)
        }
        quill.on('text-change',handler)

        return() => {
            quill.off('text-change', handler)
        }
    }, [socket, quill])


    useEffect(() => {

        if (socket == null || quill == null) return

        const handler = (delta:Object) => {
            quill.updateContents(delta)
        }
        socket.on('receive-change', handler)

        return () => {
            socket.off('receive-change', handler)
        }
    }, [socket, quill])


    useEffect(() => {

        if (socket == null || quill == null) return

        const handler = (delta:Object, oldDelta:Object, source:string) => {
            if (source !== 'user') return
            socket?.emit("send-changes", delta)
        }
        quill.on('text-change', handler)

        return () => {
            quill.off('text-change', handler)
        }
    }, [socket, quill])
  


    const wrapperRef = useCallback((wrapper:HTMLDivElement)=> {
        if (wrapper==null) return
        wrapper.innerHTML = ""
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor, {theme: 'snow', modules: {toolbar: TOOLBAR_OPTIONS}})
    //    q.disable()
      //  q.setText('Loading...')
        setQuill(q)
      

        /*const handleAdd = () => {
            quill.clipboard.dangerousPasteHTML(<FileReader/>);
        }
*/
        var posButton = document.createElement('span');
        var posButton1 = document.createElement('span');
        posButton.classList.add(
            'ql-formats'
           );
           posButton.setAttribute('id', 'butSave');
        var customButton = document.createElement('button');
        customButton.innerHTML = 'Сохранить';
        customButton.addEventListener('click', function() {
        //  var htmlContent = quill.root.innerHTML;
        saver(q);
            });

            customButton.classList.add(
                'ql-align', 
                'ql-picker', 
                'ql-icon-picker',
                'ql-save'
            );
            customButton.style.width='70px';
            posButton.appendChild(customButton);

            posButton1.classList.add(
                'ql-formats'
               );
               posButton1.setAttribute('id', 'butLoad');
            var customButton1 = document.createElement('input');
            customButton1.type="file"
            customButton1.id="customButton1"
            
            customButton1.innerHTML = 'Загрузить';
            customButton1.style.width='110px';


            const PizZip = require("pizzip");
const { DOMParser } = require("@xmldom/xmldom");
const fs = require("fs");
const path = require("path");

function str2xml(str:any) {
    if (str.charCodeAt(0) === 65279) {
        // BOM sequence
        str = str.substr(1);
    }
    return new DOMParser().parseFromString(str, "text/xml");
}

function getParagraphs(content:any) {
    const zip = new PizZip(content);
    const xml = str2xml(zip.files["word/document.xml"].asText());
   
    const paragraphsXml = xml.getElementsByTagName("w:p");
    const paragraphs = [];

    for (let i = 0, len = paragraphsXml.length; i < len; i++) {
        let fullText = "";
        const textsXml =
            paragraphsXml[i].getElementsByTagName("w:t");
        for (let j = 0, len2 = textsXml.length; j < len2; j++) {
            const textXml = textsXml[j];
            if (textXml.childNodes) {
                fullText += textXml.childNodes[0].nodeValue;
            }
        }

        paragraphs.push(fullText);
    }
    return paragraphs;
}

            
            function loadFile(url:string, callback:any) {
                PizZipUtils.getBinaryContent(url, callback);
            }
            function gettext(fpath:string) {
                loadFile(
                    fpath,
                    function (error:object, content:any) {
                        if (error) {
                            throw error;
                        }
                        var zip = new PizZip(content);
                      /*  var doc = new Docxtemplater();
                       doc.loadZip(zip);
                       
                        var text = doc.getFullText();
                        console.log(zip.files["word/document.xml"]);
                        
                     //   saveAs(zip.files["word/document.xml"], 'exportxml.docx');*/
                    const xml = str2xml(zip.files["word/document.xml"].asText());
                     console.log(xml);
                 
                    
                     const paragraphsXml = xml.getElementsByTagName("w:p");
                     const paragraphs = [];
                     const qleditor = document.getElementsByClassName("ql-editor")[0]
                     qleditor.innerHTML = '';

                     
                     for (let i = 0, len = paragraphsXml.length; i < len; i++) {
                         let fullText = "";
                         
                         const textsXml =
                             paragraphsXml[i].getElementsByTagName("w:t");
                         for (let j = 0, len2 = textsXml.length; j < len2; j++) {
                             const textXml = textsXml[j];
                             if (textXml.childNodes) {
                                 fullText += textXml.childNodes[0].nodeValue;
                              
                                
                             }
                         }
                        
                         paragraphs.push(fullText);
                     }

                     for(let i = 0; i< paragraphs.length; i++){
                        qleditor.innerHTML += "\n" + paragraphs[i];
                        }
                   
                    }
                );
            }
let mammoth = require("mammoth");
            
  customButton1.addEventListener('change', (event) => {
    const file = (event.target as HTMLInputElement).files![0];
    console.log(file.name);
    console.time();
    var reader = new FileReader();
    reader.onloadend = function(event) {
      var arrayBuffer = reader.result;
      // debugger
let result1:any
let result2:any
let result3:any

      mammoth.convertToHtml({arrayBuffer: arrayBuffer}).then(function (resultObject:any) {
        result1.innerHTML = resultObject.value
        console.log(resultObject.value)
      })
      .catch((error:any) => {
        // Handle the error.
        
        console.log(error);
        });
      console.timeEnd();

      mammoth.extractRawText({arrayBuffer: arrayBuffer}).then(function (resultObject:any) {
        result2.innerHTML = resultObject.value
        console.log(resultObject.value)
      })
      .catch((error:any) => {
        // Handle the error.
        
        console.log(error);
        });
      mammoth.convertToMarkdown({arrayBuffer: arrayBuffer}).then(function (resultObject:any) {
        result3.innerHTML = resultObject.value
        console.log(resultObject.value)
      })
      .catch((error:any) => {
        // Handle the error.
        
        console.log(error);
        });
    };

    reader.readAsArrayBuffer(file);
  });

  
      //     customButton1.addEventListener('change', function (e) {
/*
            const filename="C:\защита проекта\что говорить.docx";
            const content = readFileSync(join(__dirname, filename), 'utf-8');
            
            const Docxtemplater = require("docxtemplater");
            const PizZip = require("pizzip");
            const zip = new PizZip(content);
            const docum = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            
            const text = docum.getFullText();

            q.clipboard.dangerouslyPasteHTML(text);
*/
            
        //        const target:any= e.target;
           //     let file = (target.files as FileList)[0];  // первый элемент массива файлов	
              //  alert (target.path);

              
           // gettext(window.URL.createObjectURL(file));
         //  parseWordDocxFile(file);


     /* console.log(window.URL.createObjectURL(file));

      const content = fs.readFileSync(
        file.name,
        "binary"
    );
 
      getParagraphs(content);*/
               /* var reader = new FileReader();
                reader.readAsArrayBuffer(file);
                // при успешном завершении операции чтения
                reader.onload = (function (file) {
                    return function (e) {
                        var r = target;
                        // получаем содержимое файла, состояние чтения, ошибки(или null)
                        //console.log(r.result, r.readyState, r.error);
                        console.log(reader.result);


                
                        const Docxtemplater = require("docxtemplater");
                        const PizZip = require("pizzip");
                        const zip = new PizZip(reader.result);
                        const docum = new Docxtemplater(zip, {
                            paragraphLoop: true,
                            linebreaks: true,
                        });
                        
                        const text = docum.getFullText();

                        q.clipboard.dangerouslyPasteHTML(text);
                    };
                })(file);*/
            

                
           /*     reader.onload = function (e) {
                    var arrayBuffer:any = reader.result;
            
                    var blob = new Blob([new Uint8Array(arrayBuffer)]);
                    var url = URL.createObjectURL(blob);
            
                    fetch(url)
                        .then(response => response.text())
                        .then(html => {
                            q.clipboard.dangerouslyPasteHTML(html);
                        })
                        .catch(error => console.error('Ошибка:', error));
                };
            
                reader.readAsArrayBuffer(file);*/

              /*  var reader = new FileReader();

    reader.onload = function (e) {
        var arrayBuffer:any = reader.result;

        var blob = new Blob([new Uint8Array(arrayBuffer)]);
        var url = URL.createObjectURL(blob);

        mammoth.extractRawText(url as any)
            .then(function(result){
                var text = result.value; 
                q.clipboard.dangerouslyPasteHTML(text);
            })
            .catch(function(err){
                console.log(err);
            });
    };

    reader.readAsArrayBuffer(file);*/
           
      //  });
    
                customButton1.classList.add(
                    'ql-align', 
                    'ql-picker', 
                    'ql-icon-picker',
                    'ql-save'
                );
                posButton1.appendChild(customButton1);



// Add the button to your desired location in the DOM
const doc = document.getElementById("container");
if (doc?.hasChildNodes){
   const panel = doc.getElementsByTagName('div')[0];
   panel.appendChild(posButton);
   panel.appendChild(posButton1);
    }
    }, [])

   //const qleditor = document.getElementsByClassName("ql-editor")[0];
    
   //qleditor.i


    return(
        <div className="container" ref={wrapperRef}></div>
    )
}

function defineProps<T>() {
    throw new Error('Function not implemented.');
}


function toRefs(setItemRef: any) {
    throw new Error('Function not implemented.');
}


function base64DataURLToArrayBuffer(chartId: any) {
    throw new Error('Function not implemented.');
}


function gettext(arg0: string) {
    throw new Error('Function not implemented.');
}
